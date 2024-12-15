// Suggested code may be subject to a license. Learn more: ~LicenseLog:3593555243.
const Subscription = require('../models/Subscription');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});


const createSubscription = async (userId,startDate,endDate, price) => {
    try {
        const subscription = new Subscription({
            ambassadorId : userId,
            startDate,
            endDate,
            status: 'active',
            price,
        });

        // const order = await razorpay.orders.create({
        //     amount: price * 100,
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
        return {subscription};
    } catch(error) {
        console.log(error)
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

module.exports = {
    createSubscription,
    getSubscription,
    updateSubscription,
    deleteSubscription,
    processWebhook
};



module.exports = {
    createSubscription,
    getSubscription,
    updateSubscription,
    deleteSubscription
};
