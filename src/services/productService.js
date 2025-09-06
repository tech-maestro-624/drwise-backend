// services/productService.js

const Product = require('../models/Product');
const Fuse = require('fuse.js');
const cacheService = require('./cacheService');

async function createProduct(data) {
  const product = new Product(data);
  await product.save();

  // Invalidate cache for products list
  await cacheService.deleteByPattern('products:all:*');
  await cacheService.deleteByPattern('products:category:*');
  await cacheService.deleteByPattern('products:subcategory:*');

  return product;
}

async function getAllProducts() {
  const cacheKey = 'products:all';

  return await cacheService.getOrSet(
    cacheKey,
    async () => {
      return await Product.find({}).populate('categoryId subCategoryId');
    },
    1800 // 30 minutes TTL
  );
}

async function getProductsBySubCategory(id) {
  const cacheKey = `products:subcategory:${id}`;

  return await cacheService.getOrSet(
    cacheKey,
    async () => {
      return await Product.find({subCategoryId : id}).populate('categoryId subCategoryId');
    },
    1800 // 30 minutes TTL
  );
}

async function getProductById(productId) {
  const cacheKey = `products:id:${productId}`;

  return await cacheService.getOrSet(
    cacheKey,
    async () => {
      return await Product.findById(productId).populate('categoryId subCategoryId');
    },
    1800 // 30 minutes TTL
  );
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

  // Invalidate cache for this product and related lists
  await cacheService.delete(`products:id:${productId}`);
  await cacheService.deleteByPattern('products:all:*');
  await cacheService.deleteByPattern('products:category:*');
  await cacheService.deleteByPattern('products:subcategory:*');

  return product;
}

async function deleteProduct(productId) {
  const product = await Product.findByIdAndDelete(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  // Invalidate cache for this product and related lists
  await cacheService.delete(`products:id:${productId}`);
  await cacheService.deleteByPattern('products:all:*');
  await cacheService.deleteByPattern('products:category:*');
  await cacheService.deleteByPattern('products:subcategory:*');

  return product;
}

async function getProductsByCategoryId(categoryId) {
  const cacheKey = `products:category:${categoryId}`;

  return await cacheService.getOrSet(
    cacheKey,
    async () => {
      return await Product.find({ categoryId }).populate('categoryId subCategoryId');
    },
    1800 // 30 minutes TTL
  );
}

async function searchProductsFuzzy(query, limit = 10, threshold = 0.4) {
  try {
    const cacheKey = `products:search:${query}:${limit}:${threshold}`;

    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        // Get all products with populated category and subcategory data
        const products = await Product.find({})
          .populate('categoryId', 'name')
          .populate('subCategoryId', 'name')
          .lean();

        if (!products || products.length === 0) {
          return [];
        }

        // Configure Fuse.js options for fuzzy search
        const fuseOptions = {
          keys: [
            { name: 'name', weight: 0.5 },
            { name: 'description', weight: 0.3 },
            { name: 'benefits', weight: 0.2 }
          ],
          threshold: threshold, // Lower threshold = stricter matching (0.0 = exact match, 1.0 = match anything)
          includeScore: true,
          includeMatches: true,
          shouldSort: true,
          minMatchCharLength: 2,
          ignoreLocation: true,
          useExtendedSearch: true
        };

        // Create Fuse instance
        const fuse = new Fuse(products, fuseOptions);

        // Perform fuzzy search
        const searchResults = fuse.search(query);

        // Limit results and format response
        const limitedResults = searchResults.slice(0, limit).map(result => ({
          ...result.item,
          _id: result.item._id,
          score: result.score,
          matches: result.matches
        }));

        return limitedResults;
      },
      900 // 15 minutes TTL for search results
    );
  } catch (error) {
    console.error('Error in fuzzy search:', error);
    throw new Error('Failed to perform fuzzy search');
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategoryId,
  getProductsBySubCategory,
  searchProductsFuzzy
};
