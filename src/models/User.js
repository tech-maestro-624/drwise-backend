// models/User.js

const mongoose = require('mongoose');
const Wallet = require('./Wallet')

const UserSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  name : String,
  email : String,
  otp: {
    type: String,
    required: true,
  },
  otpExpires: {
    type: Date,
    required: true,
  },
  roles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
  }],
  permissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permission',
  }],
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
  },
  referredBy : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'User',
    required : false,
    default : null
  },
  pushNotificationToken : String,
  withdrawalMethod : String,
  withdrawalDetails : {
    type : mongoose.Schema.Types.Mixed,
    required : false,
    default : {}
  },
  verified : {
    type : Boolean,
    default : false
  },
  refCode : String,
},{timestamps : true});


UserSchema.pre('save', async function (next) {
  if (this.isNew && !this.refCode) {
    try {
      // Generate a unique identifier
      const nanoid = customAlphabet('1234567890abcdef', 6);
      const uniqueId = nanoid();

      // Extract the first name or use a default
      const firstName = this.name ? this.name.split(' ')[0] : 'user';

      // Combine and sanitize
      this.refCode = `${firstName.toLowerCase()}-${uniqueId}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});


UserSchema.post('save', async function (doc) {
  try {
    if (!doc.wallet) {
      // Create a wallet for the user
      const wallet = new Wallet({
        user: doc._id,
        balance: 0, // Default balance
      });
      const savedWallet = await wallet.save();

      // Update the user with the wallet ID
      doc.wallet = savedWallet._id;
      await doc.save(); // Save the user with the new wallet reference
    }
  } catch (error) {
    console.error('Error creating wallet for user:', error);
  }
});

module.exports = mongoose.model('User', UserSchema);
