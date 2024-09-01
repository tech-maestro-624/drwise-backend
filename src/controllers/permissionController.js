// controllers/permissionController.js

const permissionService = require('../services/permissionService');

exports.createPermission = async (req, res) => {
  const { name } = req.body;

  try {
    const permission = await permissionService.createPermission(name);
    res.status(201).json({ message: 'Permission created successfully', permission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create permission' });
  }
};

exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await permissionService.getAllPermissions();
    res.status(200).json(permissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve permissions' });
  }
};

exports.getPermissionById = async (req, res) => {
  const { permissionId } = req.params;

  try {
    const permission = await permissionService.getPermissionById(permissionId);
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    res.status(200).json(permission);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve permission' });
  }
};

exports.updatePermission = async (req, res) => {
  const { permissionId } = req.params;
  const { name } = req.body;

  try {
    const permission = await permissionService.updatePermission(permissionId, name);
    res.status(200).json({ message: 'Permission updated successfully', permission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update permission' });
  }
};

exports.deletePermission = async (req, res) => {
  const { permissionId } = req.params;

  try {
    const permission = await permissionService.deletePermission(permissionId);
    res.status(200).json({ message: 'Permission deleted successfully', permission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete permission' });
  }
};
