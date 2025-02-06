// controllers/saleController.js

const saleService = require('../services/saleService');

// Create a new sale
async function createSale(req, res) {
  try {
    const sale = await saleService.createSale(req.body);
    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get a sale by ID
async function getSaleById(req, res) {
  try {
    const sale = await saleService.getSaleById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get all sales
async function getAllSales(req, res) {
  console.log(req.query);
  
  try {
    const sales = await saleService.getAllSales(req.query);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Update a sale by ID
async function updateSale(req, res) {
  try {
    const sale = await saleService.updateSale(req.params.id, req.body);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Delete a sale by ID
async function deleteSale(req, res) {
  try {
    const sale = await saleService.deleteSale(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  createSale,
  getSaleById,
  getAllSales,
  updateSale,
  deleteSale,
};
