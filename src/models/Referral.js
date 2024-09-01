// models/Referral.js

const mongoose = require('mongoose');

const ReferralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
  },
  bonus: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending',
  }
},{timestamps : true});

module.exports = mongoose.model('Referral', ReferralSchema);
