// controllers/productController.js

const productService = require('../services/productService');

exports.createProduct = async (req, res) => {
   
  try {
    const product = await productService.createProduct(req.body);
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

exports.getProductsBySubCategory = async(req, res)=>{
  try {
    const products = await productService.getProductsBySubCategory(req.params.id)
    res.status(200).json(products)
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve products' });
  }
}

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
  const { productId } = req.params;

  try {
    const product = await productService.updateProduct(productId, req.body);
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
  const { categoryId } = req.params;

  try {
    const products = await productService.getProductsByCategoryId(categoryId);
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve products' });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { q: query, limit = 10, threshold = 0.4 } = req.query;

    // Validate required parameters
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        message: 'Search query parameter "q" is required',
        example: '/api/products/search?q=laptop&limit=5&threshold=0.3'
      });
    }

    // Validate limit parameter
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        message: 'Limit must be a number between 1 and 50'
      });
    }

    // Validate threshold parameter
    const thresholdNum = parseFloat(threshold);
    if (isNaN(thresholdNum) || thresholdNum < 0 || thresholdNum > 1) {
      return res.status(400).json({
        message: 'Threshold must be a number between 0 and 1 (lower = stricter matching)'
      });
    }

    // Perform fuzzy search
    const products = await productService.searchProductsFuzzy(query.trim(), limitNum, thresholdNum);

    res.status(200).json({
      query: query.trim(),
      totalResults: products.length,
      threshold: thresholdNum,
      limit: limitNum,
      results: products
    });

  } catch (error) {
    console.error('Error in product search:', error);
    res.status(500).json({
      message: 'Failed to search products',
      error: error.message
    });
  }
};
