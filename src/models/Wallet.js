// models/Wallet.js

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
  transactions: [
    {
      type: {
        type: String,
        enum: ['credit', 'debit'],
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
    },
  ],
},{timestamps : true});

module.exports = mongoose.model('Wallet', WalletSchema);
