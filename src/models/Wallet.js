const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
    required: true,
  },
  refBonus: {
    type: Number,
    default: 0, // Holds the referral bonuses for Ambassadors
    required: true,
  },
  transactions: [
    {
      type: {
        type: String,
        enum: [
          'credit',
          'debit',
          'JOINING_BONUS',
          'REFERRAL_BONUS',
          'CONVERSION_BONUS',
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
      description: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved',
      },
      transactionId: { type: String, default: null },
    },
  ],
}, { timestamps: true });

WalletSchema.methods.addTransaction = async function (type, amount, description, useRefBonus = false) {
  if (type === 'credit' || type === 'JOINING_BONUS' || type === 'REFERRAL_BONUS') {
    if (useRefBonus) {
      this.refBonus += Number(amount);
    } else {
      this.balance += Number(amount);
    }
  } else if (type === 'debit') {
    this.balance -= Number(amount);
  }

  this.transactions.push({
    type,
    amount: Number(amount),
    date: new Date(),
    description,
  });

  await this.save();
};

WalletSchema.methods.transferReferralBonusToBalance = async function () {
  this.balance += this.refBonus;
  this.refBonus = 0;
  await this.save();
};

module.exports = mongoose.model('Wallet', WalletSchema);
