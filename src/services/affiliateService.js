const Affiliate = require('../models/Affilate');

// Create a new affiliate
const createAffiliate = async (affiliateData) => {
  try {
    const affiliate = await Affiliate.create(affiliateData);
    return affiliate;
  } catch (error) {
    throw error;
  }
};


// Get all affiliates
const getAllAffiliates = async (query) => {
  try {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const skip = (page - 1) * limit;

    const {condition = {}} = query; 
    const totalPages = await Affiliate.countDocuments(condition);
    const totalAffiliates = await Affiliate.countDocuments();

    const affiliates = await Affiliate.find(condition)
      .sort({ createdAt: -1 })
      .skip(skip)
      .populate('refferedBy')
      .limit(limit);

    return {affiliates, totalPages, totalAffiliates};
  } catch (error) {
    throw error;
  }
};

// Get a single affiliate by ID
const getAffiliateById = async (affiliateId) => {
  try {
    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate) {
      throw new Error('Affiliate not found');
    }
    return affiliate;
  } catch (error) {
    throw error;
  }
};

// Update an affiliate
const updateAffiliate = async (affiliateId, updateData) => {
  try {
    const affiliate = await Affiliate.findByIdAndUpdate(affiliateId, updateData, { new: true });
    if (!affiliate) {
      throw new Error('Affiliate not found');
    }
    return affiliate;
  } catch (error) {
    throw error;
  }
};

// Delete an affiliate
const deleteAffiliate = async (affiliateId) => {
  try {
    const affiliate = await Affiliate.findByIdAndDelete(affiliateId);
    if (!affiliate) {
      throw new Error('Affiliate not found');
    }
    return affiliate;
  } catch (error) {
    throw error;
  }
};


module.exports = {
  createAffiliate,
  getAllAffiliates,
  getAffiliateById,
  updateAffiliate,
  deleteAffiliate,
};
