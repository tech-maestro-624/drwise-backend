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
  },
  estimatedPrice : {
     type : Number,
    required : false
  },
  uptoPrice : {
    type : Number,
    required : false
  },
  immediateCredit:{
    type : Boolean,
    default : false
  }
},{timestamps : true});

module.exports = mongoose.model('Product', ProductSchema);
