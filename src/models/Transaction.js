// models/Transaction.js
const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'credit',
        'debit',
        'JOINING_BONUS',
        'REFERRAL_BONUS',
        'CONVERSION_BONUS',
        'LOCKED_REFERRAL_BONUS',
        'UNLOCK_REFERRAL_BONUS',
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
    transactionId: {
      type: String,
      default: null,
    },
    isCredit:{
      type: Boolean,
      default: false,
    },
    scheduledCreditDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', TransactionSchema);
