// routes/saleRoutes.js

const express = require('express');
const saleController = require('../controllers/saleController');
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();

// Create a new sale
router.post('/',authMiddleware.isAuthenticated,authMiddleware.checkRoleOrPermission('CREATE_SALE'), saleController.createSale);

// Get a sale by ID
router.get('/:id',authMiddleware.isAuthenticated,authMiddleware.checkRoleOrPermission('READ_SALE'), saleController.getSaleById);

// Get all sales
router.get('/',authMiddleware.isAuthenticated,authMiddleware.checkRoleOrPermission('READ_SALE'), saleController.getAllSales);

// Update a sale by ID
router.put('/:id',authMiddleware.isAuthenticated,authMiddleware.checkRoleOrPermission('UPDATE_SALE'), saleController.updateSale);

// Delete a sale by ID
router.delete('/:id',authMiddleware.isAuthenticated,authMiddleware.checkRoleOrPermission('DELETE_SALE'), saleController.deleteSale);

module.exports = router;
