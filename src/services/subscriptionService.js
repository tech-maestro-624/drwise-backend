// Suggested code may be subject to a license. Learn more: ~LicenseLog:3593555243.
const Subscription = require('../models/Subscription');
const SubscriptionPlans = require('../models/SubscriptionPlans');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


const createSubscription = async (userId, affiliateId, planId, startDate, endDate) => {
    try {
        // Get the subscription plan details
        const plan = await SubscriptionPlans.findById(planId);
        if (!plan) {
            throw new Error('Subscription plan not found');
        }

        // Determine subscription type based on plan name
        const subscriptionType = plan.name.toLowerCase() === 'ambassador' ? 'ambassador' : 'affiliate';

        const subscription = new Subscription({
            userId: userId || null,
            affiliateId: affiliateId || null,
            subscriptionType,
            startDate,
            endDate,
            status: 'active',
            planDetails: {
                name: plan.name,
                price: plan.price,
                features: plan.features
            }
        });

        // const order = await razorpay.orders.create({
        //     amount: plan.price * 100,
        //     currency: "INR",
        //     receipt: subscription._id.toString(),
        //     notes: {
        //         subscription_id: subscription._id.toString()
        //     },
        //     notify: {
        //         sms: true,
        //         email: true,
        //         whatsapp: true
        //     }
        // });
        // subscription.orderId = order.id;

        await subscription.save();
        return { subscription };
    } catch(error) {
        console.log("error :", error);
        throw error;
    }
};

// Create subscription with plan type (ambassador/affiliate) - convenience method
const createSubscriptionByType = async (userId, affiliateId, type, startDate, endDate) => {
    try {
        // Find the plan by type
        const planName = type === 'ambassador' ? 'Ambassador' : 'Affiliate';
        const plan = await SubscriptionPlans.findOne({ name: planName });

        if (!plan) {
            throw new Error(`${type} subscription plan not found`);
        }

        return await createSubscription(userId, affiliateId, plan._id, startDate, endDate);
    } catch(error) {
        console.log("error :", error);
        throw error;
    }
};


const getSubscription = async (id) => {
    try {
        const subscription = await Subscription.findById(id);
        if(!subscription) {
            throw new Error('Subscription Not Found');
        }
        return subscription;
    } catch (error) {
        throw error
    }
}

const getAllSubscriptions = async (query = {}) => {
    try {
        const { page = 1, limit = 10, userId, status, subscriptionType } = query;
        const skip = (page - 1) * limit;

        let filter = {};
        if (userId) {
            // Convert userId string to ObjectId for proper filtering
            const mongoose = require('mongoose');
            filter.userId = new mongoose.Types.ObjectId(userId);
        }
        if (status) filter.status = status;
        if (subscriptionType) filter.subscriptionType = subscriptionType;

        const subscriptions = await Subscription.find(filter)
            .populate('userId', 'name email phoneNumber')
            .populate('affiliateId', 'name email phoneNumber')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Subscription.countDocuments(filter);

        return {
            subscriptions,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        };
    } catch (error) {
        throw error;
    }
};

const getSubscriptionById = async (id) => {
    try {
        const subscription = await Subscription.findById(id)
            .populate('userId', 'name email phoneNumber')
            .populate('affiliateId', 'name email phoneNumber');

        if (!subscription) {
            throw new Error('Subscription not found');
        }

        return subscription;
    } catch (error) {
        throw error;
    }
};

const updateSubscription = async (id, updates) => {
    try {
        const subscription = await Subscription.findByIdAndUpdate(id, updates, {new:true});
        if (!subscription) {
            throw new Error('Subscription Not Found')
        }
        return subscription;
    } catch (error) {
        throw error;
    }
}

const deleteSubscription = async (id) => {
    try {
        const subscription = await Subscription.findByIdAndDelete(id);
        if (!subscription) {
            throw new Error('Subscription not found')
        }
    } catch (error) {
        throw error
    }
}

const verifyPaymentSignature = async (razorpay_signature, razorpay_payment_id, razorpay_order_id) => {
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');
    return digest === razorpay_signature;
}

const processWebhook = async (event) => {
    try {
        const {payload} = event;

        if(payload.entity.notes.subscription_id){
            const subscriptionId = payload.entity.notes.subscription_id;
            const subscription = await Subscription.findById(subscriptionId);
            if(!subscription) {
                throw new Error('Subscription Not Found')
            }

            if(payload.event === 'payment.captured'){
                const isSignatureValid = await verifyPaymentSignature(payload.payment.entity.razorpay_signature, payload.payment.entity.razorpay_payment_id, payload.payment.entity.order_id)

                if(!isSignatureValid) {
                    throw new Error('Invalid Signature')
                }
                await updateSubscription(subscriptionId, {
                    status: 'active',
                    paymentId: payload.payment.entity.id,
                })
            } else if(payload.event === 'payment.failed'){
                await updateSubscription(subscriptionId, {
                    status: 'failed',
                })
            }
        } else {
            console.log('Webhook received without subscription ID')
        }

    } catch (error) {
        console.log(error)
        throw error;
    }
}

