const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

/**
 * Helper to get the Wallet by userId.
 */
async function getWalletByUserId(userId) {
  if (!userId) {
    throw new Error('No userId provided to getWalletByUserId');
  }
  
  let wallet = await Wallet.findOne({ user: userId }).populate({
    path: 'transactions',
    populate: {
      path: 'userId',
      model: 'User',
      select: 'name phoneNumber',
    },
  });

  // Auto-create wallet if none found
  if (!wallet) {
    wallet = new Wallet({
      user: userId,
      balance: 0,   // default balance
      refBonus: 0,  // default referral bonus, if you use it
      transactions: []
    });
    await wallet.save();
  }

  return wallet;
}

/**
 * CREDIT wallet
 */
async function creditWallet(userId, amount, description = 'Credit') {
  if (!userId) {
    throw new Error('No userId provided to creditWallet');
  }

  // 1) Always returns a valid wallet (auto-created if not found)
  const wallet = await getWalletByUserId(userId);


  // 2) Increase balance
  wallet.balance += Number(amount);

  // 3) Create a new Transaction
  const transaction = new Transaction({
    wallet: wallet._id,
    userId,
    type: 'credit',
    amount: Number(amount),
    description,
    status: 'approved',
    isCredit: true, // Set to true for immediate credits
  });
  await transaction.save();

  // 4) Ensure `wallet.transactions` is an array before pushing
  if (!Array.isArray(wallet.transactions)) {
    wallet.transactions = [];
  }
  wallet.transactions.push(transaction._id);

  // 5) Save the updated wallet
  await wallet.save();

  return wallet;
}




/**
 * DEBIT wallet
 */
async function debitWallet(userId, amount, description = 'Debit', transactionId) {
  const wallet = await getWalletByUserId(userId);

  if (wallet.balance < amount) {
    throw new Error('Insufficient balance');
  }

  // Check if there's a pending transaction
  let pendingTransaction = await Transaction.findOne({
    wallet: wallet._id,
    userId,
    status: 'pending',
  });

  if (pendingTransaction) {
    // Approve the existing pending transaction
    pendingTransaction.status = 'approved';
    pendingTransaction.transactionId = transactionId || pendingTransaction.transactionId;
    pendingTransaction.date = new Date();
    pendingTransaction.amount = Number(amount);
    pendingTransaction.description = description;
    await pendingTransaction.save();

    // Subtract from wallet
    wallet.balance -= Number(amount);

    // REMOVE this push; it's most likely already in wallet.transactions.
    // if (!wallet.transactions.includes(pendingTransaction._id)) {
    //   wallet.transactions.push(pendingTransaction._id);
    // }
  } else {
    // Create a new approved transaction
    const newTransaction = new Transaction({
      wallet: wallet._id,
      userId,
      type: 'debit',
      amount: Number(amount),
      description,
      status: 'approved',
      transactionId,
    });
    pendingTransaction = await newTransaction.save();

    wallet.balance -= Number(amount);

    wallet.transactions.push(pendingTransaction._id);
  }

  await wallet.save();
  return wallet;
}


/**
 * Retrieve all wallet transactions for the current user.
 */
async function getWalletTransactions(userId) {
  const transactions = await Transaction.find({
    userId,
    $or: [
      { isCredit: { $ne: false } },
      { scheduledCreditDate: { $exists: false } },
      { scheduledCreditDate: null }
    ]
  }).sort({ createdAt: -1 }); // Sort by newest first

  return transactions;
}

/**
 * Request a withdrawal
 */
async function withdrawalRequest(userId, amount) {
  const wallet = await getWalletByUserId(userId);

  // Create a 'pending' transaction
  const transaction = new Transaction({
    wallet: wallet._id,
    userId,
    type: 'debit',
    amount: Number(amount),
    description: 'Withdrawal Request from the user',
    status: 'pending',
  });
  await transaction.save();

  wallet.transactions.push(transaction._id);
  await wallet.save();

  return wallet;
}

async function withdrawalRequests() {
  const pendingTransactions = await Transaction.find({
    type: 'debit',
    status: 'pending',
  })
    .populate('userId', 'name phoneNumber withdrawalDetails withdrawalMethod wallet')
    .populate('wallet');

  const results = pendingTransactions.map((tx) => ({
    user: tx.userId,
    balance: tx.wallet ? tx.wallet.balance : null,
    pendingTransaction: tx,
  }));

  return results;
}

/**
 * Update the Wallet document directly
 */
async function update(walletId, data) {
  const wallet = await Wallet.findByIdAndUpdate(walletId, data, { new: true });
  return wallet;
}

/**
 * Get all "pending" withdrawal requests for a specific user
 */
async function withdrawalRequestByUser(userId) {
  const pendingTransactions = await Transaction.find({
    userId,
    type: 'debit',
    status: 'pending',
  })
    .populate('userId', 'name phoneNumber withdrawalDetails withdrawalMethod wallet')
    .populate('wallet');

  return pendingTransactions;
}

/**
 * Retrieve all unreleased transactions for the current user.
 */
async function getUnreleasedTransactions(userId) {
  const transactions = await Transaction.find({
    userId,
    isCredit: false,
    scheduledCreditDate: { $exists: true, $ne: null },
  }).sort({ scheduledCreditDate: 1 }); // Sort by soonest release date first

  return transactions;
}

module.exports = {
  getWalletByUserId,
  creditWallet,
  debitWallet,
  getWalletTransactions,
  getUnreleasedTransactions,
  withdrawalRequest,
  withdrawalRequests,
  update,
  withdrawalRequestByUser,
};
