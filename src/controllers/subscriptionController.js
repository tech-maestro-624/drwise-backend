const subscriptionService = require('../services/subscriptionService');

// Create a new subscription
const createSubscription = async (req, res) => {
  try {
    const subscription = await subscriptionService.createSubscription(req.body);
    res.status(201).json({ success: true, data: subscription });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all subscriptions with pagination and filtering
const getAllSubscriptions = async (req, res) => {
  try {
    const result = await subscriptionService.getAllSubscriptions(req.query);
    res.status(200).json({
      success: true,
      data: result.subscriptions,
      total: result.total,
      page: result.page,
      pages: result.pages
    });
  } catch (error) {
    console.error('Error in getAllSubscriptions:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get a subscription by ID
const getSubscriptionById = async (req, res) => {
  try {
    const subscription = await subscriptionService.getSubscriptionById(req.params.id);
    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
};

// Update a subscription
const updateSubscription = async (req, res) => {
  try {
    const subscription = await subscriptionService.updateSubscription(req.params.id, req.body);
    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Cancel a subscription
const cancelSubscription = async (req, res) => {
  try {
    const subscription = await subscriptionService.cancelSubscription(req.params.id);
    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Check for expired subscriptions (admin only)
const checkExpiredSubscriptions = async (req, res) => {
  try {
    const count = await subscriptionService.checkExpiredSubscriptions();
    res.status(200).json({ 
      success: true, 
      message: `${count} expired subscriptions processed`,
      count
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get subscription status for user/affiliate
const getSubscriptionStatus = async (req, res) => {
  try {
    const { userId, affiliateId } = req.query;

    console.log('SubscriptionController - getSubscriptionStatus:', {
      userId,
      affiliateId,
      authenticatedUser: req.user?._id,
      query: req.query
    });



    if (!userId && !affiliateId) {
      return res.status(400).json({
        success: false,
        message: 'Either userId or affiliateId query parameter is required'
      });
    }

    const subscriptionService = require('../services/subscriptionService');
    const statusData = await subscriptionService.getSubscriptionStatus(userId, affiliateId);

    res.status(200).json({
      success: true,
      data: statusData
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get subscription status'
    });
  }
};

module.exports = {
  createSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  updateSubscription,
  cancelSubscription,
  checkExpiredSubscriptions,
  getSubscriptionStatus
}; 