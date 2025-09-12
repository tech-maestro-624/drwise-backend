// services/paymentService.js
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Subscription = require('../models/Subscription');
const SubscriptionPlans = require('../models/SubscriptionPlans');
const User = require('../models/User');
const Affiliate = require('../models/Affilate');
const cacheService = require('./cacheService');

// Temporary credentials for testing - replace with environment variables in production
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_LKwcKdhRp0mq9f';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_secret_here';

if (RAZORPAY_KEY_SECRET === 'your_razorpay_secret_here') {
    console.warn('⚠️  WARNING: Using placeholder Razorpay secret key. Please set RAZORPAY_KEY_SECRET environment variable.');
}

const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});

// Create Razorpay order for new subscription (temporary - before user creation)
const createNewSubscriptionOrder = async (subscriptionType) => {
    try {
        // Get the appropriate plan based on subscription type
        const planName = subscriptionType === 'ambassador' ? 'Ambassador' : 'Affiliate';
        const plan = await SubscriptionPlans.findOne({ name: planName });

        if (!plan) {
            throw new Error(`${subscriptionType} subscription plan not found`);
        }

        // Create Razorpay order with temporary data
        const shortId = 'temp_' + Date.now().toString().slice(-8); // Temporary ID
        const timestamp = Date.now().toString().slice(-6); // Take last 6 digits of timestamp
        const options = {
            amount: plan.price * 100, // Razorpay expects amount in paisa
            currency: "INR",
            receipt: `new_${shortId}_${timestamp}`,
            notes: {
                type: 'new_subscription',
                subscriptionType: subscriptionType,
                planId: plan._id.toString(),
                customerName: 'Temporary User',
                tempOrder: true
            },
            payment_capture: 1
        };

        console.log('Creating new subscription Razorpay order with options:', {
            amount: options.amount,
            currency: options.currency,
            receipt: options.receipt,
            notes: options.notes
        });

        const order = await razorpay.orders.create(options);

        console.log('Razorpay order created successfully:', {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });

        return {
            orderId: order.id,
            amount: plan.price,
            currency: order.currency,
            planDetails: {
                name: plan.name,
                price: plan.price,
                features: plan.features
            },
            subscriptionType: subscriptionType,
            key: RAZORPAY_KEY_ID
        };
    } catch (error) {
        console.error('Error creating new subscription order:', error);
        throw new Error('Failed to create payment order');
    }
};

// Create Razorpay order for subscription renewal
const createRenewalOrder = async (userId, affiliateId, subscriptionType) => {
    try {
        // Get the appropriate plan based on subscription type
        const planName = subscriptionType === 'ambassador' ? 'Ambassador' : 'Affiliate';
        const plan = await SubscriptionPlans.findOne({ name: planName });

        if (!plan) {
            throw new Error(`${subscriptionType} subscription plan not found`);
        }

        // Get user/affiliate details for receipt
        let customerDetails = null;
        if (userId) {
            const user = await User.findById(userId);
            customerDetails = {
                name: user?.name || 'User',
                email: user?.email,
                phone: user?.phoneNumber
            };
        } else if (affiliateId) {
            const affiliate = await Affiliate.findById(affiliateId);
            customerDetails = {
                name: affiliate?.name || 'Affiliate',
                email: affiliate?.email,
                phone: affiliate?.phoneNumber
            };
        }

        // Create Razorpay order
        const shortId = (userId || affiliateId).substring(0, 8); // Take first 8 chars of ID
        const timestamp = Date.now().toString().slice(-6); // Take last 6 digits of timestamp
        const options = {
            amount: plan.price * 100, // Razorpay expects amount in paisa
            currency: "INR",
            receipt: `rnl_${shortId}_${timestamp}`,
            notes: {
                type: 'subscription_renewal',
                subscriptionType: subscriptionType,
                userId: userId || null,
                affiliateId: affiliateId || null,
                planId: plan._id.toString(),
                customerName: customerDetails?.name || 'Customer'
            },
            payment_capture: 1
        };

        console.log('Creating Razorpay order with options:', {
            amount: options.amount,
            currency: options.currency,
            receipt: options.receipt,
            notes: options.notes
        });

        const order = await razorpay.orders.create(options);

        console.log('Razorpay order created successfully:', {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });

        return {
            orderId: order.id,
            amount: plan.price,
            currency: order.currency,
            planDetails: {
                name: plan.name,
                price: plan.price,
                features: plan.features
            },
            customerDetails,
            key: RAZORPAY_KEY_ID
        };
    } catch (error) {
        console.error('Error creating renewal order:', error);
        throw new Error('Failed to create payment order');
    }
};

