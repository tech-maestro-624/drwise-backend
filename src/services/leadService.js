// services/leadService.js

const Lead = require('../models/Lead');

async function createLead(name, phoneNumber, referrer) {
  const lead = new Lead({ name, phoneNumber, referrer: referrer });
  await lead.save();
  return lead;
}

async function getAllLeads(query = {}) {
  console.log(query);
  
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
  return Lead.findById(leadId).populate('referrer');
}

async function updateLead(leadId, status) {
  const lead = await Lead.findByIdAndUpdate(leadId, { status }, { new: true });
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
