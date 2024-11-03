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
  const { user,amount, description, transactionId } = req.body;

  try {
    const wallet = await walletService.debitWallet(user, amount, description, transactionId);
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

exports.withdrawRequest = async(req,res) => {
  try {
    const data = await walletService.withdrawalRequest(req.user._id,req.body.amount);
    res.status(200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}

exports.withdrawalRequests = async(req,res)=> {
  try {
    const data = await walletService.withdrawalRequests();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}

exports.update = async(req,res)=>{
  try {
    const data = await walletService.update(req.params.id,req.body);
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}

exports.withdrawalRequestByUser = async(req,res) => {
  console.log("req.params.id",req.params.id);
  
  try {
    const data = await walletService.withdrawalRequestByUser(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}