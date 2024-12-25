// routes/subCategoryRoutes.js

const express = require('express');
const router = express.Router();
const subCategoryController = require('../controllers/subCategoryController');

// Route to create a new SubCategory
router.post('/', subCategoryController.createSubCategory);

// Route to get all SubCategories with pagination and filtering
router.get('/', subCategoryController.getSubCategories);

// Route to get a single SubCategory by ID
router.get('/:id', subCategoryController.getSubCategoryById);

// Route to update a SubCategory by ID
router.put('/:id', subCategoryController.updateSubCategory);

// Route to delete a SubCategory by ID
router.delete('/:id', subCategoryController.deleteSubCategory);

module.exports = router;
