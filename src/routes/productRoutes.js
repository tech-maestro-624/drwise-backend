// routes/productRoutes.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const {isAuthenticated,checkRoleOrPermission} = require('../middleware/authMiddleware');

// Product management routes
router.post('/',isAuthenticated, checkRoleOrPermission("CREATE_PRODUCT"), productController.createProduct);
router.get('/',isAuthenticated,
    // checkRoleOrPermission("READ_PRODUCT"),
    productController.getAllProducts);

// Specific routes (must come before parameterized routes)
router.get('/search', isAuthenticated,
    // checkRoleOrPermission('READ_PRODUCT'),
    productController.searchProducts);
router.get('/category/:categoryId',isAuthenticated,
    // checkRoleOrPermission('READ_PRODUCT'),
    productController.getProductsByCategoryId);
router.get('/product/:id', isAuthenticated,
    // checkRoleOrPermission('READ_PRODUCT'),
    productController.getProductsBySubCategory);

// Parameterized routes (come after specific routes)
router.get('/:productId',isAuthenticated,
    // checkRoleOrPermission('READ_PRODUCT'),
    productController.getProductById);
router.put('/:productId', isAuthenticated, checkRoleOrPermission('UPDATE_PRODUCT'), productController.updateProduct);
router.delete('/:productId', isAuthenticated, checkRoleOrPermission('DELETE_PRODUCT'), productController.deleteProduct);

module.exports = router;
