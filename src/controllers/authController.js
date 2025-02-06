// src/controllers/authController.js

const User = require('../models/User');
const crypto = require('crypto');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { getConfig } = require('../services/configurationService');
const subscriptionService = require('../services/subscriptionService');

exports.register = async (req, res) => {
  const { name, email, phoneNumber, referralCode, otp, verified } = req.body;

  try {
    const userRole = await getConfig('USER_ROLE_ID');
    const ambassadorRole = await getConfig('AMBASSADOR_ROLE_ID');
    let referredBy = null;
    let ambassadorId = null;
    const normalizedReferralCode = referralCode.trim().toLowerCase();

    if (referralCode) {
      const referringUser = await User.findOne({ refCode: normalizedReferralCode });
      if (referringUser) {
        referredBy = referringUser._id;
        if (referringUser.roles.includes(ambassadorRole)) {
          ambassadorId = referringUser._id;
        }
      } else {
        return res.status(400).json({ message: 'Invalid referral code' });
      }
    }

    const existingUser = await User.findOne({ $or: [{ phoneNumber }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this phone number or email already exists' });
    }

    const newUser = new User({
      name,
      email,
      phoneNumber,
      roles: [userRole],
      referredBy,
      ambassadorId,
      otp,
      otpExpires: new Date(),
      verified
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
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(400).json({ message: 'User does not exist. Please register first.' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000;

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    res.status(200).json({ message: 'OTP sent successfully', otp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

exports.login = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(400).json({ message: 'Incorrect phone number.' });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const populatedUser = await User.findById(user._id)
      .populate({ path: 'roles', populate: { path: 'permissions', model: 'Permission' } })
      .populate('permissions');

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: populatedUser
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Login failed' });
  }
};

exports.logout = async (req, res) => {
  return res.status(200).json({ message: 'Logout successful (client must discard token)' });
};

exports.getUserData = async (req, res) => {
  try {
    const user = req.user;
    return res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get user data' });
  }
};

exports.registerAmbassador = async (req, res) => {
  const { name, email, phoneNumber, startDate, endDate, subscriptionAmount, otp, otpExpires } = req.body;

  try {
    const ambassadorRole = await getConfig('AMBASSADOR_ROLE_ID');

    const existingUser = await User.findOne({ $or: [{ phoneNumber }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this phone number or email already exists' });
    }

    const newUser = new User({
      name,
      email,
      phoneNumber,
      roles: [ambassadorRole],
      otp,
      otpExpires,
      verified: true
    });
    await newUser.save();

    try {
      await subscriptionService.createSubscription(
        newUser._id,
        startDate,
        endDate,
        subscriptionAmount,
        ambassadorRole.value
      );
    } catch (subscriptionError) {
      await User.findByIdAndDelete(newUser._id);
      return res.status(500).json({ message: 'Failed to create subscription for ambassador' });
    }

    res.status(201).json({ message: 'Ambassador registration successful', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to register ambassador' });
  }
};
