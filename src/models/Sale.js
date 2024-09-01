// models/Sale.js

const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  price: {
    type: Number,
    required: true,
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
});

module.exports = mongoose.model('Sale', SaleSchema);
