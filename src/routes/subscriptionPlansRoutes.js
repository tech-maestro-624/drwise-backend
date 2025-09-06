const express = require('express');
const router = express.Router();
const subscriptionPlansController = require('../controllers/subscriptionPlansController');
const { isAuthenticated, checkRoleOrPermission } = require('../middleware/authMiddleware');

// Create a new subscription plan
router.post('/',
  isAuthenticated,
  checkRoleOrPermission('CREATE_SUBSCRIPTIONPLANS'),
  subscriptionPlansController.createSubscriptionPlan
);

// Get all subscription plans with pagination and filtering
router.get('/',
  isAuthenticated,
  subscriptionPlansController.getAllSubscriptionPlans
);

// Get active subscription plans (public route for frontend)
router.get('/active',
  subscriptionPlansController.getActiveSubscriptionPlans
);

// Get subscription plans by price range
router.get('/price-range',
  isAuthenticated,
  subscriptionPlansController.getPlansByPriceRange
);

// Get subscription plan by type (ambassador/affiliate)
router.get('/type/:type',
  isAuthenticated,
  subscriptionPlansController.getPlansByType
);

// Get a subscription plan by ID
router.get('/:id',
  isAuthenticated,
  checkRoleOrPermission('READ_SUBSCRIPTIONPLANS'),
  subscriptionPlansController.getSubscriptionPlanById
);

// Update a subscription plan
router.put('/:id',
  isAuthenticated,
  checkRoleOrPermission('UPDATE_SUBSCRIPTIONPLANS'),
  subscriptionPlansController.updateSubscriptionPlan
);

// Delete a subscription plan
router.delete('/:id',
  isAuthenticated,
  checkRoleOrPermission('DELETE_SUBSCRIPTIONPLANS'),
  subscriptionPlansController.deleteSubscriptionPlan
);

module.exports = router;
