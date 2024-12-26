// services/productService.js

const Product = require('../models/Product');

async function createProduct(data) {
  const product = new Product(data);
  await product.save();
  return product;
}

async function getAllProducts() {
  return Product.find({}).populate('categoryId subCategoryId');
}

async function getProductsBySubCategory(id) {
  return Product.find({subCategoryId : id}).populate('categoryId subCategoryId');
}

async function getProductById(productId) {
  return Product.findById(productId).populate('categoryId subCategoryId');
}

async function updateProduct(productId,data) {
  const product = await Product.findByIdAndUpdate(
    productId,
    data,
    { new: true }
  )

  if (!product) {
    throw new Error('Product not found');
  }

  return product;
}

async function deleteProduct(productId) {
  const product = await Product.findByIdAndDelete(productId);
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
}

async function getProductsByCategoryId(categoryId) {
  return Product.find({ categoryId })
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategoryId,
  getProductsBySubCategory
};
