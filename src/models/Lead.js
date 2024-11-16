// models/Lead.js

const mongoose = require('mongoose');

// const notesSchema = new mongoose.Schema({
//   message: { type: String, required: true },
// }, { timestamps: true });

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
  categoryId : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false,
  },
  productId : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false,
  },
  notes: [],
  status: {
    type: String,
    enum: ['Pending', 'Converted', 'Rejected'],
    default: 'Pending',
  },
},{timestamps : true});

module.exports = mongoose.model('Lead', LeadSchema);
