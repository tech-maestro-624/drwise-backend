// models/Wallet.js
const mongoose = require('mongoose');
// We only import Transaction if we want to use it inside the .methods. 
// Alternatively, we can receive it as a parameter.
const Transaction = require('./Transaction');

const WalletSchema = new mongoose.Schema(
  {
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
      default: 0,
      required: true,
    },
    // Note: We store array of ObjectIds referencing the Transaction model
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
      },
    ],
  },
  { timestamps: true }
);

/**
 * Adds a transaction to this wallet.
 *  - `type` can be 'credit', 'debit', 'JOINING_BONUS', etc.
 *  - `amount` is how much to add or subtract.
 *  - `description` is optional text.
 *  - `userId` is the user responsible for or associated with this transaction.
 *
 * This creates and saves a Transaction document, then pushes its _id to `this.transactions`.
 */
// models/Wallet.js
WalletSchema.methods.addTransaction = async function (
  type,
  amount,
  description,
  userId,
  useRefBonus = false
) {
  if (type === 'credit' || type === 'JOINING_BONUS' || type === 'REFERRAL_BONUS') {
    if (useRefBonus) {
      this.refBonus += Number(amount);
    } else {
      this.balance += Number(amount);
    }
  } else if (type === 'debit') {
    this.balance -= Number(amount);
  }

  // 1) Create the Transaction document
  const newTransaction = await Transaction.create({
    wallet: this._id,
    userId,
    type,
    amount,
    date: new Date(),
    description,
  });

  this.transactions.push(newTransaction._id);

  await this.save();

  return newTransaction;
};


WalletSchema.methods.transferReferralBonusToBalance = async function () {
  this.balance += this.refBonus;
  this.refBonus = 0;
  await this.save();
};

module.exports = mongoose.model('Wallet', WalletSchema);



module.exports = mongoose.model('Wallet', WalletSchema);
