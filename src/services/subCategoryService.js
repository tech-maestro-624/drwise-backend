const SubCategory = require('../models/SubCategory')

async function create(data) {
  const subCategory = new SubCategory(data);
  await subCategory.save();
  return subCategory;
}
async function get(query = {}) {
    try {
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const skip = (page - 1) * limit;
      if (query.condition && typeof (query.condition) !== 'object') {
        try {
          query = JSON.parse(query.condition);
        } catch (error) {
          throw new Error("Invalid condition format");
        }
      }
      const leads = await SubCategory.find(query.condition)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('parentCategory')
  
      const total = await SubCategory.countDocuments(query.condition);
      return {
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        leads
      };
    } catch (error) {
      throw error;
    }
  }

async function getSubCategoryById(id) {
  return SubCategory.findById(id).populate('parentCategory');
}

async function update(id, data) {
  return await SubCategory.findByIdAndUpdate(
    id,data,
    { new: true }
  )
}

async function deleteSubCategory(id) {
  return await SubCategory.findByIdAndDelete(id);
}


module.exports = {
  create,get,deleteSubCategory,update,getSubCategoryById
};
