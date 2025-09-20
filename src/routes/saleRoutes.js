// routes/saleRoutes.js

const express = require('express');
const saleController = require('../controllers/saleController');
const {isAuthenticated, checkRoleOrPermission} = require('../middleware/authMiddleware')
const router = express.Router();

// Create a new sale
router.post('/',isAuthenticated, checkRoleOrPermission('CREATE_SALE'), saleController.createSale);

// Get a sale by ID
router.get('/:id',isAuthenticated, checkRoleOrPermission('READ_SALE'), saleController.getSaleById);

// Get all sales
router.get('/',isAuthenticated, checkRoleOrPermission('READ_SALE'), saleController.getAllSales);

// Update a sale by ID
router.put('/:id',isAuthenticated, checkRoleOrPermission('UPDATE_SALE'), saleController.updateSale);

// Delete a sale by ID
router.delete('/:id',isAuthenticated, checkRoleOrPermission('DELETE_SALE'), saleController.deleteSale);

// Convert a lead to a sale
router.post('/convert-lead/:leadId',isAuthenticated, checkRoleOrPermission('CREATE_SALE'), saleController.convertLeadToSale);

module.exports = router;
