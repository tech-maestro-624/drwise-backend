// services/saleService.js

const Sale = require('../models/Sale');

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

module.exports = {
  createSale,
  getSaleById,
  getAllSales,
  updateSale,
  deleteSale,
};
