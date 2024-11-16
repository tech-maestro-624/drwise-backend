// controllers/authController.js

const User = require('../models/User');
const passport = require('passport');
// const twilio = require('twilio');
const {getConfig} = require('../services/configurationService')
const crypto = require('crypto');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
// const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);


exports.register = async (req, res) => {
  const { name, email, phoneNumber, referralCode, otp } = req.body;

  try {
    let userRole = await getConfig('USER_ROLE_ID');
    let referredBy = null;

    // Check if the referral code is valid
    if (referralCode) {
      const referringUser = await User.findOne({ refCode: referralCode });
      if (referringUser) {
        referredBy = referringUser._id;
      } else {
        return res.status(400).json({ message: 'Invalid referral code' });
      }
    }

    // Check if a user with this phone number or email already exists
    let existingUser = await User.findOne({ $or: [{ phoneNumber }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this phone number or email already exists' });
    }

    // Create a new user
    const newUser = new User({
      name,
      email,
      phoneNumber,
      roles: [userRole],
      referredBy,
      otp,
      otpExpires:new Date()
    });

    await newUser.save();
    res.status(201).json({ message: 'Registration successful', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to register user' });
  }
};

exports.sendOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    // Check if the user with the provided phone number exists
    let user = await User.findOne({ phoneNumber });
    
    if (!user) {
      // If user doesn't exist, return an error
      return res.status(400).json({ message: 'User does not exist. Please register first.' });
    }

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Set OTP expiration time (e.g., 5 minutes)
    const otpExpires = Date.now() + 5 * 60 * 1000;

    // Update existing user with new OTP and expiration
    user.otp = otp;
    user.otpExpires = otpExpires;

    await user.save();

    // Send OTP via SMS
    // await client.messages.create({
    //   body: `Your OTP is ${otp}`,
    //   to: phoneNumber,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    // });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

exports.sendOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    // Check if the user with the provided phone number exists
    let user = await User.findOne({ phoneNumber });
    
    if (!user) {
      // If user doesn't exist, return an error
      return res.status(400).json({ message: 'User does not exist. Please register first.' });
    }

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Set OTP expiration time (e.g., 5 minutes)
    const otpExpires = Date.now() + 5 * 60 * 1000;

    // Update existing user with new OTP and expiration
    user.otp = otp;
    user.otpExpires = otpExpires;

    await user.save();

    // Send OTP via SMS
    // await client.messages.create({
    //   body: `Your OTP is ${otp}`,
    //   to: phoneNumber,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    // });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};


// exports.login = (req, res, next) => {
//   passport.authenticate('local', (err, user, info) => {
//     if (err) {
//       return next(err);
//     }

//     if (!user) {
//       return res.status(400).json({ message: info.message });
//     }

//     req.logIn(user, (err) => {
//       if (err) {
//         return next(err);
//       }
//       return res.status(200).json({ message: 'Login successful' });
//     });
//   })(req, res, next);
// };

exports.login = (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!user) {
      return res.status(400).json({
        message: info ? info.message : 'Login failed',
        user
      });
    }

    try {
      req.login(user, async (err) => {
        if (err) {
          return res.status(500).send(err);
        }

        const sessionToken = require('crypto').randomBytes(64).toString('hex');

        // Example of setting a session token in Redis, uncomment if needed
        // if (user.roles.includes('admin') || user.roles.includes('hr')) {
        //   await redisClient.set(`userSession:${user._id}`, sessionToken, { EX: 13 * 60 * 60 });
        // }

       

        const populatedUser = await getUserWithRolesAndPermissions(user._id);
        return res.json({ user: populatedUser });

      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  })(req, res, next);
};

const getUserWithRolesAndPermissions = async (userId) => {
  return await User.findById(userId)
    .populate({
      path: 'roles',
      populate: {
        path: 'permissions',
        model: 'Permission'
      }
    })
    .exec();
};


exports.logout = (req, res) => {
  req.logout(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.status(200).json({ message: 'Logout successful' });
  });
};

exports.getUserData = async(req,res) => {
  const user = req.user
  const populatedUser = await getUserWithRolesAndPermissions(user._id);
  return res.json({ user: populatedUser });
}