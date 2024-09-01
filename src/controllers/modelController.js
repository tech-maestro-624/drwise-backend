const UserService = require('../services/userService');
const { ensurePermissions } = require('../utils/loadModels');

const getAllModels = async (req, res) => {
  try {
    const modelsAndPermissions = await UserService.getUserModelsAndPermissions(req.user._id);
    const permissions = await ensurePermissions()
    res.status(200).json({modelsAndPermissions,permissions});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllModels,
};
