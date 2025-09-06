// src/controllers/authController.js

const User = require('../models/User');
const crypto = require('crypto');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { getConfig } = require('../services/configurationService');
const subscriptionService = require('../services/subscriptionService');
const fileService = require('../services/fileService');
const userService = require('../services/userService');

exports.register = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Extract user data from request body
    const userData = req.body;

    // Extract bank details from request body (if provided)
    const bankDetails = {
      accountNumber: req.body.accountNumber,
      ifscCode: req.body.ifscCode,
      upiId: req.body.upiId,
      bankName: req.body.bankName,
      accountHolderName: req.body.accountHolderName,
      branchName: req.body.branchName,
    };

    // Get uploaded files
    const files = req.files || {};

    // Get configuration values
    const userRole = await getConfig('USER_ROLE_ID');
    const ambassadorRole = await getConfig('AMBASSADOR_ROLE_ID');

    // Handle referral code
    let referredBy = null;
    let ambassadorId = null;

    if (userData.referralCode) {
      const normalizedReferralCode = userData.referralCode.trim().toLowerCase();
      const referringUser = await User.findOne({ refCode: normalizedReferralCode }).session(session);
      if (referringUser) {
        referredBy = referringUser._id;
        if (referringUser.roles.includes(ambassadorRole)) {
          ambassadorId = referringUser._id;
        }
      } else {
        throw new Error('Invalid referral code');
      }
    }

    // Check for existing user
    const existingUser = await User.findOne({
      $or: [{ phoneNumber: userData.phoneNumber }]
    }).session(session);

    if (existingUser) {
      throw new Error('User with this phone number exists');
    }

    // Upload files and get file IDs
    const uploadedFiles = {};
    const filePromises = [];

    if (files.aadharFile && files.aadharFile.length > 0) {
      filePromises.push(
        fileService.uploadFile(files.aadharFile[0], 'user', 'documents')
          .then(file => { uploadedFiles.aadharFileId = file._id; })
      );
    }

    if (files.selfieFile && files.selfieFile.length > 0) {
      filePromises.push(
        fileService.uploadFile(files.selfieFile[0], 'user', 'documents')
          .then(file => { uploadedFiles.selfieFileId = file._id; })
      );
    }

    // Wait for all file uploads to complete
    await Promise.all(filePromises);

    // Create user with file references and bank details
    const newUserData = {
      name: userData.name,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      roles: [userRole],
      referredBy,
      ambassadorId,
      otp: userData.otp || crypto.randomInt(100000, 999999).toString(),
      otpExpires: new Date(),
      verified: false,
      verificationStatus: files.aadharFile && files.selfieFile ? 'pending' : 'pending',
      verificationSubmittedAt: files.aadharFile && files.selfieFile ? new Date() : null,
      // Bank details
      accountNumber: bankDetails.accountNumber || null,
      ifscCode: bankDetails.ifscCode || null,
      upiId: bankDetails.upiId || null,
      bankName: bankDetails.bankName || null,
      accountHolderName: bankDetails.accountHolderName || null,
      branchName: bankDetails.branchName || null,
      // File references
      aadharFile: uploadedFiles.aadharFileId || null,
      selfieFile: uploadedFiles.selfieFileId || null,
    };

    const newUser = await userService.create(newUserData);

    // Commit transaction
    await session.commitTransaction();

    // Generate token for the user
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful! Your account is pending verification.',
      user: newUser,
      uploadedFiles,
      verificationPending: true,
      redirectToLogin: true
    });
  } catch (err) {
    // Abort transaction on error
    await session.abortTransaction();

    console.error('Registration error:', err);

    // Handle specific error messages
    if (err.message === 'Invalid referral code') {
      return res.status(400).json({ message: err.message });
    }
    if (err.message === 'User with this phone number or email already exists') {
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: 'Failed to register user' });
  } finally {
    session.endSession();
  }
};

