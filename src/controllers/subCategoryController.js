// controllers/subCategoryController.js

const subCategoryService = require('../services/subCategoryService');

// Create a new SubCategory
const createSubCategory = async (req, res) => {
  try {
    const data = req.body;
    const subCategory = await subCategoryService.create(data);
    res.status(201).json({
      success: true,
      data: subCategory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get SubCategories with pagination and filtering
const getSubCategories = async (req, res) => {
  try {
    const result = await subCategoryService.get(req.query);
    res.status(200).json({
      success: true,
      data: result.subcategories,
      pagination: {
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a single SubCategory by ID
const getSubCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const subCategory = await subCategoryService.getSubCategoryById(id);
    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: 'SubCategory not found',
      });
    }
    res.status(200).json({
      success: true,
      data: subCategory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update a SubCategory by ID
const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updatedSubCategory = await subCategoryService.update(id, data);
    if (!updatedSubCategory) {
      return res.status(404).json({
        success: false,
        message: 'SubCategory not found',
      });
    }
    res.status(200).json({
      success: true,
      data: updatedSubCategory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete a SubCategory by ID
const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSubCategory = await subCategoryService.deleteSubCategory(id);
    if (!deletedSubCategory) {
      return res.status(404).json({
        success: false,
        message: 'SubCategory not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'SubCategory deleted successfully',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Reorder SubCategories
const reorderSubCategories = async (req, res) => {
  try {
    // req.body should contain an array of { id, orderNo } objects
    const updatedSubCategories = await subCategoryService.reorderSubCategories(req.body);
    res.status(200).json({
      success: true,
      message: 'SubCategories reordered successfully',
      data: updatedSubCategories
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createSubCategory,
  getSubCategories,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  reorderSubCategories
};
