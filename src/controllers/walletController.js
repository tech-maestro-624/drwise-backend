// controllers/walletController.js

const walletService = require('../services/walletService');

exports.getWallet = async (req, res) => {
  try {
    const wallet = await walletService.getWalletByUserId(req.user._id);
    res.status(200).json(wallet);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve wallet' });
  }
};

exports.creditWallet = async (req, res) => {
  const { user,amount, description } = req.body;

  try {
    const wallet = await walletService.creditWallet(user, amount, description);
    res.status(200).json({ message: 'Wallet credited successfully', wallet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to credit wallet' });
  }
};

exports.debitWallet = async (req, res) => {
  const { user,amount, description } = req.body;

  try {
    const wallet = await walletService.debitWallet(user, amount, description);
    res.status(200).json({ message: 'Wallet debited successfully', wallet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getWalletTransactions = async (req, res) => {
  try {
    const transactions = await walletService.getWalletTransactions(req.user._id);
    res.status(200).json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to retrieve transactions' });
  }
};
