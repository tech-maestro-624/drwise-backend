// utils/idGenerator.js

/**
 * Generates a unique lead ID in format: LEAD-YYYYMMDD-XXXXX
 * Where XXXXX is a random 5-digit number
 */
const generateLeadId = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const randomNum = Math.floor(Math.random() * 90000) + 10000; // 5-digit random number
  
  return `LEAD-${year}${month}${day}-${randomNum}`;
};

/**
 * Generates a unique transaction ID in format: TXN-YYYYMMDD-XXXXX
 * Where XXXXX is a random 5-digit number
 */
const generateTransactionId = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const randomNum = Math.floor(Math.random() * 90000) + 10000; // 5-digit random number
  
  return `TXN-${year}${month}${day}-${randomNum}`;
};

/**
 * Checks if a lead ID already exists in the database
 */
const isLeadIdUnique = async (leadId) => {
  const Lead = require('../models/Lead');
  const existingLead = await Lead.findOne({ leadId });
  return !existingLead;
};

/**
 * Checks if a transaction ID already exists in the database
 */
const isTransactionIdUnique = async (transactionId) => {
  const Sale = require('../models/Sale');
  const existingSale = await Sale.findOne({ transactionId });
  return !existingSale;
};

/**
 * Generates a unique lead ID by checking database for uniqueness
 */
const generateUniqueLeadId = async () => {
  let leadId;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    leadId = generateLeadId();
    isUnique = await isLeadIdUnique(leadId);
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique lead ID after maximum attempts');
  }

  return leadId;
};

/**
 * Generates a unique transaction ID by checking database for uniqueness
 */
const generateUniqueTransactionId = async () => {
  let transactionId;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    transactionId = generateTransactionId();
    isUnique = await isTransactionIdUnique(transactionId);
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique transaction ID after maximum attempts');
  }

  return transactionId;
};

module.exports = {
  generateLeadId,
  generateTransactionId,
  generateUniqueLeadId,
  generateUniqueTransactionId,
  isLeadIdUnique,
  isTransactionIdUnique
};
