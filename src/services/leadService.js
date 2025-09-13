// services/leadService.js

const Lead = require('../models/Lead');
const User = require('../models/User');

// Utility function to normalize product IDs (handle both single and array)
function normalizeProductIds(productIds) {
  if (!productIds) return [];

  // If it's already an array, return as is
  if (Array.isArray(productIds)) {
    return productIds.filter(id => id); // Filter out null/undefined values
  }

  // If it's a single value, convert to array
  if (productIds) {
    return [productIds];
  }

  return [];
}

// Check for self-referral prevention
async function checkSelfReferral(phoneNumber, referrerId) {
  try {
    // Get the referrer user details
    const referrer = await User.findById(referrerId).populate('roles');
    if (!referrer) {
      return {
        isAllowed: false,
        message: 'Referrer not found'
      };
    }

    // Check if the phone number being referred belongs to the referrer themselves
    if (referrer.phoneNumber === phoneNumber) {
      return {
        isAllowed: false,
        message: 'Self-referral is not allowed. You cannot refer yourself.'
      };
    }

    // Check if referrer has Affiliate or Ambassador role by role name
    const referrerRoleNames = referrer.roles.map(role => role.name.toLowerCase());
    const isAffiliate = referrerRoleNames.includes('affiliate');
    const isAmbassador = referrerRoleNames.includes('ambassador');

    if (isAffiliate || isAmbassador) {
      // Check if the phone number belongs to another user with Affiliate or Ambassador role
      const existingUser = await User.findOne({ phoneNumber }).populate('roles');

      if (existingUser) {
        const existingUserRoleNames = existingUser.roles.map(role => role.name.toLowerCase());
        const isExistingUserAffiliate = existingUserRoleNames.includes('affiliate');
        const isExistingUserAmbassador = existingUserRoleNames.includes('ambassador');

        if (isExistingUserAffiliate || isExistingUserAmbassador) {
          return {
            isAllowed: false,
            message: 'You cannot refer another Affiliate or Ambassador. Self-referral commission is not allowed as per IRDAI guidelines.'
          };
        }
      }
    }

    return {
      isAllowed: true,
      message: 'Referral is allowed'
    };

  } catch (error) {
    console.error('Error checking self-referral:', error);
    return {
      isAllowed: false,
      message: 'Error validating referral. Please try again.'
    };
  }
}

// Create separate leads for each product
async function createLead(name, phoneNumber, referrer, categoryId, productIds) {
  // Ensure productIds is an array
  const normalizedProductIds = Array.isArray(productIds) ? productIds : [productIds];

  if (!normalizedProductIds.length) {
    throw new Error('At least one product is required');
  }

  const createdLeads = [];

  for (const productId of normalizedProductIds) {
    if (!productId) continue;

    // Check if this phone number + product combination already exists
    const existingLead = await Lead.findOne({
      phoneNumber: phoneNumber,
      productId: productId
    });

    if (existingLead) {
      // If same referrer, skip (already exists)
      if (existingLead.referrer.toString() === referrer.toString()) {
        createdLeads.push(existingLead);
        continue;
      } else {
        // Different referrer - not allowed
        throw new Error(`This phone number has already been referred for this product by another affiliate`);
      }
    }

    // Create new lead for this product
    const lead = new Lead({
      name,
      phoneNumber,
      referrer: referrer,
      categoryId,
      productId: productId
    });

    await lead.save();
    createdLeads.push(lead);
  }

  // Return array of created leads
  return createdLeads.length === 1 ? createdLeads[0] : createdLeads;
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
  // Handle product ID normalization for updates
  if (data.productId !== undefined) {
    data.productId = normalizeProductIds(data.productId);
  }
  if (data.productIds !== undefined) {
    data.productId = normalizeProductIds(data.productIds);
    delete data.productIds; // Remove the old field if present
  }

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

// Utility function to migrate old leads with single productId to array format
async function migrateOldLeadProducts() {
  try {
    console.log('Starting migration of old lead product data...');

    // Find leads where productId is not an array (old format)
    const oldLeads = await Lead.find({
      $or: [
        { productId: { $type: 'objectId' } }, // Single ObjectId
        { productId: { $size: 0 } } // Empty array
      ]
    });

    let migratedCount = 0;

    for (const lead of oldLeads) {
      let newProductId = [];

      // If productId is a single ObjectId, convert to array
      if (lead.productId && !Array.isArray(lead.productId)) {
        newProductId = [lead.productId];
      } else if (Array.isArray(lead.productId)) {
        // Filter out any null/undefined values
        newProductId = lead.productId.filter(id => id);
      }

      // Update the lead with normalized productId array
      await Lead.findByIdAndUpdate(lead._id, {
        productId: newProductId
      });

      migratedCount++;
    }

    console.log(`Migration completed. ${migratedCount} leads updated.`);
    return { success: true, migratedCount };

  } catch (error) {
    console.error('Error during lead product migration:', error);
    throw error;
  }
}

// Utility function to get lead products in a consistent format
function getLeadProducts(lead) {
  if (!lead.productId) return [];

  // If it's already an array, return as is
  if (Array.isArray(lead.productId)) {
    return lead.productId;
  }

  // If it's a single value, convert to array
  if (lead.productId) {
    return [lead.productId];
  }

  return [];
}

module.exports = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  migrateOldLeadProducts,
  getLeadProducts,
  normalizeProductIds,
  checkSelfReferral,
};
