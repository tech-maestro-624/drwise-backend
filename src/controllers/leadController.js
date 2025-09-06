// controllers/leadController.js

const leadService = require('../services/leadService');

exports.createLead = async (req, res) => {
  const { name, phoneNumber, referrer, categoryId, productId, productIds } = req.body;

  try {
    // Support both single productId and array of productIds for backward compatibility
    const productsToStore = productIds || (productId ? [productId] : []);
    const lead = await leadService.createLead(name, phoneNumber, referrer, categoryId, productsToStore);
    res.status(201).json({ message: 'Lead created successfully', lead });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create lead' });
  }
};

exports.getAllLeads = async (req, res) => {
  try {
    const leads = await leadService.getAllLeads(req?.query);
    res.status(200).json(leads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve leads' });
  }
};

exports.getLeadById = async (req, res) => {
  const { leadId } = req.params;

  try {
    const lead = await leadService.getLeadById(leadId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.status(200).json(lead);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve lead' });
  }
};

exports.updateLead = async (req, res) => {
  const { leadId } = req.params;
  try {
    // Handle both single productId and productIds array for backward compatibility
    const updateData = { ...req.body };

    if (updateData.productId && !Array.isArray(updateData.productId)) {
      // If single productId is provided, ensure it's handled properly
      updateData.productId = updateData.productId;
    }

    const lead = await leadService.updateLead(leadId, updateData);
    res.status(200).json({ message: 'Lead updated successfully', lead });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update lead' });
  }
};

exports.deleteLead = async (req, res) => {
  const { leadId } = req.params;

  try {
    const lead = await leadService.deleteLead(leadId);
    res.status(200).json({ message: 'Lead deleted successfully', lead });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete lead' });
  }
};

// Migration endpoint for old lead data (admin only)
exports.migrateLeadProducts = async (req, res) => {
  try {
    const result = await leadService.migrateOldLeadProducts();
    res.status(200).json({
      message: 'Lead product migration completed',
      data: result
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({
      message: 'Failed to migrate lead products',
      error: error.message
    });
  }
};