// Verify payment signature
const verifyPayment = async (razorpay_payment_id, razorpay_order_id, razorpay_signature) => {
    try {
        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            return { verified: true };
        } else {
            return { verified: false, error: "Invalid signature" };
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        return { verified: false, error: error.message };
    }
};

// Process successful payment and create/renew subscription
const processRenewalPayment = async (paymentData) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            userId,
            affiliateId
        } = paymentData;

        console.log('Processing renewal payment:', {
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            userId,
            affiliateId
        });

        // Verify payment
        console.log('Verifying payment signature...');
        const verification = await verifyPayment(razorpay_payment_id, razorpay_order_id, razorpay_signature);
        if (!verification.verified) {
            console.error('Payment verification failed:', verification.error);
            throw new Error('Payment verification failed: ' + verification.error);
        }
        console.log('Payment verification successful');

        // Get order details from Razorpay
        console.log('Fetching order details from Razorpay...');
        const order = await razorpay.orders.fetch(razorpay_order_id);
        const planId = order.notes.planId;
        const subscriptionType = order.notes.subscriptionType;

        console.log('Order details:', {
            planId,
            subscriptionType,
            orderAmount: order.amount
        });

        // Get plan details
        const plan = await SubscriptionPlans.findById(planId);
        if (!plan) {
            throw new Error('Subscription plan not found');
        }

        // Check if user/affiliate already has an active subscription
        console.log('Looking for existing subscription...');
        let existingSubscription = null;
        if (userId) {
            existingSubscription = await Subscription.findOne({
                userId: userId,
                subscriptionType: subscriptionType,
                status: { $in: ['active', 'pending'] }
            });
            console.log('Found subscription by userId:', existingSubscription?._id || 'none');
        } else if (affiliateId) {
            existingSubscription = await Subscription.findOne({
                affiliateId: affiliateId,
                subscriptionType: subscriptionType,
                status: { $in: ['active', 'pending'] }
            });
            console.log('Found subscription by affiliateId:', existingSubscription?._id || 'none');
        }

        const now = new Date();
        let startDate = now;
        let endDate = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year from now

        if (existingSubscription) {
            console.log('Existing subscription found, renewing...');
            // Renewal: extend from current end date
            if (existingSubscription.endDate > now) {
                startDate = existingSubscription.endDate;
                endDate = new Date(existingSubscription.endDate.getTime() + (365 * 24 * 60 * 60 * 1000));
                console.log('Extending from existing end date');
            } else {
                console.log('Starting from current date (subscription was expired)');
            }

            // Update existing subscription
            existingSubscription.endDate = endDate;
            existingSubscription.status = 'active';
            existingSubscription.planDetails = {
                name: plan.name,
                price: plan.price,
                features: plan.features
            };
            existingSubscription.paymentInfo = {
                transactionId: razorpay_payment_id,
                paymentMethod: 'razorpay',
                paymentDate: now
            };

            console.log('Saving updated subscription...');
            await existingSubscription.save();

            // Clear cache
            await cacheService.deleteByPattern('subscriptions:*');

            console.log('Subscription renewed successfully');
            return {
                success: true,
                message: 'Subscription renewed successfully',
                subscription: existingSubscription,
                paymentId: razorpay_payment_id
            };
        } else {
            console.log('No existing subscription found, creating new one...');
            // New subscription
            const newSubscription = new Subscription({
                userId: userId || null,
                affiliateId: affiliateId || null,
                subscriptionType: subscriptionType,
                startDate: startDate,
                endDate: endDate,
                status: 'active',
                planDetails: {
                    name: plan.name,
                    price: plan.price,
                    features: plan.features
                },
                paymentInfo: {
                    transactionId: razorpay_payment_id,
                    paymentMethod: 'razorpay',
                    paymentDate: now
                }
            });

            console.log('Saving new subscription...');
            await newSubscription.save();

            // Clear cache
            await cacheService.deleteByPattern('subscriptions:*');

            console.log('New subscription created successfully');
            return {
                success: true,
                message: 'New subscription created successfully',
                subscription: newSubscription,
                paymentId: razorpay_payment_id
            };
        }
    } catch (error) {
        console.error('Error processing renewal payment:', error);
        throw error;
    }
};

