const reportService = require('../services/reportService');

// Create a new generic report
const createReport = async (req, res) => {
  try {
    const report = await reportService.createReport({
      ...req.body,
      createdBy: req.user._id
    });
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all reports with pagination and filtering
const getReports = async (req, res) => {
  try {
    const result = await reportService.getReports(req.query);
    res.status(200).json({
      success: true,
      data: result.reports,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get a report by ID
const getReportById = async (req, res) => {
  try {
    const report = await reportService.getReportById(req.params.id);
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// Delete a report
const deleteReport = async (req, res) => {
  try {
    await reportService.deleteReport(req.params.id);
    res.status(200).json({ 
      success: true, 
      message: 'Report deleted successfully' 
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Generate a transaction report
const generateTransactionReport = async (req, res) => {
  try {
    const reportData = {
      ...req.body,
      userId: req.user._id
    };
    
    const report = await reportService.generateTransactionReport(reportData);
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Generate a sales report
const generateSalesReport = async (req, res) => {
  try {
    const reportData = {
      ...req.body,
      userId: req.user._id
    };
    
    const report = await reportService.generateSalesReport(reportData);
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Generate a leads report
const generateLeadsReport = async (req, res) => {
  try {
    const reportData = {
      ...req.body,
      userId: req.user._id
    };
    
    const report = await reportService.generateLeadsReport(reportData);
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Generate a payment report
const generatePaymentReport = async (req, res) => {
  try {
    const reportData = {
      ...req.body,
      userId: req.user._id
    };
    
    const report = await reportService.generatePaymentReport(reportData);
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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