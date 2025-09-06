// controllers/subscriptionPlansController.js

const subscriptionPlansService = require('../services/subscriptionPlansService');

// Create a new subscription plan
const createSubscriptionPlan = async (req, res) => {
  try {
    const plan = await subscriptionPlansService.createSubscriptionPlan(req.body);
    res.status(201).json({
      success: true,
      message: 'Subscription plan created successfully',
      data: plan
    });
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create subscription plan'
    });
  }
};

// Get all subscription plans with pagination
const getAllSubscriptionPlans = async (req, res) => {
  try {
    const result = await subscriptionPlansService.getAllSubscriptionPlans(req.query);
    res.status(200).json({
      success: true,
      data: result.plans,
      total: result.total,
      page: result.page,
      pages: result.pages
    });
  } catch (error) {
    console.error('Error retrieving subscription plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve subscription plans'
    });
  }
};

// Get a subscription plan by ID
const getSubscriptionPlanById = async (req, res) => {
  try {
    const plan = await subscriptionPlansService.getSubscriptionPlanById(req.params.id);
    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error retrieving subscription plan:', error);
    if (error.message === 'Subscription plan not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve subscription plan'
    });
  }
};

// Update a subscription plan
const updateSubscriptionPlan = async (req, res) => {
  try {
    const plan = await subscriptionPlansService.updateSubscriptionPlan(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Subscription plan updated successfully',
      data: plan
    });
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    if (error.message === 'Subscription plan not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update subscription plan'
    });
  }
};

// Delete a subscription plan
const deleteSubscriptionPlan = async (req, res) => {
  try {
    const plan = await subscriptionPlansService.deleteSubscriptionPlan(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Subscription plan deleted successfully',
      data: plan
    });
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    if (error.message === 'Subscription plan not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to delete subscription plan'
    });
  }
};

// Get active subscription plans (for frontend display)
const getActiveSubscriptionPlans = async (req, res) => {
  try {
    const plans = await subscriptionPlansService.getActiveSubscriptionPlans();
    res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Error retrieving active subscription plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve active subscription plans'
    });
  }
};

// Get subscription plans by price range
const getPlansByPriceRange = async (req, res) => {
  try {
    const { minPrice, maxPrice } = req.query;

    if (!minPrice || !maxPrice) {
      return res.status(400).json({
        success: false,
        message: 'minPrice and maxPrice query parameters are required'
      });
    }

    const plans = await subscriptionPlansService.getPlansByPriceRange(
      parseFloat(minPrice),
      parseFloat(maxPrice)
    );

    res.status(200).json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Error retrieving plans by price range:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve plans by price range'
    });
  }
};

// Get subscription plan by type (ambassador/affiliate)
const getPlansByType = async (req, res) => {
  try {
    const { type } = req.params;

    if (!type || !['ambassador', 'affiliate'].includes(type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Valid type parameter is required (ambassador or affiliate)'
      });
    }

    const plan = await subscriptionPlansService.getPlansByType(type.toLowerCase());

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: `No ${type} subscription plan found`
      });
    }

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error retrieving plan by type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve plan by type'
    });
  }
};

module.exports = {
  createSubscriptionPlan,
  getAllSubscriptionPlans,
  getSubscriptionPlanById,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getActiveSubscriptionPlans,
  getPlansByPriceRange,
  getPlansByType
};
