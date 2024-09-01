// services/saleService.js

const Sale = require('../models/Sale');

// Create a new sale
async function createSale(data) {
  console.log(data);
  
  const sale = new Sale(data);
  return await sale.save();
}

// Get a sale by ID
async function getSaleById(id) {
  return await Sale.findById(id).populate('lead product referrer');
}

// Get all sales
async function getAllSales() {
  return await Sale.find().populate('lead referrer');
}

// Update a sale by ID
async function updateSale(id, data) {
  return await Sale.findByIdAndUpdate(id, data, { new: true });
}

// Delete a sale by ID
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
