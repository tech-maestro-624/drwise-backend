const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Create payment order for subscription renewal
router.post('/create-order',
    isAuthenticated,
    paymentController.createRenewalOrder
);

// Process payment after successful transaction
router.post('/process-payment',
    isAuthenticated,
    paymentController.processPayment
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
