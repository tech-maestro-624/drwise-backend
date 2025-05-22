const Report = require('../models/Report');
const Transaction = require('../models/Transaction');
const Sale = require('../models/Sale');
const Lead = require('../models/Lead');
const Wallet = require('../models/Wallet');
const User = require('../models/User');
const mongoose = require('mongoose');

// Generic function to create a report
const createReport = async (reportData) => {
  try {
    const report = new Report(reportData);
    await report.save();
    return report;
  } catch (error) {
    throw error;
  }
};

// Get reports with pagination and filtering
const getReports = async (query = {}) => {
  try {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {};
    
    if (query.type) {
      filter.type = query.type;
    }
    
    if (query.createdBy) {
      filter.createdBy = query.createdBy;
    }
    
    if (query.startDate && query.endDate) {
      filter.createdAt = {
        $gte: new Date(query.startDate),
        $lte: new Date(query.endDate)
      };
    }
    
    const totalItems = await Report.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);
    
    const reports = await Report.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    return {
      reports,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit
      }
    };
  } catch (error) {
    throw error;
  }
};

// Get a report by ID
const getReportById = async (id) => {
  try {
    const report = await Report.findById(id).populate('createdBy', 'name email');
    
    if (!report) {
      throw new Error('Report not found');
    }
    
    return report;
  } catch (error) {
    throw error;
  }
};

// Delete a report
const deleteReport = async (id) => {
  try {
    const report = await Report.findByIdAndDelete(id);
    
    if (!report) {
      throw new Error('Report not found');
    }
    
    return report;
  } catch (error) {
    throw error;
  }
};

// Generate a transaction report (paid withdrawals with duration)
const generateTransactionReport = async (reportData) => {
  try {
    const { startDate, endDate, filters = {}, userId } = reportData;
    
    // Create filter for transactions
    const transactionFilter = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      type: 'debit', // Withdrawals are debits
      status: 'approved' // Only approved transactions
    };
    
    // Add any additional filters from the request
    if (filters.minAmount) {
      transactionFilter.amount = { $gte: parseFloat(filters.minAmount) };
    }
    
    if (filters.maxAmount) {
      transactionFilter.amount = {
        ...transactionFilter.amount,
        $lte: parseFloat(filters.maxAmount)
      };
    }
    
    if (filters.userId) {
      transactionFilter.userId = mongoose.Types.ObjectId(filters.userId);
    }
    
    // Get transactions matching the filter
    const transactions = await Transaction.find(transactionFilter)
      .populate('userId', 'name email')
      .populate('wallet')
      .sort({ date: -1 });
    
    // Calculate summary data
    const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalCount = transactions.length;
    const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;
    
    // Create the report
    const report = await createReport({
      name: `Transaction Report ${new Date().toISOString().split('T')[0]}`,
      type: 'transaction',
      description: `Paid withdrawal transactions from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
      dateRange: { startDate, endDate },
      createdBy: userId,
      filters: transactionFilter,
      data: transactions,
      summary: {
        totalAmount,
        totalCount,
        avgAmount,
        period: `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
      },
      status: 'completed'
    });
    
    return report;
  } catch (error) {
    throw error;
  }
};