// Renew subscription (extend end date)
const renewSubscription = async (subscriptionId, extensionDays = 365) => {
    try {
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        const now = new Date();
        let newEndDate;

        // If subscription is still active, extend from current end date
        // If expired, start from today
        if (subscription.endDate > now) {
            newEndDate = new Date(subscription.endDate.getTime() + (extensionDays * 24 * 60 * 60 * 1000));
        } else {
            newEndDate = new Date(now.getTime() + (extensionDays * 24 * 60 * 60 * 1000));
        }

        subscription.endDate = newEndDate;
        subscription.status = 'active';

        await subscription.save();

        // Clear cache
        await cacheService.deleteByPattern('subscriptions:*');

        return subscription;
    } catch (error) {
        console.error('Error renewing subscription:', error);
        throw error;
    }
};

// Check if subscription is expired
const isSubscriptionExpired = async (subscriptionId) => {
    try {
        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) {
            throw new Error('Subscription not found');
        }

        const now = new Date();
        return {
            expired: subscription.endDate < now,
            endDate: subscription.endDate,
            daysRemaining: Math.ceil((subscription.endDate - now) / (1000 * 60 * 60 * 24))
        };
    } catch (error) {
        console.error('Error checking subscription expiry:', error);
        throw error;
    }
};

// Get subscription status for user/affiliate
const getSubscriptionStatus = async (userId, affiliateId) => {
    try {


        let filter = {};

        if (userId) {
            const mongoose = require('mongoose');
            filter.userId = new mongoose.Types.ObjectId(userId);
        } else if (affiliateId) {
            const mongoose = require('mongoose');
            filter.affiliateId = new mongoose.Types.ObjectId(affiliateId);
        } else {
            throw new Error('User ID or Affiliate ID is required');
        }



        console.log('SubscriptionService - getSubscriptionStatus - Query filter:', filter);
        console.log('SubscriptionService - getSubscriptionStatus - Filter userId type:', typeof filter.userId);

        const subscriptions = await Subscription.find(filter)
            .populate('userId', 'name email')
            .populate('affiliateId', 'name email')
            .sort({ endDate: -1 });

        console.log('SubscriptionService - Found subscriptions:', {
            userId,
            affiliateId,
            filter,
            subscriptionCount: subscriptions.length,
            subscriptions: subscriptions.map(sub => ({
                id: sub._id,
                userId: sub.userId,
                affiliateId: sub.affiliateId,
                status: sub.status,
                subscriptionType: sub.subscriptionType,
                endDate: sub.endDate
            }))
        });

        if (subscriptions.length === 0) {
            return {
                hasSubscription: false,
                status: 'no_subscription',
                message: 'No active subscription found'
            };
        }

        const now = new Date();
        const activeSubscriptions = subscriptions.filter(sub => sub.endDate >= now && sub.status === 'active');
        const expiredSubscriptions = subscriptions.filter(sub => sub.endDate < now);

        let primarySubscription = null;
        let status = 'no_subscription';

        if (activeSubscriptions.length > 0) {
            // Find ambassador subscription first (higher priority)
            primarySubscription = activeSubscriptions.find(sub => sub.subscriptionType === 'ambassador') || activeSubscriptions[0];
            status = 'active';
        } else if (expiredSubscriptions.length > 0) {
            primarySubscription = expiredSubscriptions[0];
            status = 'expired';
        }

        return {
            hasSubscription: true,
            status: status,
            subscription: primarySubscription,
            subscriptionType: primarySubscription?.subscriptionType,
            endDate: primarySubscription?.endDate,
            daysRemaining: primarySubscription ? Math.ceil((primarySubscription.endDate - now) / (1000 * 60 * 60 * 24)) : 0,
            canRenew: status === 'expired' || status === 'active'
        };
    } catch (error) {
        console.error('Error getting subscription status:', error);
        throw error;
    }
};

module.exports = {
    createSubscription,
    createSubscriptionByType,
    renewSubscription,
    isSubscriptionExpired,
    getSubscriptionStatus,
    getSubscription,
    getAllSubscriptions,
    getSubscriptionById,
    updateSubscription,
    deleteSubscription,
    processWebhook
};
