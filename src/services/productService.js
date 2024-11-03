// services/productService.js

const Product = require('../models/Product');

async function createProduct(name, description, categoryId, price) {
  const product = new Product({ name, description, categoryId, price });
  await product.save();
  return product;
}

async function getAllProducts() {
  return Product.find({}).populate('categoryId');
}

async function getProductById(productId) {
  return Product.findById(productId).populate('categoryId');
}

async function updateProduct(productId, name, description, categoryId) {
  const product = await Product.findByIdAndUpdate(
    productId,
    { name, description,categoryId },
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
  getProductsByCategoryId
};
