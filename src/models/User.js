// models/User.js
const mongoose = require('mongoose');
const Wallet = require('./Wallet');
const Configuration = require('./Configuration');
const Transaction = require('./Transaction');

const UserSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
  },
  otpVerified: {
    type: Boolean,
    default: false,
  },
  name: String,
  email: String,
  otp: String,
  otpExpires: {
    type: Date,
    default: Date.now,
  },
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
    },
  ],
  permissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Permission',
    },
  ],
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  pushNotificationToken: String,
  withdrawalMethod: String,
  withdrawalDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  verified: {
    type: Boolean,
    default: false,
  },
  refCode: String,
  acceptedPolicies: {
    type: Boolean,
    default: false,
  },
  ambassadorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  active: { type: Boolean, default: true },
  image: String,

  referralBonusProcessed: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  this._wasNew = this.isNew;

  if (this.isNew && !this.refCode) {
    try {
      const { customAlphabet } = await import('nanoid');
      const nanoid = customAlphabet('1234567890abcdef', 4);
      const uniqueId = nanoid();
      const firstName = this.name ? this.name.split(' ')[0] : 'user';
      const prefix = firstName.substring(0, 4).toLowerCase();
      this.refCode = `${prefix}-${uniqueId}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

UserSchema.post('save', async function (doc) {
  if (!this._wasNew) {
    return;
  }


  try {
    // 1) Possibly load a JOINING_BONUS from config
    const config = await Configuration.findOne({ key: 'JOINING_BONUS' });
    const joiningBonus = Number(config?.value) || 0;

    // 2) Create the new user’s wallet if needed
    let userWallet;
    if (!doc.wallet) {
      userWallet = new Wallet({
        user: doc._id,
        balance: 0,
        transactions: [],
      });
      await userWallet.save();

      await mongoose.model('User').updateOne(
        { _id: doc._id },
        { wallet: userWallet._id }
      );
    } else {
      userWallet = await Wallet.findById(doc.wallet);
    }

    // 3) If there's a joining bonus, credit to the new user’s wallet
    if (userWallet && joiningBonus > 0) {
      userWallet.balance += joiningBonus;
      await userWallet.save();

      const joiningBonusTransaction = new Transaction({
        wallet: userWallet._id,
        userId: doc._id,
        type: 'JOINING_BONUS',
        amount: joiningBonus,
        date: new Date(),
        description: `Welcome bonus of ${joiningBonus} coins.`,
      });
      await joiningBonusTransaction.save();

      userWallet.transactions.push(joiningBonusTransaction._id);
      await userWallet.save();
    }

    if (doc.referredBy && !doc.referralBonusProcessed) {
      const referralBonus = joiningBonus;

      let referrerWallet = await Wallet.findOne({ user: doc.referredBy });
      if (!referrerWallet) {
        referrerWallet = new Wallet({
          user: doc.referredBy,
          balance: 0,
          transactions: [],
        });
        await referrerWallet.save();
      }

      if (referralBonus > 0) {
        await referrerWallet.addLockedReferral(doc._id, referralBonus, doc.name);
      }

      await mongoose.model('User').updateOne(
        { _id: doc._id },
        { referralBonusProcessed: true }
      );
    }
  } catch (error) {
    console.error('Error creating wallet or processing bonus:', error);
  }
});


module.exports = mongoose.model('User', UserSchema);
