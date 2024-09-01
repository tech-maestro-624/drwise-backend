// routes/categoryRoutes.js

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

// Category management routes
router.post('/',authMiddleware.checkRoleOrPermission('CREATE_CATEGORY'), categoryController.createCategory);
router.get('/',authMiddleware.checkRoleOrPermission('READ_CATEGORY'), categoryController.getAllCategories);
router.get('/:categoryId',authMiddleware.checkRoleOrPermission('READ_CATEGORY'), categoryController.getCategoryById);
router.put('/:categoryId',authMiddleware.checkRoleOrPermission('UPDATE_CATEGORY'), categoryController.updateCategory);
router.delete('/:categoryId', authMiddleware.checkRoleOrPermission('DELETE_CATEGORY'), categoryController.deleteCategory);

module.exports = router;
