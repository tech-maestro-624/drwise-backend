// utils/generatePermissions.js

const fs = require('fs');
const path = require('path');
const Permission = require('../models/Permission');

async function generateCRUDPermissions() {
  const modelsDir = path.resolve(__dirname, '../models');
  const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.js'));

  for (const file of modelFiles) {
    const modelName = path.basename(file, '.js').toUpperCase();
    const permissions = [
      `CREATE_${modelName}`,
      `READ_${modelName}`,
      `UPDATE_${modelName}`,
      `DELETE_${modelName}`,
    ];

    for (const permissionName of permissions) {
      const existingPermission = await Permission.findOne({ name: permissionName });
      if (!existingPermission) {
        await Permission.create({ name: permissionName });
        console.log(`Created permission: ${permissionName}`);
      }
    }
  }
}

module.exports = generateCRUDPermissions;
