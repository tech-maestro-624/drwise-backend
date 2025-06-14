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
router.get('/:productId',isAuthenticated,
    // checkRoleOrPermission('READ_PRODUCT'), 
    productController.getProductById);
router.put('/:productId', isAuthenticated, checkRoleOrPermission('UPDATE_PRODUCT'), productController.updateProduct);
router.delete('/:productId', isAuthenticated, checkRoleOrPermission('DELETE_PRODUCT'), productController.deleteProduct);
router.get('/category/:categoryId',isAuthenticated,  
    // checkRoleOrPermission('READ_PRODUCT'), 
    productController.getProductsByCategoryId); // New route
router.get('/product/:id', isAuthenticated, 
    // checkRoleOrPermission('READ_PRODUCT'), 
    productController.getProductsBySubCategory); // New route


module.exports = router;
