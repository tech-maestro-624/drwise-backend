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

async function debitWallet(user, amount, description = 'Debit', transactionId) {
  const wallet = await getWalletByUserId(user);
  
  if (wallet.balance < amount) {
    throw new Error('Insufficient balance');
  }

  wallet.balance -= amount;
  // wallet.transactions.push({ type: 'debit', amount, description, transactionId });
  
  const pending = wallet.transactions.find(transaction => transaction.status === 'pending')
  if(pending){
    pending.status = 'approved'
  }
  await wallet.save();
  return wallet;
}

async function getWalletTransactions(userId) {
  const wallet = await getWalletByUserId(userId);
  return wallet.transactions;
}

async function withdrawalRequest(userId,amount){
  const wallet = await getWalletByUserId(userId)
  const newTransaction = {type : 'debit',status : 'pending',amount : amount,description : "Withdrawal Request from the user"}
  wallet.transactions.push(newTransaction)
  await wallet.save();
  return wallet
}

async function withdrawalRequests(){
  const wallets = await Wallet.find({
    transactions: { $elemMatch: { status: 'pending' } }
  }).populate('user','name phoneNumber withdrawalDetails withdrawalMethod wallet  ');
  const results = wallets.map(wallet => {
    const pendingTransaction = wallet.transactions.find(transaction => transaction.status === 'pending');
    return {
      user: wallet.user, 
      balance: wallet.balance,
      pendingTransaction: pendingTransaction
    };
  });
  return results
}

async function withdrawalRequestByUser(id){
  const transaction= await Wallet.findOne({user : id,
    transactions: { $elemMatch: { status: 'pending' } }
  }).populate('user','name phoneNumber withdrawalDetails withdrawalMethod wallet  ');
  return transaction
}
async function update(id,data){
  const wallet = await Wallet.findByIdAndUpdate(id,data,{new : true})
  return wallet;
}

module.exports = {
  getWalletByUserId,
  creditWallet,
  debitWallet,
  getWalletTransactions,
  withdrawalRequest,
  withdrawalRequests,
  update,
  withdrawalRequestByUser
};
