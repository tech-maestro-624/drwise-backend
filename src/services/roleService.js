// services/roleService.js

const Role = require('../models/Role');

async function createRole(name, permissions) {
  const role = new Role({ name, permissions });
  await role.save();
  return role;
}

async function getAllRoles() {
  return Role.find({}).populate('permissions');
}

async function getRoleById(roleId) {
  return Role.findById(roleId).populate('permissions');
}

async function updateRole(roleId, name, permissions) {
  const role = await Role.findByIdAndUpdate(roleId, { name, permissions }, { new: true }).populate('permissions');
  if (!role) {
    throw new Error('Role not found');
  }
  return role;
}

async function deleteRole(roleId) {
  const role = await Role.findByIdAndDelete(roleId);
  if (!role) {
    throw new Error('Role not found');
  }
  return role;
}

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
};
