// models/Lead.js

const mongoose = require('mongoose');
const { generateUniqueLeadId } = require('../utils/idGenerator');

// const notesSchema = new mongoose.Schema({
//   message: { type: String, required: true },
// }, { timestamps: true });

const LeadSchema = new mongoose.Schema({
  leadId: {
    type: String,
    unique: true,
    required: true,
  },
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
    required: true,
  },
  notes: [],
  status: {
    type: String,
    default: 'Pending',
  },
  transactionId: {
    type: String,
    required: false,
    default: null,
  },
},{timestamps : true});

// Pre-save middleware to generate unique leadId
LeadSchema.pre('save', async function(next) {
  if (this.isNew && !this.leadId) {
    try {
      this.leadId = await generateUniqueLeadId();
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Lead', LeadSchema);
