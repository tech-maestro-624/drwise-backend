// controllers/productController.js

const productService = require('../services/productService');

exports.createProduct = async (req, res) => {
  const { name, description, categoryId, price,benefits } = req.body;
   
  try {
    const product = await productService.createProduct(name, description, categoryId, price,benefits);
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create product' });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve products' });
  }
};

exports.getProductById = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await productService.getProductById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve product' });
  }
};

exports.updateProduct = async (req, res) => {
  console.log(req.body);
  
  const { productId } = req.params;
  const { name, description, categoryId,benefits } = req.body;

  try {
    const product = await productService.updateProduct(productId, name, description, categoryId,benefits);
    res.status(200).json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

exports.deleteProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await productService.deleteProduct(productId);
    res.status(200).json({ message: 'Product deleted successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

exports.getProductsByCategoryId = async (req, res) => {
  console.log(req.params);
  
  const { categoryId } = req.params;

  try {
    const products = await productService.getProductsByCategoryId(categoryId);
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve products' });
  }
};