// Process successful payment for new subscription (temporary - before user creation)
const processNewSubscriptionPayment = async (paymentData) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            subscriptionType
        } = paymentData;

        console.log('Processing new subscription payment:', {
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            subscriptionType
        });

        // Verify payment
        console.log('Verifying payment signature...');
        const verification = await verifyPayment(razorpay_payment_id, razorpay_order_id, razorpay_signature);
        if (!verification.verified) {
            console.error('Payment verification failed:', verification.error);
            throw new Error('Payment verification failed: ' + verification.error);
        }
        console.log('Payment verification successful');

        // Get order details from Razorpay
        console.log('Fetching order details from Razorpay...');
        const order = await razorpay.orders.fetch(razorpay_order_id);
        const planId = order.notes.planId;

        console.log('Order details:', {
            planId,
            subscriptionType,
            orderAmount: order.amount
        });

        // Get plan details
        const plan = await SubscriptionPlans.findById(planId);
        if (!plan) {
            throw new Error('Subscription plan not found');
        }

        const now = new Date();
        const startDate = now;
        const endDate = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year from now

        // Create temporary subscription (without userId/affiliateId)
        const tempSubscription = new Subscription({
            subscriptionType: subscriptionType,
            startDate: startDate,
            endDate: endDate,
            status: 'temp_pending_user', // Special status for temporary subscriptions
            planDetails: {
                name: plan.name,
                price: plan.price,
                features: plan.features
            },
            paymentInfo: {
                transactionId: razorpay_payment_id,
                paymentMethod: 'razorpay',
                paymentDate: now
            },
            tempOrderId: razorpay_order_id // Store order ID for reference
        });

        console.log('Saving temporary subscription...');
        console.log('Subscription data:', {
            subscriptionType,
            startDate,
            endDate,
            status: 'temp_pending_user',
            planDetails: {
                name: plan.name,
                price: plan.price,
                features: plan.features
            }
        });

        await tempSubscription.save();

        console.log('Temporary subscription created successfully with ID:', tempSubscription._id);
        return {
            success: true,
            message: 'New subscription payment processed successfully',
            tempSubscriptionId: tempSubscription._id,
            paymentId: razorpay_payment_id
        };
    } catch (error) {
        console.error('Error processing new subscription payment:', error);
        throw error;
    }
};

