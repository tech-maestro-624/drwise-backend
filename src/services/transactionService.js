// services/transactionService.js

const Transaction = require('../models/Transaction');


async function getAllTransactions(query = {}) {
  try {
    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // 2. Parse 'condition' if provided (similar to your getAllLeads example)
    let condition = {};
    if (query.condition) {
      // query.condition could be JSON or an object
      try {
        condition = (typeof query.condition === 'object')
          ? query.condition
          : JSON.parse(query.condition);
      } catch (error) {
        throw new Error('Invalid condition format');
      }
    }

    // 3. Query the DB with skip, limit, and sort by latest
    const transactions = await Transaction.find(condition)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('userId')   // If you want to see user info
      .populate('wallet');  // If you want to see wallet info

    // 4. Count total documents matching the condition
    const total = await Transaction.countDocuments(condition);

    // 5. Return a paginated result
    return {
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      transactions,
    };
  } catch (error) {
    throw error;
  }
}




module.exports = {
  getAllTransactions,
};
