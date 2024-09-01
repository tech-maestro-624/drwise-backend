// models/Lead.js

const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Converted', 'Rejected'],
    default: 'Pending',
  },

},{timestamps : true});

module.exports = mongoose.model('Lead', LeadSchema);