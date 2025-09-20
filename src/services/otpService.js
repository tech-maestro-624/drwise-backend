// services/otpService.js

const crypto = require('crypto');
const User = require('../models/User');

/**
 * Generate and save OTP for a user
 * @param {string} phoneNumber - User's phone number
 * @returns {Promise<string>} - Generated OTP
 */
async function generateAndSaveOtp(phoneNumber) {
  try {
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      throw new Error('User does not exist. Please register first.');
    }

    if (!user.active) {
      throw new Error('Your account is deactivated. Contact Admin');
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    return otp;
  } catch (error) {
    throw new Error(`Failed to generate OTP: ${error.message}`);
  }
}

/**
 * Verify OTP for a user
 * @param {string} phoneNumber - User's phone number
 * @param {string} otp - OTP to verify
 * @returns {Promise<boolean>} - True if OTP is valid
 */
async function verifyOtp(phoneNumber, otp) {
  try {
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      return false;
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
}

/**
 * Clear OTP for a user (after successful verification)
 * @param {string} phoneNumber - User's phone number
 */
async function clearOtp(phoneNumber) {
  try {
    await User.findOneAndUpdate(
      { phoneNumber },
      { $unset: { otp: 1, otpExpires: 1 } }
    );
  } catch (error) {
    console.error('Error clearing OTP:', error);
  }
}

module.exports = {
  generateAndSaveOtp,
  verifyOtp,
  clearOtp
};