exports.getUserByPhoneNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const user = await User.findOne({ phoneNumber });
    console.log(user);
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user by phone number' });
  }

};

exports.sendOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const user = await User.findOne({ phoneNumber });
    console.log(user);
    
    if (!user) {
      return res.status(400).json({ message: 'User does not exist. Please register first.' });
    }

    if (!user.active) {
      return res.status(400).json({ message: 'Your account Deactivate, Contact Admin' });
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

    // Check if user account is verified
    // Use verified field as primary check, with verificationStatus as fallback
    const isVerified = user.verified === true || user.verificationStatus === 'approved';

    if (!isVerified) {
      if (user.verificationStatus === 'pending') {
        return res.status(403).json({
          message: 'Account verification is pending. Please wait for admin approval.',
          verificationStatus: 'pending'
        });
      } else if (user.verificationStatus === 'rejected') {
        return res.status(403).json({
          message: 'Account verification was rejected. Please contact support.',
          verificationStatus: 'rejected'
        });
      } else {
        // Handle 'required', null, undefined, or any other status
        return res.status(403).json({
          message: 'Account verification is required. Please complete the verification process.',
          verificationStatus: user.verificationStatus || 'required'
        });
      }
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

    if (!user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if user has required fields
    if (!user._id) {
      return res.status(500).json({ message: 'User data corrupted' });
    }

    return res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get user data' });
  }
};

exports.updateUserDocuments = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId } = req.params;
    const files = req.files || {};

    const user = await User.findById(userId).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    const uploadedFiles = {};
    const filePromises = [];

    // Delete existing files if new ones are provided
    if (files.aadharFile && files.aadharFile.length > 0 && user.aadharFile) {
      await fileService.deleteFile(user.aadharFile.toString());
      filePromises.push(
        fileService.uploadFile(files.aadharFile[0], 'user', 'documents')
          .then(file => { uploadedFiles.aadharFileId = file._id; })
      );
    }

    if (files.selfieFile && files.selfieFile.length > 0 && user.selfieFile) {
      await fileService.deleteFile(user.selfieFile.toString());
      filePromises.push(
        fileService.uploadFile(files.selfieFile[0], 'user', 'documents')
          .then(file => { uploadedFiles.selfieFileId = file._id; })
      );
    }

    // Upload new files if no existing files
    if (files.aadharFile && files.aadharFile.length > 0 && !user.aadharFile) {
      filePromises.push(
        fileService.uploadFile(files.aadharFile[0], 'user', 'documents')
          .then(file => { uploadedFiles.aadharFileId = file._id; })
      );
    }

    if (files.selfieFile && files.selfieFile.length > 0 && !user.selfieFile) {
      filePromises.push(
        fileService.uploadFile(files.selfieFile[0], 'user', 'documents')
          .then(file => { uploadedFiles.selfieFileId = file._id; })
      );
    }

    await Promise.all(filePromises);

    // Update user with new file references
    const updateData = {};
    if (uploadedFiles.aadharFileId) {
      updateData.aadharFile = uploadedFiles.aadharFileId;
    }
    if (uploadedFiles.selfieFileId) {
      updateData.selfieFile = uploadedFiles.selfieFileId;
    }

    // Update verification status if documents are uploaded
    if (Object.keys(uploadedFiles).length > 0) {
      updateData.verificationStatus = 'pending';
      updateData.verificationSubmittedAt = new Date();
    }

    await userService.update(userId, updateData);

    await session.commitTransaction();

    const updatedUser = await User.findById(userId)
      .populate('aadharFile')
      .populate('selfieFile');

    res.status(200).json({
      message: 'User documents updated successfully',
      user: updatedUser,
      uploadedFiles
    });
  } catch (err) {
    await session.abortTransaction();

    console.error('Update user documents error:', err);

    if (err.message === 'User not found') {
      return res.status(404).json({ message: err.message });
    }

    res.status(500).json({ message: 'Failed to update user documents' });
  } finally {
    session.endSession();
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
