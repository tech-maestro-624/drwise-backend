// controllers/roleController.js

const roleService = require('../services/roleService');

exports.createRole = async (req, res) => {
  const { name, permissions } = req.body;

  try {
    const role = await roleService.createRole(name, permissions);
    res.status(201).json({ message: 'Role created successfully', role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create role' });
  }
};

exports.getAllRoles = async (req, res) => {
  try {
    const roles = await roleService.getAllRoles();
    res.status(200).json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve roles' });
  }
};

exports.getRoleById = async (req, res) => {
  const { roleId } = req.params;

  try {
    const role = await roleService.getRoleById(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    res.status(200).json(role);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve role' });
  }
};

exports.updateRole = async (req, res) => {
  const { roleId } = req.params;
  const { name, permissions } = req.body;

  try {
    const role = await roleService.updateRole(roleId, name, permissions);
    res.status(200).json({ message: 'Role updated successfully', role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update role' });
  }
};

exports.deleteRole = async (req, res) => {
  const { roleId } = req.params;

  try {
    const role = await roleService.deleteRole(roleId);
    res.status(200).json({ message: 'Role deleted successfully', role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete role' });
  }
};
