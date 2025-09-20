// services/saleService.js

const Sale = require('../models/Sale');
const Lead = require('../models/Lead');

// Create a new sale
async function createSale(data) {
  const sale = new Sale(data);
  return await sale.save();
}

// Get a sale by ID
async function getSaleById(id) {
  return await Sale.findById(id).populate('lead product referrer');
}

// Get all sales
// async function getAllSales() {
  
//   return await Sale.find().populate('lead referrer product');
// }

 async function getAllSales(query = {}) {
  try {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const skip = (page - 1) * limit;

      // Parse and validate condition if provided
      if (query.condition && typeof(query.condition) !== 'object') {
          try {
              query = JSON.parse(query.condition);
          } catch (error) {
              throw new Error("Invalid condition format");
          }
      }

      const sales = await Sale.find(query.condition)
                              .skip(skip)
                              .limit(limit)
                              .sort({ createdAt: -1 })
                              .populate('lead referrer product categoryId');
      
      const total = await Sale.countDocuments(query.condition);
      return {
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          sales
      };
  } catch (error) {
      throw error;
  }
}


async function updateSale(id, data) {
  return await Sale.findByIdAndUpdate(id, data, { new: true });
}

async function deleteSale(id) {
  return await Sale.findByIdAndDelete(id);
}

// Convert a lead to a sale with proper transaction linking
async function convertLeadToSale(leadId, saleData) {
  try {
    // Find the lead by MongoDB ID
    const lead = await Lead.findById(leadId).populate('productId referrer categoryId');
    
    if (!lead) {
      throw new Error('Lead not found');
    }

    if (lead.status === 'Converted') {
      throw new Error('Lead has already been converted to a sale');
    }

    // Create the sale with lead information and provided sale data
    const salePayload = {
      leadId: lead.leadId, // Use the custom leadId
      lead: lead._id,
      product: lead.productId._id,
      productId: lead.productId._id,
      categoryId: lead.categoryId._id,
      referrer: lead.referrer._id,
      price: saleData.price || lead.productId.estimatedPrice || 0,
      referralBonus: saleData.referralBonus || 0,
      conversionDate: new Date(),
      ...saleData
    };

    // Create the sale (transactionId will be auto-generated)
    const sale = new Sale(salePayload);
    const savedSale = await sale.save();

    // Update the lead status to 'Converted' and link the transaction ID
    await Lead.findByIdAndUpdate(leadId, {
      status: 'Converted',
      transactionId: savedSale.transactionId
    });

    // Return the sale with populated fields
    return await Sale.findById(savedSale._id)
      .populate('lead product referrer categoryId');

  } catch (error) {
    throw new Error(`Failed to convert lead to sale: ${error.message}`);
  }
}

module.exports = {
  createSale,
  getSaleById,
  getAllSales,
  updateSale,
  deleteSale,
  convertLeadToSale,
};
