// controllers/leadController.js

const leadService = require('../services/leadService');
const Lead = require('../models/Lead');

// Create separate leads for each product
exports.createLead = async (req, res) => {
  const { name, phoneNumber, referrer, categoryId, productIds } = req.body;

  try {
    // Validate required fields
    if (!name || !phoneNumber || !referrer || !productIds) {
      return res.status(400).json({
        message: 'Missing required fields: name, phoneNumber, referrer, productIds'
      });
    }

    // Ensure productIds is an array
    const productsArray = Array.isArray(productIds) ? productIds : [productIds];

    if (!productsArray.length) {
      return res.status(400).json({
        message: 'At least one product is required'
      });
    }

    // Check for self-referral prevention
    const selfReferralCheck = await leadService.checkSelfReferral(phoneNumber, referrer);
    if (!selfReferralCheck.isAllowed) {
      return res.status(400).json({
        message: selfReferralCheck.message,
        error: 'SELF_REFERRAL_NOT_ALLOWED'
      });
    }

    // Create leads (service will create separate leads for each product)
    const leads = await leadService.createLead(name, phoneNumber, referrer, categoryId, productsArray);

    // Return appropriate response based on number of leads created
    if (Array.isArray(leads)) {
      res.status(201).json({
        message: `${leads.length} leads created successfully`,
        leads,
        totalLeads: leads.length
      });
    } else {
      res.status(201).json({
        message: 'Lead created successfully',
        lead: leads
      });
    }
  } catch (error) {
    console.error(error);

    // Handle specific errors
    if (error.message.includes('already been referred for this product by another affiliate')) {
      return res.status(409).json({
        message: error.message,
        error: 'PRODUCT_ALREADY_REFERRED'
      });
    }

    if (error.message === 'At least one product is required') {
      return res.status(400).json({
        message: error.message,
        error: 'NO_PRODUCTS'
      });
    }

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

exports.checkPhoneReferral = async (req, res) => {
  const { phoneNumber, currentAffiliateId } = req.query;

  console.log(phoneNumber, currentAffiliateId);

  try {
    // First check for self-referral prevention
    const selfReferralCheck = await leadService.checkSelfReferral(phoneNumber, currentAffiliateId);
    if (!selfReferralCheck.isAllowed) {
      return res.status(400).json({
        success: false,
        isSelfReferral: true,
        message: selfReferralCheck.message,
        error: 'SELF_REFERRAL_NOT_ALLOWED'
      });
    }

    // Find all leads for this phone number (since there might be multiple leads for different products)
    const existingLeads = await Lead.find({ phoneNumber: phoneNumber }).populate('productId');

    if (!existingLeads || existingLeads.length === 0) {
      return res.status(200).json({
        success: true,
        isReferredByCurrentUser: false,
        isReferredByOther: false,
        leads: []
      });
    }

    // Check if any leads are referred by current user
    const leadsByCurrentUser = existingLeads.filter(lead =>
      lead.referrer.toString() === currentAffiliateId
    );

    const leadsByOtherUsers = existingLeads.filter(lead =>
      lead.referrer.toString() !== currentAffiliateId
    );

    if (leadsByCurrentUser.length > 0) {
      // Current user has referred this phone number for some products
      const leadData = leadsByCurrentUser.map(lead => ({
        _id: lead._id,
        name: lead.name,
        productId: lead.productId._id,
        productName: lead.productId.name,
        status: lead.status
      }));

      res.status(200).json({
        success: true,
        isReferredByCurrentUser: true,
        isReferredByOther: leadsByOtherUsers.length > 0,
        leads: leadData,
        message: leadsByCurrentUser.length > 1 ?
          `You have ${leadsByCurrentUser.length} leads for this phone number` :
          'You have already referred this phone number for this product'
      });
    } else {
      // Only other users have referred this phone number
      res.status(200).json({
        success: true,
        isReferredByCurrentUser: false,
        isReferredByOther: true,
        existingReferrer: existingLeads[0].referrer,
        message: 'This phone number has already been referred by another affiliate'
      });
    }
  } catch (error) {
    console.error('Error checking phone referral:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check phone referral status'
    });
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
