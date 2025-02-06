const Lead = require('../models/Lead');
const Wallet = require('../models/Wallet');
const Sale = require('../models/Sale');
const { getConfig } = require('./configurationService');
const User = require('../models/User');
const walletService = require('../services/walletService');

/**
 * Example placeholder for createReferral logic
 */
async function createReferral(referrerId, referredName, referredPhoneNumber) {
  // Implement your logic of storing a new Lead
  const lead = new Lead({
    referrer: referrerId,
    name: referredName,
    phoneNumber: referredPhoneNumber,
    status: 'New',
  });
  await lead.save();

  return { lead };
}

/**
 * Convert lead => mark lead as converted, create a Sale, 
 * credit the referrer with referral bonus, 
 * handle second-degree referral if config is present.
 */
async function convertLead(leadId, productId, price, conversionAmt, refBonus, categoryId) {
  const lead = await Lead.findByIdAndUpdate(leadId, { status: 'Converted' }, { new: true });
  if (!lead) {
    throw new Error('Lead not found');
  }

  // 1) Create a new Sale record
  const sale = new Sale({
    lead: leadId,
    product: productId,
    price,
    referrer: lead.referrer,
    referralBonus: refBonus,
    categoryId: categoryId,
  });
  await sale.save();

  // 2) Ensure the referrer has a Wallet
  let wallet = await Wallet.findOne({ user: lead.referrer });
  if (!wallet) {
    throw new Error('Wallet not found for the referrer');
  }

  // 3) Credit the referral bonus to the referrer
  await walletService.creditWallet(
    lead.referrer,
    Number(refBonus),
    `Referral bonus from sale conversion of value: ${conversionAmt}`
  );

  // 4) Handle second-degree referral
  const firstDegUser = await User.findById(lead.referrer);
  const secondDegUserId = firstDegUser?.referredBy;
  if (secondDegUserId) {
    const secondDegUser = await User.findById(secondDegUserId);
    if (secondDegUser) {
      const secondDegWallet = await Wallet.findOne({ user: secondDegUser._id });
      if (secondDegWallet) {
        // Fetch configuration for second-degree referral
        const secondDegConfig = await getConfig('SECOND_DEGREE_VALUATION');
        if (secondDegConfig) {
          let secondDegBonus;
          if (secondDegConfig.type === 'percentage') {
            secondDegBonus = conversionAmt * (secondDegConfig.value / 100);
          } else if (secondDegConfig.type === 'fixed') {
            secondDegBonus = secondDegConfig.value;
          } else {
            throw new Error('Invalid second-degree bonus configuration');
          }

          // Credit second-degree bonus
          await walletService.creditWallet(
            secondDegUser._id,
            secondDegBonus,
            `Second-degree referral bonus from sale conversion of value: ${conversionAmt}`
          );
        } else {
          throw new Error('Second-degree bonus configuration not found');
        }
      }
    }
  }

  return { lead, sale };
}

module.exports = {
  createReferral,
  convertLead,
};
