const mongoose = require('mongoose');

const SubscriptionPlansSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    price: {
        type: Number,
        required: true,
    },
    features: {
        type: [String],
        required: false,
    },
}, { timestamps: true });

SubscriptionPlansSchema.index({ name: 1, price: 1 });

module.exports = mongoose.model('SubscriptionPlans', SubscriptionPlansSchema);