// services/configurationService.js

const Configuration = require('../models/Configuration');

// Function to get a configuration value by key
async function getConfig(key) {
  const config = await Configuration.findOne({ key });
  if (!config) {
    throw new Error(`Configuration for key "${key}" not found.`);
  }
  return config.value;
}

// Function to set a configuration value by key
async function setConfig(key, value, description = '') {
  let config = await Configuration.findOne({ key });
  if (!config) {
    config = new Configuration({ key, value, description });
  } else {
    config.value = value;
    config.description = description;
  }
  await config.save();
  return config;
}

// Function to get all configuration values
async function getAllConfigs() {
  return Configuration.find({});
}

module.exports = {
  getConfig,
  setConfig,
  getAllConfigs,
};
