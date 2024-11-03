// services/leadService.js

const Lead = require('../models/Lead');

async function createLead(name, phoneNumber, referrer,categoryId, productId) {
  const lead = new Lead({ name, phoneNumber, referrer: referrer,categoryId,productId });
  await lead.save();
  return lead;
}

async function getAllLeads(query = {}) {
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
    const leads = await Lead.find(query.condition)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('referrer')
      .populate('categoryId')
      .populate('productId')

    const total = await Lead.countDocuments(query.condition);
    return {
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      leads
    };
  } catch (error) {
    throw error;
  }
}

async function getLeadById(leadId) {
  return Lead.findById(leadId).populate('referrer').populate('categoryId').populate('productId')
}

async function updateLead(leadId, data) {
  const lead = await Lead.findByIdAndUpdate(leadId, {$set : data},{new : true});
  if (!lead) {
    throw new Error('Lead not found');
  }
  return lead;
}

async function deleteLead(leadId) {
  const lead = await Lead.findByIdAndDelete(leadId);
  if (!lead) {
    throw new Error('Lead not found');
  }
  return lead;
}

module.exports = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
};
