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
      status : {
        type : String,
        required : false,
      },
      transactionId : String,
      description: String,
    },
  ],
},{timestamps : true});

WalletSchema.methods.addTransaction = async function (type, amount, description) {
  if (type === 'credit') {
    this.balance += Number(amount);
  } else if (type === 'debit') {
    this.balance -= Number(amount);
  }

  this.transactions.push({
    type,
    amount : Number(amount),
    date: new Date(),
    description,
  });

  await this.save();
};

module.exports = mongoose.model('Wallet', WalletSchema);
