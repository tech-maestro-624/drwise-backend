// models/Category.js

const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  orderNo: {
    type: Number,
    required: true,
    default: 0,
    index: true
  },
  image: {
    type: String
  }
},{timestamps : true});

// Ensure orderNo is unique
CategorySchema.index({ orderNo: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema);
