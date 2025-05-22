const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { isAuthenticated, checkRoleOrPermission } = require('../middleware/authMiddleware');

// Create a new subscription
router.post('/', 
  isAuthenticated, 
  checkRoleOrPermission('CREATE_SUBSCRIPTION'), 
  subscriptionController.createSubscription
);

// Get all subscriptions with pagination and filtering
router.get('/', 
  isAuthenticated, 
  checkRoleOrPermission('READ_SUBSCRIPTION'), 
  subscriptionController.getAllSubscriptions
);

// Get a subscription by ID
router.get('/:id', 
  isAuthenticated, 
  checkRoleOrPermission('READ_SUBSCRIPTION'), 
  subscriptionController.getSubscriptionById
);

// Update a subscription
router.put('/:id', 
  isAuthenticated, 
  checkRoleOrPermission('UPDATE_SUBSCRIPTION'), 
  subscriptionController.updateSubscription
);

// Cancel a subscription
router.patch('/:id/cancel', 
  isAuthenticated, 
  checkRoleOrPermission('UPDATE_SUBSCRIPTION'), 
  subscriptionController.cancelSubscription
);

// Admin route to check for expired subscriptions
router.post('/check-expired', 
  isAuthenticated, 
  checkRoleOrPermission('ADMIN'), 
  subscriptionController.checkExpiredSubscriptions
);

module.exports = router; 