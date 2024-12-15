const User = require('../models/User');
const {loadModels} = require('../utils/loadModels');
const Configuration = require('../models/Configuration')
const Role = require('../models/Role')
const Lead = require('../models/Lead');
const { sendOtp } = require('../controllers/authController');
const sendPushNotification = require("../utils/pushNotification");

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
                                console.log(data);
                                
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
  };


  /**
 * Registers a new user with the specified role, creates a corresponding customer and lead.
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
    console.log(`OTP for user ${user.phoneNumber}: ${otp}`);

  } catch (error) {
    throw new Error(`Error during registration: ${error.message}`);
  }
};


exports.customerLoginOrRegister = async (data) => {
  try {
    let user = await User.findOne({phoneNumber : data.phoneNumber});
    
    if (user) {

      // Generate and log OTP
      const otp = await sendOtp(data.phoneNumber);
      console.log(otp);
      return true;
    } else {
      // Register the user with the customer role
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
    // Find the configuration for the customer role
    const roleConfig = await Configuration.findOne({ name: 'CUSTOMER_ROLE_ID' });

    if (!roleConfig) {
      throw new Error('Customer role configuration not found.');
    }

    const customerRoleId = roleConfig.value;

    // Find all users who have the specified role in their roles array and a pushNotificationToken
    const users = await User.find({
      roles: customerRoleId, 
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
    return user
  } catch (error) {
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