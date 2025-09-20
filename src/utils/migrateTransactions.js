// utils/migrateTransactions.js
// Migration script to add transactionId to existing transactions that don't have one

const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const { generateUniqueTransactionId } = require('./idGenerator');

async function migrateExistingTransactions() {
  try {
    console.log('Starting transaction migration to add transactionId field...');

    // Find all transactions that don't have a transactionId
    const transactionsWithoutId = await Transaction.find({
      $or: [
        { transactionId: { $exists: false } },
        { transactionId: null },
        { transactionId: '' }
      ]
    });

    console.log(`Found ${transactionsWithoutId.length} transactions without transactionId`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const transaction of transactionsWithoutId) {
      try {
        // Generate unique transactionId
        const transactionId = await generateUniqueTransactionId();
        
        // Update the transaction with the new transactionId
        await Transaction.findByIdAndUpdate(transaction._id, { transactionId });
        
        console.log(`Migrated transaction ${transaction._id} with new transactionId: ${transactionId}`);
        migratedCount++;
      } catch (error) {
        console.error(`Failed to migrate transaction ${transaction._id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`Migration completed!`);
    console.log(`Successfully migrated: ${migratedCount} transactions`);
    console.log(`Errors: ${errorCount} transactions`);

    return {
      success: true,
      totalFound: transactionsWithoutId.length,
      migrated: migratedCount,
      errors: errorCount
    };

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Function to run migration from controller endpoint
async function runTransactionMigration() {
  try {
    const result = await migrateExistingTransactions();
    return result;
  } catch (error) {
    throw new Error(`Transaction migration failed: ${error.message}`);
  }
}

module.exports = {
  migrateExistingTransactions,
  runTransactionMigration
};
