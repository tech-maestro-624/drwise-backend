const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Create payment order for subscription renewal
router.post('/create-order',
    isAuthenticated,
    paymentController.createRenewalOrder
);

// Create payment order for new subscription (temporary - before user creation)
router.post('/create-new-subscription-order',
    paymentController.createNewSubscriptionOrder
);

// Process payment after successful transaction
router.post('/process-payment',
    isAuthenticated,
    paymentController.processPayment
);

// Process new subscription payment (temporary - before user creation)
router.post('/process-new-subscription-payment',
    paymentController.processNewSubscriptionPayment
);

// Associate temporary subscription with user after registration
router.post('/associate-subscription',
    isAuthenticated,
    paymentController.associateSubscriptionWithUser
);

// Check renewal eligibility for user/affiliate
router.get('/renewal-eligibility',
    isAuthenticated,
    paymentController.checkRenewalEligibility
);

// Get payment history for user/affiliate
router.get('/payment-history',
    isAuthenticated,
    paymentController.getPaymentHistory
);

// Razorpay webhook endpoint (no authentication required)
router.post('/webhook',
    express.raw({ type: 'application/json' }),
    paymentController.handleWebhook
);

module.exports = router;
