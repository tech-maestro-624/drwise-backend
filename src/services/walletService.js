// services/walletService.js

const Wallet = require('../models/Wallet');

async function getWalletByUserId(userId) {
  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    throw new Error('Wallet not found');
  }
  return wallet;
}

async function creditWallet(userId, amount, description = 'Credit') {
  const wallet = await getWalletByUserId(userId);
  wallet.balance += amount;
  wallet.transactions.push({ type: 'credit', amount, description });
  await wallet.save();
  return wallet;
}

async function debitWallet(userId, amount, description = 'Debit') {
  const wallet = await getWalletByUserId(userId);

  if (wallet.balance < amount) {
    throw new Error('Insufficient balance');
  }

  wallet.balance -= amount;
  wallet.transactions.push({ type: 'debit', amount, description });
  await wallet.save();
  return wallet;
}

async function getWalletTransactions(userId) {
  const wallet = await getWalletByUserId(userId);
  return wallet.transactions;
}

module.exports = {
  getWalletByUserId,
  creditWallet,
  debitWallet,
  getWalletTransactions,
};
