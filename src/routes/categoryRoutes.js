// routes/categoryRoutes.js

const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const {isAuthenticated,checkRoleOrPermission} = require('../middleware/authMiddleware');

// Category management routes
router.post('/',isAuthenticated, checkRoleOrPermission('CREATE_CATEGORY'), categoryController.createCategory);
router.get('/',isAuthenticated,
    // checkRoleOrPermission('READ_CATEGORY'), 
    categoryController.getAllCategories);
router.get('/:categoryId',isAuthenticated,
    // checkRoleOrPermission('READ_CATEGORY'), 
    categoryController.getCategoryById);
router.put('/:categoryId',isAuthenticated,
    // checkRoleOrPermission('UPDATE_CATEGORY'), 
    categoryController.updateCategory);
router.delete('/:categoryId', isAuthenticated,
    // checkRoleOrPermission('DELETE_CATEGORY'), 
    categoryController.deleteCategory);
router.post('/reorder', isAuthenticated, 
    // checkRoleOrPermission('UPDATE_CATEGORY'), 
    categoryController.reorderCategories);

module.exports = router;
