// services/categoryService.js

const Category = require('../models/Category');

async function createCategory(categoryData) {
  try {
    // If orderNo is not provided, find the highest orderNo and add 1
    if (!categoryData.orderNo) {
      const highestOrderCategory = await Category.findOne().sort('-orderNo');
      categoryData.orderNo = highestOrderCategory ? highestOrderCategory.orderNo + 1 : 1;
    } else {
      // Check if the orderNo is already in use
      const existingCategory = await Category.findOne({ orderNo: categoryData.orderNo });
      if (existingCategory) {
        throw new Error(`Order number ${categoryData.orderNo} is already in use`);
      }
    }
    
    const category = new Category(categoryData);
    await category.save();
    return category;
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.orderNo) {
      throw new Error(`Order number ${categoryData.orderNo} is already in use`);
    }
    throw error;
  }
}

async function getAllCategories(query = {}) {
  return Category.find(query).sort({ orderNo: 1 });
}

async function getCategoryById(categoryId) {
  return Category.findById(categoryId);
}

async function updateCategory(categoryId, categoryData) {
  try {
    // If changing orderNo, check if it's already in use by another category
    if (categoryData.orderNo !== undefined) {
      const existingCategory = await Category.findOne({ 
        orderNo: categoryData.orderNo,
        _id: { $ne: categoryId }
      });
      
      if (existingCategory) {
        throw new Error(`Order number ${categoryData.orderNo} is already in use`);
      }
    }
    
    const category = await Category.findByIdAndUpdate(
      categoryId, 
      categoryData, 
      { new: true, runValidators: true }
    );
    
    if (!category) {
      throw new Error('Category not found');
    }
    
    return category;
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.orderNo) {
      throw new Error(`Order number ${categoryData.orderNo} is already in use`);
    }
    throw error;
  }
}

async function deleteCategory(categoryId) {
  const category = await Category.findByIdAndDelete(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }
  return category;
}

async function reorderCategories(orderData) {
  // orderData should be an array of { id, orderNo } objects
  const session = await Category.startSession();
  session.startTransaction();
  
  try {
    const updatePromises = orderData.map(item => 
      Category.findByIdAndUpdate(
        item.id,
        { orderNo: item.orderNo },
        { new: true, session }
      )
    );
    
    const results = await Promise.all(updatePromises);
    await session.commitTransaction();
    session.endSession();
    
    return results;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
}

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  reorderCategories
};
