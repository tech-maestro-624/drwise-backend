// services/referralService.js

const Lead = require('../models/Lead');
const Referral = require('../models/Referral');
const Wallet = require('../models/Wallet');
const Sale = require('../models/Sale');
const { getConfig } = require('./configurationService');

async function convertLead(leadId, productId, price) {
  // Find the lead by ID and update its status to "Converted"
  console.log('leadId', leadId);
  
  const lead = await Lead.findByIdAndUpdate(leadId, { status: 'Converted' }, { new: true });

  if (!lead) {
    throw new Error('Lead not found');
  }

  // Find the referral associated with the lead
  const referral = await Referral.findOne({ _id: leadId });

  if (!referral) {
    throw new Error('Referral not found');
  } 

  // Fetch the conversion rate dynamically from the ConfigurationService
  const conversionRate = await getConfig('conversionRate');

  // Calculate the referral bonus based on the price and conversion rate
  const referralBonus = price * conversionRate;

  // Create a new Sale record
  const sale = new Sale({
    lead: leadId,
    product: productId,
    price,
    referrer: referral.referrer,
    referralBonus,
  });

  await sale.save();

  // Update the referral status and bonus amount
  referral.bonus = referralBonus;
  referral.status = 'Paid';
  await referral.save();

  // Update the referrer's wallet
  const wallet = await Wallet.findOne({ user: referral.referrer });

  if (!wallet) {
    throw new Error('Wallet not found');
  }

  wallet.balance += referralBonus;
  await wallet.save();

  return { lead, referral, sale, wallet };
}

module.exports = {
  convertLead,
};
