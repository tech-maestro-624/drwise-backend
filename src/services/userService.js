const User = require('../models/User');
const {loadModels} = require('../utils/loadModels');
const Configuration = require('../models/Configuration')
const Role = require('../models/Role')
const Lead = require('../models/Lead');
const { sendOtp } = require('../controllers/authController');
const sendPushNotification = require("../utils/pushNotification");
const Wallet = require('../models/Wallet')
const cacheService = require('./cacheService');

exports.get = async(query={}) => {
    try {
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;
        if (query.condition && typeof(query.condition) !== 'object') {
            try {
                query = JSON.parse(query.condition);
            } catch (error) {
                throw new Error("Invalid condition format");
            }
        }
        const data = await User.find(query.condition)
                                .skip(skip)
                                .limit(limit)
                                .sort({createdAt : -1})
                                .populate('wallet')
                                .populate('referredBy')
                                
        const total = await User.countDocuments(query.condition);
        return {
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data
        };
    } catch (error) {
        throw error;
    }
}

exports.getUserModelsAndPermissions = async (userId) => {
    const cacheKey = `user:permissions:${userId}`;

    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        const user = await User.findById(userId).populate('roles').populate('permissions');

        const rolePermissions = [];
        for (const role of user.roles) {
          const populatedRole = await role.populate('permissions');
          rolePermissions.push(...populatedRole.permissions.map((perm) => perm.name));
        }

        const userPermissions = user.permissions.map((perm) => perm.name);

        const allPermissions = [...new Set([...rolePermissions, ...userPermissions])];

        const models = loadModels();
        const modelNames = Object.keys(models);

        const modelsWithPermissions = modelNames.map((model) => {
          const actions = ['CREATE', 'READ', 'UPDATE', 'DELETE'];
          const modelPermissions = {};

          actions.forEach((action) => {
            const permissionString = `${action}_${model}`;
            modelPermissions[action] = allPermissions.includes(permissionString);
          });

          return {
            model,
            permissions: modelPermissions,
          };
        });

        return modelsWithPermissions;
      },
      3600 // 1 hour TTL for permissions
    );
  };


  /**
 * Registers a new user with the specified role, creates a corresponding client and lead.
 * @param {string} roleName - The name of the role to assign to the user.
 * @param {Object} data - The data to create the user with.
 * @returns {Promise<void>}
 */
exports.register = async (roleName = 'DEFAULT_USER', data) => {
  try {
    // Fetch role configuration
    const roleConfig = await Configuration.findOne({ name: roleName });
    if (!roleConfig) {
      throw new Error(`Role configuration for ${roleName} not found.`);
    }

    // Fetch the role by ID
    const role = await Role.findById(roleConfig.value);
    if (!role) {
      throw new Error(`Role ${roleConfig.value} not found.`);
    }

    // Create new user with assigned role
    const user = new User({
      ...data,
      roles: [role._id]
    });

    await user.save();

    // Generate and log OTP
    const otp = await sendOtp(user.phoneNumber);
  } catch (error) {
    throw new Error(`Error during registration: ${error.message}`);
  }
};


exports.clientLoginOrRegister = async (data) => {
  try {
    let user = await User.findOne({phoneNumber : data.phoneNumber});
    
    if (user) {

      // Generate and log OTP
      const otp = await sendOtp(data.phoneNumber);
      console.log(otp);
      return true;
    } else {
      // Register the user with the client role
      await this.register('DEFAULT_USER',data);
      return false;
    }
  } catch (error) {
    throw error;
  }
};

exports.updatePushNotifyToken = async(id,token) => {
  try {
    const user = await User.findByIdAndUpdate(id,{pushNotificationToken : token})
    return user;
  } catch (error) {
    throw error;
  }
}

exports.sendNotification = async (data) => {
  try {
    // Find the configuration for the client role
    const roleConfig = await Configuration.findOne({ name: 'CLIENT_ROLE_ID' });

    if (!roleConfig) {
      throw new Error('Client role configuration not found.');
    }

    const clientRoleId = roleConfig.value;

    // Find all users who have the specified role in their roles array and a pushNotificationToken
    const users = await User.find({
      roles: clientRoleId,
      pushNotificationToken: { $exists: true, $ne: null }
    });

    // Loop through each user and send a push notification
    for (const user of users) {
      await sendPushNotification(user.pushNotificationToken,data.title,data.body);
    }
    return
  } catch (error) {
    console.error('Error sending notifications:', error.message);
  }
};

exports.update = async(id,data) => {
  try {
    const user= await User.findByIdAndUpdate(id,data,{new : true})

    // Invalidate user permissions cache
    await cacheService.delete(`user:permissions:${id}`);

    return user
  } catch (error) {
    console.log(error);
    throw error
  }
}

exports.create = async(data) => {
  try {
    const user = new User(data)
    return await user.save()
  } catch (error) {
    throw error;
  }
}

exports.delete = async (id) => {
  try {
    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    // Check if the user has an associated wallet and delete it
    if (user.wallet) {
      await Wallet.findByIdAndDelete(user.wallet);
    }

    // Delete the user
    const deletedUser = await User.findByIdAndDelete(id);

    // Invalidate user permissions cache
    await cacheService.delete(`user:permissions:${id}`);

    return deletedUser;
  } catch (error) {
    throw error;
  }
};

exports.updateBankingDetails = async (userId, bankingData) => {
  try {
    // Validate banking data
    const requiredFields = ['accountNumber', 'ifscCode', 'bankName', 'accountHolderName', 'branchName'];
    const missingFields = requiredFields.filter(field => !bankingData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required banking fields: ${missingFields.join(', ')}`);
    }

    // Validate IFSC code format (Indian standard)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(bankingData.ifscCode)) {
      throw new Error('Invalid IFSC code format');
    }

    // Validate account number format
    const accountRegex = /^\d{9,18}$/;
    if (!accountRegex.test(bankingData.accountNumber)) {
      throw new Error('Invalid account number format');
    }

    // Validate account type if provided
    const validAccountTypes = ['savings', 'current', 'business'];
    if (bankingData.accountType && !validAccountTypes.includes(bankingData.accountType)) {
      throw new Error('Invalid account type. Must be one of: savings, current, business');
    }

    // Prepare banking data with defaults
    const bankingUpdate = {
      accountNumber: bankingData.accountNumber,
      ifscCode: bankingData.ifscCode,
      bankName: bankingData.bankName,
      accountHolderName: bankingData.accountHolderName,
      branchName: bankingData.branchName,
      accountType: bankingData.accountType || 'savings', // Default to savings
      upiId: bankingData.upiId || null,
      verified: false // Reset verification status when banking details are updated
    };

    const updateData = {
      banking: bankingUpdate
    };

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    throw error;
  }
};

exports.verifyBankingDetails = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.banking || !user.banking.accountNumber) {
      throw new Error('Banking details not found');
    }

    // Here you would typically integrate with bank verification APIs
    // For now, we'll just mark as verified
    const updateData = {
      'banking.verified': true
    };

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    return updatedUser;
  } catch (error) {
    throw error;
  }
};

exports.getBankingDetails = async (userId) => {
  try {
    const user = await User.findById(userId).select('banking');

    if (!user) {
      throw new Error('User not found');
    }

    return user.banking || {};
  } catch (error) {
    throw error;
  }
};
