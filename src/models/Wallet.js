const mongoose = require('mongoose');
const Transaction = require('./Transaction');

const LockedReferralSchema = new mongoose.Schema({
  referredUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  locked: {
    type: Boolean,
    default: true,
  },
  lockedAt: {
    type: Date,
    default: Date.now,
  },
  unlockedAt: {
    type: Date,
    default: null,
  },
});

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
    lockedRefBonus: {
      type: Number,
      default: 0,
    },
    lockedReferrals: [LockedReferralSchema],
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
      },
    ],
  },
  { timestamps: true }
);

WalletSchema.methods.addTransaction = async function (
  type,
  amount,
  description,
  userId,
  useRefBonus = false
) {
  if (
    type === 'credit' ||
    type === 'JOINING_BONUS' ||
    type === 'REFERRAL_BONUS' ||
    type === 'credit'
  ) {
    if (useRefBonus) {
      this.refBonus += Number(amount);
    } else {
      this.balance += Number(amount);
    }
  } else if (type === 'debit') {
    this.balance -= Number(amount);
  }

  const newTransaction = await Transaction.create({
    wallet: this._id,
    userId,
    type,
    amount,
    date: new Date(),
    description,
    isCredit: true, // Set to true for immediate credits
  });

  this.transactions.push(newTransaction._id);
  await this.save();

  return newTransaction;
};

WalletSchema.methods.addLockedReferral = async function (
  referredUserId,
  amount,
  referredUserName
) {
  this.lockedReferrals.push({
    referredUser: referredUserId,
    amount,
    locked: true,
    lockedAt: new Date(),
  });

  this.lockedRefBonus += amount;
  await this.save();

  const lockedReferralTx = await Transaction.create({
    wallet: this._id,
    userId: this.user,
    type: 'LOCKED_REFERRAL_BONUS', 
    amount,
    date: new Date(),
    description: `Locked referral bonus for user ${referredUserName || referredUserId}`,
  });

  this.transactions.push(lockedReferralTx._id);
  await this.save();

  return lockedReferralTx;
};

WalletSchema.methods.unlockReferralForUser = async function (
  referredUserId,
  referredUserName
) {
  const lockedItem = this.lockedReferrals.find(
    (item) =>
      item.locked &&
      item.referredUser.toString() === referredUserId.toString()
  );
  if (!lockedItem) {
    return null;
  }

  lockedItem.locked = false;
  lockedItem.unlockedAt = new Date();
  this.balance += lockedItem.amount;
  this.lockedRefBonus -= lockedItem.amount;

  const unlockTx = await Transaction.create({
    wallet: this._id,
    userId: this.user,
    type: 'UNLOCK_REFERRAL_BONUS', // or "UNLOCKED_REFERRAL_BONUS"
    amount: lockedItem.amount,
    date: new Date(),
    description: `Unlocked referral bonus from user ${referredUserName || referredUserId}`,
  });

  this.transactions.push(unlockTx._id);
  await this.save();

  return unlockTx;
};

module.exports = mongoose.model('Wallet', WalletSchema);
