// controllers/categoryController.js

const categoryService = require('../services/categoryService');

exports.createCategory = async (req, res) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || 'Failed to create category' });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories(req.query);
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve categories' });
  }
};

exports.getCategoryById = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const category = await categoryService.getCategoryById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve category' });
  }
};

exports.updateCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const category = await categoryService.updateCategory(categoryId, req.body);
    res.status(200).json({ message: 'Category updated successfully', category });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || 'Failed to update category' });
  }
};

exports.deleteCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const category = await categoryService.deleteCategory(categoryId);
    res.status(200).json({ message: 'Category deleted successfully', category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete category' });
  }
};

exports.reorderCategories = async (req, res) => {
  try {
    // req.body should contain an array of { id, orderNo } objects
    const updatedCategories = await categoryService.reorderCategories(req.body);
    res.status(200).json({ 
      message: 'Categories reordered successfully', 
      categories: updatedCategories 
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message || 'Failed to reorder categories' });
  }
};
