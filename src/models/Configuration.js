// models/Configuration.js

const mongoose = require('mongoose');

const ConfigurationSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // This allows the value to be of any type (string, number, object, etc.)
    required: true,
  },
  description: {
    type: String,
    default: '',
  }
},{timestamps : true});

module.exports = mongoose.model('Configuration', ConfigurationSchema);
