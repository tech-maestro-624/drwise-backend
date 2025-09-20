// models/Transaction.js
const mongoose = require('mongoose');
const { generateUniqueTransactionId } = require('../utils/idGenerator');

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
      unique: true,
      required: true,
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

// Pre-save middleware to generate unique transactionId
TransactionSchema.pre('save', async function(next) {
  if (this.isNew && !this.transactionId) {
    try {
      this.transactionId = await generateUniqueTransactionId();
    } catch (error) {
      return next(error);
    }
  }
  next();
});

module.exports = mongoose.model('Transaction', TransactionSchema);