// Associate temporary subscription with user after registration
const associateSubscriptionWithUser = async (tempSubscriptionId, userId, affiliateId) => {
    try {
        console.log('Associating temporary subscription with user:', {
            tempSubscriptionId,
            userId,
            affiliateId
        });

        // Find the temporary subscription
        const tempSubscription = await Subscription.findById(tempSubscriptionId);
        if (!tempSubscription) {
            throw new Error('Temporary subscription not found');
        }

        if (tempSubscription.status !== 'temp_pending_user') {
            throw new Error('Subscription is not in temporary state');
        }

        // Associate with user/affiliate
        if (userId) {
            tempSubscription.userId = userId;
        } else if (affiliateId) {
            tempSubscription.affiliateId = affiliateId;
        }

        // Update status to active
        tempSubscription.status = 'active';

        console.log('Saving associated subscription...');
        await tempSubscription.save();

        // Clear cache
        await cacheService.deleteByPattern('subscriptions:*');

        console.log('Subscription successfully associated with user');
        return {
            success: true,
            subscription: tempSubscription,
            message: 'Subscription associated with user successfully'
        };
    } catch (error) {
        console.error('Error associating subscription with user:', error);
        throw error;
    }
};

// Get payment history for user/affiliate
const getPaymentHistory = async (userId, affiliateId) => {
    try {
        const cacheKey = `payments:history:${userId || affiliateId}`;

        return await cacheService.getOrSet(
            cacheKey,
            async () => {
                let filter = { 'paymentInfo.transactionId': { $exists: true } };

                if (userId) {
                    filter.userId = userId;
                } else if (affiliateId) {
                    filter.affiliateId = affiliateId;
                }

                const subscriptions = await Subscription.find(filter)
                    .populate('userId', 'name email')
                    .populate('affiliateId', 'name email')
                    .sort({ 'paymentInfo.paymentDate': -1 })
                    .select('subscriptionType planDetails paymentInfo startDate endDate status');

                return subscriptions;
            },
            300 // 5 minutes TTL
        );
    } catch (error) {
        console.error('Error fetching payment history:', error);
        throw new Error('Failed to fetch payment history');
    }
};

// Check if user/affiliate can renew subscription
const checkRenewalEligibility = async (userId, affiliateId) => {
    try {
        let filter = {};

        if (userId) {
            filter.userId = userId;
        } else if (affiliateId) {
            filter.affiliateId = affiliateId;
        } else {
            throw new Error('User ID or Affiliate ID is required');
        }

        const subscriptions = await Subscription.find(filter).sort({ endDate: -1 });

        if (subscriptions.length === 0) {
            return {
                canRenew: true,
                message: 'No existing subscription found. Can create new subscription.',
                subscriptionType: null,
                expiredSubscriptions: []
            };
        }

        const now = new Date();
        const expiredSubscriptions = subscriptions.filter(sub => sub.endDate < now);
        const activeSubscriptions = subscriptions.filter(sub => sub.endDate >= now);

        // Determine subscription type based on most recent or active subscription
        let subscriptionType = 'affiliate'; // default
        if (activeSubscriptions.length > 0) {
            subscriptionType = activeSubscriptions[0].subscriptionType;
        } else if (expiredSubscriptions.length > 0) {
            subscriptionType = expiredSubscriptions[0].subscriptionType;
        }

        // Check if user is ambassador (higher priority)
        const ambassadorSub = subscriptions.find(sub => sub.subscriptionType === 'ambassador');
        if (ambassadorSub) {
            subscriptionType = 'ambassador';
        }

        return {
            canRenew: true,
            message: expiredSubscriptions.length > 0 ? 'Subscription expired. Ready for renewal.' : 'Can extend current subscription.',
            subscriptionType: subscriptionType,
            hasActiveSubscription: activeSubscriptions.length > 0,
            expiredSubscriptions: expiredSubscriptions.map(sub => ({
                id: sub._id,
                type: sub.subscriptionType,
                endDate: sub.endDate,
                status: sub.status
            }))
        };
    } catch (error) {
        console.error('Error checking renewal eligibility:', error);
        throw error;
    }
};

module.exports = {
    createNewSubscriptionOrder,
    createRenewalOrder,
    processRenewalPayment,
    processNewSubscriptionPayment,
    associateSubscriptionWithUser,
    verifyPayment,
    getPaymentHistory,
    checkRenewalEligibility
};
