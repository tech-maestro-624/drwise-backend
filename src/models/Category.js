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
    unique: true
  },
  image: {
    type: String
  }
},{timestamps : true});

module.exports = mongoose.model('Category', CategorySchema);