// Generate a sales report with time period breakdown
const generateSalesReport = async (reportData) => {
  try {
    const { startDate, endDate, filters = {}, userId, periodicity = 'monthly' } = reportData;
    
    // Create filter for sales
    const salesFilter = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    // Add any additional filters
    if (filters.productId) {
      salesFilter.productId = mongoose.Types.ObjectId(filters.productId);
    }
    
    if (filters.userId) {
      salesFilter.userId = mongoose.Types.ObjectId(filters.userId);
    }
    
    // Get sales matching the filter
    const sales = await Sale.find(salesFilter)
      .populate('userId', 'name email')
      .populate('productId', 'name price')
      .sort({ createdAt: -1 });
    
    // Group sales by time period (daily, weekly, monthly, yearly)
    let salesByPeriod = {};
    
    sales.forEach(sale => {
      let periodKey;
      const saleDate = new Date(sale.createdAt);
      
      switch (periodicity) {
        case 'daily':
          periodKey = saleDate.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(saleDate);
          weekStart.setDate(saleDate.getDate() - saleDate.getDay());
          periodKey = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          periodKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'yearly':
          periodKey = saleDate.getFullYear().toString();
          break;
        default:
          periodKey = saleDate.toISOString().split('T')[0];
      }
      
      if (!salesByPeriod[periodKey]) {
        salesByPeriod[periodKey] = {
          count: 0,
          amount: 0,
          sales: []
        };
      }
      
      salesByPeriod[periodKey].count += 1;
      salesByPeriod[periodKey].amount += sale.amount || 0;
      salesByPeriod[periodKey].sales.push(sale);
    });
    
    // Calculate summary data
    const totalAmount = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0);
    const totalCount = sales.length;
    const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;
    
    // Create the report
    const report = await createReport({
      name: `Sales Report ${new Date().toISOString().split('T')[0]}`,
      type: 'sale',
      description: `Sales report from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()} (${periodicity})`,
      dateRange: { startDate, endDate },
      createdBy: userId,
      filters: { ...salesFilter, periodicity },
      data: {
        rawSales: sales,
        salesByPeriod
      },
      summary: {
        totalAmount,
        totalCount,
        avgAmount,
        periodicity,
        period: `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
      },
      status: 'completed'
    });
    
    return report;
  } catch (error) {
    throw error;
  }
};

// Generate a leads report
const generateLeadsReport = async (reportData) => {
  try {
    const { startDate, endDate, filters = {}, userId } = reportData;
    
    // Create filter for leads
    const leadsFilter = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    // Add any additional filters
    if (filters.status) {
      leadsFilter.status = filters.status;
    }
    
    if (filters.referrer) {
      leadsFilter.referrer = filters.referrer;
    }
    
    if (filters.categoryId) {
      leadsFilter.categoryId = mongoose.Types.ObjectId(filters.categoryId);
    }
    
    if (filters.productId) {
      leadsFilter.productId = mongoose.Types.ObjectId(filters.productId);
    }
    
    // Get leads matching the filter
    const leads = await Lead.find(leadsFilter)
      .populate('categoryId', 'name')
      .populate('productId', 'name')
      .sort({ createdAt: -1 });
    
    // Group leads by status
    const leadsByStatus = leads.reduce((acc, lead) => {
      const status = lead.status || 'unknown';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(lead);
      return acc;
    }, {});
    
    // Calculate summary data
    const totalLeads = leads.length;
    const statusCounts = Object.keys(leadsByStatus).reduce((acc, status) => {
      acc[status] = leadsByStatus[status].length;
      return acc;
    }, {});
    
    // Create the report
    const report = await createReport({
      name: `Leads Report ${new Date().toISOString().split('T')[0]}`,
      type: 'lead',
      description: `Leads report from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
      dateRange: { startDate, endDate },
      createdBy: userId,
      filters: leadsFilter,
      data: {
        rawLeads: leads,
        leadsByStatus
      },
      summary: {
        totalLeads,
        statusCounts,
        period: `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
      },
      status: 'completed'
    });
    
    return report;
  } catch (error) {
    throw error;
  }
};

// Generate a payment report with dynamic fields
const generatePaymentReport = async (reportData) => {
  try {
    const { startDate, endDate, filters = {}, userId, dynamicFields = [] } = reportData;
    
    // Create filter for transactions that are payments
    const paymentFilter = {
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      type: { $ne: 'debit' } // All non-debit transactions are considered payments/credits
    };
    
    // Add any additional filters
    if (filters.status) {
      paymentFilter.status = filters.status;
    }
    
    if (filters.type) {
      paymentFilter.type = filters.type;
    }
    
    if (filters.minAmount) {
      paymentFilter.amount = { $gte: parseFloat(filters.minAmount) };
    }
    
    if (filters.maxAmount) {
      paymentFilter.amount = {
        ...paymentFilter.amount,
        $lte: parseFloat(filters.maxAmount)
      };
    }
    
    // Get payments matching the filter
    const payments = await Transaction.find(paymentFilter)
      .populate('userId', 'name email')
      .populate('wallet')
      .sort({ date: -1 });
    
    // Process dynamic fields
    const processedFields = dynamicFields.map(field => {
      let fieldValue;
      
      switch (field.name.toLowerCase()) {
        case 'total_amount':
          fieldValue = payments.reduce((sum, payment) => sum + payment.amount, 0);
          return { name: field.name, value: fieldValue, type: 'number' };
        
        case 'average_amount':
          fieldValue = payments.length > 0 
            ? payments.reduce((sum, payment) => sum + payment.amount, 0) / payments.length 
            : 0;
          return { name: field.name, value: fieldValue, type: 'number' };
        
        case 'payment_types':
          fieldValue = payments.reduce((acc, payment) => {
            const type = payment.type;
            if (!acc[type]) {
              acc[type] = 0;
            }
            acc[type]++;
            return acc;
          }, {});
          return { name: field.name, value: fieldValue, type: 'object' };
        
        case 'payment_statuses':
          fieldValue = payments.reduce((acc, payment) => {
            const status = payment.status;
            if (!acc[status]) {
              acc[status] = 0;
            }
            acc[status]++;
            return acc;
          }, {});
          return { name: field.name, value: fieldValue, type: 'object' };
        
        case 'user_payments':
          fieldValue = payments.reduce((acc, payment) => {
            const userId = payment.userId?._id?.toString() || 'unknown';
            const userName = payment.userId?.name || 'Unknown User';
            
            if (!acc[userId]) {
              acc[userId] = { 
                user: userName, 
                count: 0, 
                totalAmount: 0 
              };
            }
            
            acc[userId].count++;
            acc[userId].totalAmount += payment.amount;
            return acc;
          }, {});
          return { name: field.name, value: fieldValue, type: 'object' };
        
        default:
          return { name: field.name, value: null, type: 'string' };
      }
    });
    
    // Calculate summary data
    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalCount = payments.length;
    const avgAmount = totalCount > 0 ? totalAmount / totalCount : 0;
    
    // Create the report
    const report = await createReport({
      name: `Payment Report ${new Date().toISOString().split('T')[0]}`,
      type: 'payment',
      description: `Payment report from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
      dateRange: { startDate, endDate },
      createdBy: userId,
      filters: paymentFilter,
      data: payments,
      summary: {
        totalAmount,
        totalCount,
        avgAmount,
        period: `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
      },
      dynamicFields: processedFields,
      status: 'completed'
    });
    
    return report;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  deleteReport,
  generateTransactionReport,
  generateSalesReport,
  generateLeadsReport,
  generatePaymentReport
}; 