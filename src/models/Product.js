// models/Product.js

const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  benefits : [],
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  subCategoryId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : 'SubCategory',
    required : false
  }
},{timestamps : true});

module.exports = mongoose.model('Product', ProductSchema);
