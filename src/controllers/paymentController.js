// controllers/paymentController.js
const paymentService = require('../services/paymentService');
const crypto = require('crypto');

// Create payment order for new subscription (temporary - before user creation)
const createNewSubscriptionOrder = async (req, res) => {
    try {
        const { subscriptionType } = req.body;

        // Validate input
        if (!subscriptionType || !['ambassador', 'affiliate'].includes(subscriptionType)) {
            return res.status(400).json({
                success: false,
                message: 'Valid subscription type (ambassador or affiliate) is required'
            });
        }

        const orderData = await paymentService.createNewSubscriptionOrder(subscriptionType);

        res.status(200).json({
            success: true,
            message: 'Payment order created successfully',
            data: orderData
        });
    } catch (error) {
        console.error('Error creating new subscription order:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create payment order'
        });
    }
};

// Create payment order for subscription renewal
const createRenewalOrder = async (req, res) => {
    try {
        const { userId, affiliateId, subscriptionType } = req.body;

        // Validate input
        if (!subscriptionType || !['ambassador', 'affiliate'].includes(subscriptionType)) {
            return res.status(400).json({
                success: false,
                message: 'Valid subscription type (ambassador or affiliate) is required'
            });
        }

        if (!userId && !affiliateId) {
            return res.status(400).json({
                success: false,
                message: 'Either userId or affiliateId is required'
            });
        }

        const orderData = await paymentService.createRenewalOrder(userId, affiliateId, subscriptionType);

        res.status(200).json({
            success: true,
            message: 'Payment order created successfully',
            data: orderData
        });
    } catch (error) {
        console.error('Error creating renewal order:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create payment order'
        });
    }
};

// Verify and process payment after successful transaction
const processPayment = async (req, res) => {
  try {
    const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        userId,
        affiliateId
    } = req.body;

    console.log('Payment processing request received:', {
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        signature: razorpay_signature ? 'present' : 'missing',
        userId,
        affiliateId,
        authenticatedUser: req.user?._id
    });

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        console.log('Missing required payment fields');
        return res.status(400).json({
            success: false,
            message: 'Missing required payment verification data'
        });
    }

    if (!userId && !affiliateId) {
        console.log('Missing userId or affiliateId');
        return res.status(400).json({
            success: false,
            message: 'Either userId or affiliateId is required'
        });
    }

    const paymentData = {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        userId,
        affiliateId
    };

    console.log('Calling payment service with data:', paymentData);
    const result = await paymentService.processRenewalPayment(paymentData);
    console.log('Payment service result:', result);

        res.status(200).json({
            success: true,
            message: result.message,
            data: {
                subscription: result.subscription,
                paymentId: result.paymentId
            }
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Payment processing failed'
        });
    }
};

// Process new subscription payment (temporary - before user creation)
const processNewSubscriptionPayment = async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            subscriptionType
        } = req.body;

        console.log('Processing new subscription payment:', {
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            subscriptionType
        });

        // Validate required fields
        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !subscriptionType) {
            console.log('Missing required payment fields');
            return res.status(400).json({
                success: false,
                message: 'Missing required payment verification data or subscription type'
            });
        }

        const paymentData = {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            subscriptionType
        };

        console.log('Calling payment service with data:', paymentData);
        const result = await paymentService.processNewSubscriptionPayment(paymentData);
        console.log('Payment service result:', result);

        res.status(200).json({
            success: true,
            message: result.message,
            data: {
                tempSubscriptionId: result.tempSubscriptionId,
                paymentId: result.paymentId
            }
        });
    } catch (error) {
        console.error('Error processing new subscription payment:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Payment processing failed'
        });
    }
};

// Associate temporary subscription with user after registration
const associateSubscriptionWithUser = async (req, res) => {
    try {
        const { tempSubscriptionId, userId, affiliateId } = req.body;

        if (!tempSubscriptionId) {
            return res.status(400).json({
                success: false,
                message: 'Temporary subscription ID is required'
            });
        }

        if (!userId && !affiliateId) {
            return res.status(400).json({
                success: false,
                message: 'Either userId or affiliateId is required'
            });
        }

        const result = await paymentService.associateSubscriptionWithUser(tempSubscriptionId, userId, affiliateId);

        res.status(200).json({
            success: true,
            message: 'Subscription associated with user successfully',
            data: result
        });
    } catch (error) {
        console.error('Error associating subscription with user:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to associate subscription with user'
        });
    }
};

// Check renewal eligibility for user/affiliate
const checkRenewalEligibility = async (req, res) => {
    try {
        const { userId, affiliateId } = req.query;

        if (!userId && !affiliateId) {
            return res.status(400).json({
                success: false,
                message: 'Either userId or affiliateId query parameter is required'
            });
        }

        const eligibilityData = await paymentService.checkRenewalEligibility(userId, affiliateId);

        res.status(200).json({
            success: true,
            data: eligibilityData
        });
    } catch (error) {
        console.error('Error checking renewal eligibility:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to check renewal eligibility'
        });
    }
};

// Get payment history for user/affiliate
const getPaymentHistory = async (req, res) => {
    try {
        const { userId, affiliateId } = req.query;

        if (!userId && !affiliateId) {
            return res.status(400).json({
                success: false,
                message: 'Either userId or affiliateId query parameter is required'
            });
        }

        const paymentHistory = await paymentService.getPaymentHistory(userId, affiliateId);

        res.status(200).json({
            success: true,
            data: paymentHistory
        });
    } catch (error) {
        console.error('Error fetching payment history:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch payment history'
        });
    }
};

// Handle Razorpay webhook (for automatic payment verification)
const handleWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];
        const body = JSON.stringify(req.body);

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');

        if (signature !== expectedSignature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid webhook signature'
            });
        }

        const event = req.body.event;
        const paymentEntity = req.body.payload.payment.entity;

        if (event === 'payment.captured') {
            // Process successful payment
            const orderId = paymentEntity.order_id;
            const paymentId = paymentEntity.id;

            // You can add additional processing here if needed
            console.log(`Payment captured: ${paymentId} for order: ${orderId}`);
        }

        res.status(200).json({
            success: true,
            message: 'Webhook processed successfully'
        });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({
            success: false,
            message: 'Webhook processing failed'
        });
    }
};

module.exports = {
    createNewSubscriptionOrder,
    createRenewalOrder,
    processPayment,
    processNewSubscriptionPayment,
    associateSubscriptionWithUser,
    checkRenewalEligibility,
    getPaymentHistory,
    handleWebhook
};
