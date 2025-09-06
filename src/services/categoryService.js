// services/categoryService.js

const Category = require('../models/Category');
const cacheService = require('./cacheService');

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

    // Invalidate cache for all categories list
    await cacheService.deleteByPattern('categories:all:*');

    return category;
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.orderNo) {
      throw new Error(`Order number ${categoryData.orderNo} is already in use`);
    }
    throw error;
  }
}

async function getAllCategories(query = {}) {
  const cacheKey = `categories:all:${JSON.stringify(query)}`;

  return await cacheService.getOrSet(
    cacheKey,
    async () => {
      return await Category.find(query).sort({ orderNo: 1 });
    },
    1800 // 30 minutes TTL
  );
}

async function getCategoryById(categoryId) {
  const cacheKey = `categories:id:${categoryId}`;

  return await cacheService.getOrSet(
    cacheKey,
    async () => {
      return await Category.findById(categoryId);
    },
    1800 // 30 minutes TTL
  );
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

    // Invalidate cache for this specific category and all categories list
    await cacheService.delete(`categories:id:${categoryId}`);
    await cacheService.deleteByPattern('categories:all:*');

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

  // Invalidate cache for this specific category and all categories list
  await cacheService.delete(`categories:id:${categoryId}`);
  await cacheService.deleteByPattern('categories:all:*');

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

    // Invalidate cache for all categories list and individual categories
    await cacheService.deleteByPattern('categories:all:*');
    const invalidatePromises = orderData.map(item =>
      cacheService.delete(`categories:id:${item.id}`)
    );
    await Promise.all(invalidatePromises);

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
