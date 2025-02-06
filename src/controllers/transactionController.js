// controllers/transactionController.js

const transactionService = require('../services/transactionService');


exports.getAllTransactions = async (req, res) => {
  try {
    // We pass `req.query` so we can parse ?page, ?limit, & ?condition
    const data = await transactionService.getAllTransactions(req.query);
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};


