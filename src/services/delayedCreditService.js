const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const walletService = require('./walletService');

/**
 * Calculate the next credit date based on the current month
 * For ALL current month transactions, credit should happen on the 7th of the next month
 */
function calculateScheduledCreditDate(currentDate = new Date()) {
  const currentMonth = currentDate.getMonth(); // 0-based (0 = January, 11 = December)
  const currentYear = currentDate.getFullYear();

  // Calculate next month and handle year rollover
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1; // December (11) -> January (0)
  const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

  // Always schedule for 7th of next month
  return new Date(nextYear, nextMonth, 7);
}

/**
 * Create a delayed credit transaction
 * This creates a transaction with isCredit=false and scheduledCreditDate set
 */
async function createDelayedCredit(userId, amount, description, transactionType = 'REFERRAL_BONUS') {
  const wallet = await walletService.getWalletByUserId(userId);
  const scheduledDate = calculateScheduledCreditDate();

  // Create transaction with isCredit=false initially
  const transaction = new Transaction({
    wallet: wallet._id,
    userId,
    type: transactionType,
    amount: Number(amount),
    description,
    status: 'pending',
    isCredit: false,
    scheduledCreditDate: scheduledDate,
  });

  await transaction.save();

  // Add to wallet transactions
  if (!Array.isArray(wallet.transactions)) {
    wallet.transactions = [];
  }
  wallet.transactions.push(transaction._id);
  await wallet.save();

  console.log(`Delayed credit created for user ${userId}: ${amount} coins, scheduled for ${scheduledDate}`);
  return transaction;
}

/**
 * Process delayed credits that are due
 * This function should be called by the cron job
 */
async function processDelayedCredits() {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    console.log(`Processing delayed credits for date: ${today}`);

    // Find all transactions that are scheduled for today or earlier and not yet credited
    const dueTransactions = await Transaction.find({
      isCredit: false,
      scheduledCreditDate: { $lte: today },
      status: 'pending'
    }).populate('wallet').populate('userId', 'name phoneNumber');

    console.log(`Found ${dueTransactions.length} delayed transactions to process`);

    for (const transaction of dueTransactions) {
      try {
        // Update the wallet balance
        const wallet = await Wallet.findById(transaction.wallet);
        if (!wallet) {
          console.error(`Wallet not found for transaction ${transaction._id}`);
          continue;
        }

        // Add the amount to wallet balance
        wallet.balance += Number(transaction.amount);

        // Update transaction to mark as credited
        transaction.isCredit = true;
        transaction.status = 'approved';
        transaction.date = new Date();

        await transaction.save();
        await wallet.save();

        console.log(`Processed delayed credit: ${transaction.amount} coins added to wallet for user ${transaction.userId.name || transaction.userId._id}`);

      } catch (error) {
        console.error(`Error processing delayed credit ${transaction._id}:`, error);
      }
    }

    return { processed: dueTransactions.length };

  } catch (error) {
    console.error('Error in processDelayedCredits:', error);
    throw error;
  }
}

/**
 * Get all pending delayed credits for a user
 */
async function getPendingDelayedCredits(userId) {
  const transactions = await Transaction.find({
    userId,
    isCredit: false,
    status: 'pending',
    scheduledCreditDate: { $ne: null }
  }).sort({ scheduledCreditDate: 1 }); // Sort by earliest first

  return transactions;
}

/**
 * Get all processed delayed credits for a user
 */
async function getProcessedDelayedCredits(userId) {
  const transactions = await Transaction.find({
    userId,
    isCredit: true,
    scheduledCreditDate: { $ne: null }
  }).sort({ scheduledCreditDate: -1 }); // Sort by most recent first

  return transactions;
}

module.exports = {
  createDelayedCredit,
  processDelayedCredits,
  getPendingDelayedCredits,
  getProcessedDelayedCredits,
  calculateScheduledCreditDate,
};
