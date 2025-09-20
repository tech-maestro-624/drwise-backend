// models/Sale.js

const mongoose = require('mongoose');
const { generateUniqueTransactionId } = require('../utils/idGenerator');

const SaleSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    required: true,
  },
  leadId: {
    type: String,
    required: true,
  },
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false,
  },
  price: {
    type: Number,
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false,
  },
  conversionDate: {
    type: Date,
    default: Date.now,
  },
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  referralBonus: {
    type: Number,
    required: true,
  },
}, {timestamps : true});

// Pre-save middleware to generate unique transactionId
SaleSchema.pre('save', async function(next) {
  if (this.isNew && !this.transactionId) {
    try {
      this.transactionId = await generateUniqueTransactionId();
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Sale', SaleSchema);
