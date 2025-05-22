const mongoose = require('mongoose');

const affiliateSchema = new mongoose.Schema({
    refferedBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref : 'User'
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phoneNumber : String,
    status : String,
    verified : {type : Boolean, default : false },
    // Subscription related fields
    subscriptionStatus: {
        type: String,
        enum: ['active', 'inactive', 'expired', 'pending'],
        default: 'inactive'
    },
    subscriptionStartDate: {
        type: Date,
        default: null
    },
    subscriptionEndDate: {
        type: Date,
        default: null
    },
    subscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
        default: null
    }
},{timestamps : true});

module.exports = mongoose.model('Affiliate', affiliateSchema);
