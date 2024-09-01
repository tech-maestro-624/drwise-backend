// services/permissionService.js

const Permission = require('../models/Permission');

async function createPermission(name) {
  const permission = new Permission({ name });
  await permission.save();
  return permission;
}

async function getAllPermissions() {
  return Permission.find({});
}

async function getPermissionById(permissionId) {
  return Permission.findById(permissionId);
}

async function updatePermission(permissionId, name) {
  const permission = await Permission.findByIdAndUpdate(permissionId, { name }, { new: true });
  if (!permission) {
    throw new Error('Permission not found');
  }
  return permission;
}

async function deletePermission(permissionId) {
  const permission = await Permission.findByIdAndDelete(permissionId);
  if (!permission) {
    throw new Error('Permission not found');
  }
  return permission;
}

module.exports = {
  createPermission,
  getAllPermissions,
  getPermissionById,
  updatePermission,
  deletePermission,
};
