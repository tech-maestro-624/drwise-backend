const SubCategory = require('../models/SubCategory')

async function create(data) {
  try {
    // If orderNo is not provided, find the highest orderNo for the parent category and add 1
    if (!data.orderNo) {
      const highestOrderSubCategory = await SubCategory.findOne({ 
        parentCategory: data.parentCategory 
      }).sort('-orderNo');
      data.orderNo = highestOrderSubCategory ? highestOrderSubCategory.orderNo + 1 : 1;
    } else {
      // Check if the orderNo is already in use within the same parent category
      const existingSubCategory = await SubCategory.findOne({ 
        parentCategory: data.parentCategory,
        orderNo: data.orderNo
      });
      
      if (existingSubCategory) {
        throw new Error(`Order number ${data.orderNo} is already in use for this category`);
      }
    }
    
    const subCategory = new SubCategory(data);
    await subCategory.save();
    return subCategory;
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.orderNo) {
      throw new Error(`Order number ${data.orderNo} is already in use for this category`);
    }
    throw error;
  }
}

async function get(query = {}) {
  try {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;
    if (query.condition && typeof (query.condition) !== 'object') {
      try {
        query.condition = JSON.parse(query.condition);
      } catch (error) {
        throw new Error("Invalid condition format");
      }
    }
    
    // Default sorting by orderNo
    const sortField = query.sortBy || 'orderNo';
    const sortOrder = query.sortOrder === 'desc' ? -1 : 1;
    const sortOptions = {};
    sortOptions[sortField] = sortOrder;
    
    const subcategories = await SubCategory.find(query.condition || {})
      .skip(skip)
      .limit(limit)
      .sort(sortOptions)
      .populate('parentCategory');

    const total = await SubCategory.countDocuments(query.condition || {});
    return {
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      subcategories
    };
  } catch (error) {
    throw error;
  }
}

async function getSubCategoryById(id) {
  return SubCategory.findById(id).populate('parentCategory');
}

async function update(id, data) {
  try {
    // If changing orderNo, check if it's already in use by another subcategory in the same parent
    if (data.orderNo !== undefined) {
      const currentSubCategory = await SubCategory.findById(id);
      if (!currentSubCategory) {
        throw new Error('SubCategory not found');
      }
      
      const parentCategory = data.parentCategory || currentSubCategory.parentCategory;
      
      const existingSubCategory = await SubCategory.findOne({ 
        parentCategory: parentCategory,
        orderNo: data.orderNo,
        _id: { $ne: id }
      });
      
      if (existingSubCategory) {
        throw new Error(`Order number ${data.orderNo} is already in use for this category`);
      }
    }
    
    return await SubCategory.findByIdAndUpdate(
      id, 
      data,
      { new: true, runValidators: true }
    );
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.orderNo) {
      throw new Error(`Order number ${data.orderNo} is already in use for this category`);
    }
    throw error;
  }
}

async function deleteSubCategory(id) {
  return await SubCategory.findByIdAndDelete(id);
}

async function reorderSubCategories(orderData) {
  // orderData should be an array of { id, orderNo } objects
  const session = await SubCategory.startSession();
  session.startTransaction();
  
  try {
    const updatePromises = orderData.map(item => 
      SubCategory.findByIdAndUpdate(
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
  create,
  get,
  deleteSubCategory,
  update,
  getSubCategoryById,
  reorderSubCategories
};
