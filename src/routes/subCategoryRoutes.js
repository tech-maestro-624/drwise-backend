// routes/subCategoryRoutes.js

const express = require('express');
const router = express.Router();
const subCategoryController = require('../controllers/subCategoryController');
const { isAuthenticated, checkRoleOrPermission } = require('../middleware/authMiddleware');

// Route to create a new SubCategory
router.post('/', isAuthenticated, checkRoleOrPermission('CREATE_SUBCATEGORY'), subCategoryController.createSubCategory);

// Route to get all SubCategories with pagination and filtering
router.get('/', isAuthenticated, checkRoleOrPermission('READ_SUBCATEGORY'), subCategoryController.getSubCategories);

// Route to get a single SubCategory by ID
router.get('/:id', isAuthenticated, checkRoleOrPermission('READ_SUBCATEGORY'), subCategoryController.getSubCategoryById);

// Route to update a SubCategory by ID
router.put('/:id', isAuthenticated, checkRoleOrPermission('UPDATE_SUBCATEGORY'), subCategoryController.updateSubCategory);

// Route to delete a SubCategory by ID
router.delete('/:id', isAuthenticated, checkRoleOrPermission('DELETE_SUBCATEGORY'), subCategoryController.deleteSubCategory);

// Route to reorder SubCategories
router.post('/reorder', isAuthenticated, checkRoleOrPermission('UPDATE_SUBCATEGORY'), subCategoryController.reorderSubCategories);

module.exports = router;
