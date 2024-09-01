const fs = require('fs');
const path = require('path');
const Permission = require('../models/Permission');

const loadModels = () => {
  const models = {};
  const modelsPath = path.join(__dirname, '../models');
  
  fs.readdirSync(modelsPath).forEach(file => {
    if (file.endsWith('.js')) {
      const modelName = path.basename(file, '.js');
      models[modelName] = require(path.join(modelsPath, file));
    }
  });

  return models;
};

const ensurePermissions = async () => {
  const models = loadModels();
  const actions = ['CREATE', 'READ', 'UPDATE', 'DELETE'];
  const modelPermissions = {};

  for (const modelName of Object.keys(models)) {
    modelPermissions[modelName] = [];
    for (const action of actions) {
      const permissionName = `${action}_${modelName.toUpperCase()}`;
      
      // Check if the permission already exists
      let existingPermission = await Permission.findOne({ name: permissionName });
      
      if (!existingPermission) {
        // Create the permission if it doesn't exist
        existingPermission = new Permission({
          name: permissionName,
          description: `${action} permission for ${modelName}`
        });
        
        await existingPermission.save();
        console.log(`Created permission: ${permissionName}`);
      }

      modelPermissions[modelName].push(existingPermission);
    }
  }

  return modelPermissions;
};

module.exports = { loadModels, ensurePermissions };
