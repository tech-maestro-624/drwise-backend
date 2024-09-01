// services/categoryService.js

const Category = require('../models/Category');

async function createCategory(name, description) {
  const category = new Category({ name, description });
  await category.save();
  return category;
}

async function getAllCategories() {
  return Category.find({});
}

async function getCategoryById(categoryId) {
  return Category.findById(categoryId);
}

async function updateCategory(categoryId, name, description) {
  const category = await Category.findByIdAndUpdate(categoryId, { name, description }, { new: true });
  if (!category) {
    throw new Error('Category not found');
  }
  return category;
}

async function deleteCategory(categoryId) {
  const category = await Category.findByIdAndDelete(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }
  return category;
}

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
