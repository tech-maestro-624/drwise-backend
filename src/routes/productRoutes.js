// routes/productRoutes.js

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

// Product management routes
router.post('/', authMiddleware.checkRoleOrPermission("CREATE_PRODUCT"), productController.createProduct);
router.get('/',authMiddleware.checkRoleOrPermission("READ_PRODUCT"), productController.getAllProducts);
router.get('/:productId',authMiddleware.checkRoleOrPermission('READ_PRODUCT'), productController.getProductById);
router.put('/:productId', authMiddleware.checkRoleOrPermission('UPDATE_PRODUCT'), productController.updateProduct);
router.delete('/:productId', authMiddleware.checkRoleOrPermission('DELETE_PRODUCT'), productController.deleteProduct);
router.get('/category/:categoryId', authMiddleware.checkRoleOrPermission('READ_PRODUCT'), productController.getProductsByCategoryId); // New route
router.get('/product/:id', authMiddleware.checkRoleOrPermission('READ_PRODUCT'), productController.getProductsBySubCategory); // New route


module.exports = router;
