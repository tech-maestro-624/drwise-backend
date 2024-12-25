// services/referralService.js

const Lead = require('../models/Lead');
const Wallet = require('../models/Wallet');
const Sale = require('../models/Sale');
const { getConfig } = require('./configurationService');
const User = require('../models/User')

async function convertLead(leadId, productId, price, conversionAmt, refBonus, categoryId) {
  const lead = await Lead.findByIdAndUpdate(leadId, { status: 'Converted' }, { new: true });
  if (!lead) {
    throw new Error('Lead not found');
  }

  // Create a new Sale record
  const sale = new Sale({
    lead: leadId,
    product: productId,
    price,
    referrer: lead.referrer,
    referralBonus : refBonus, 
    categoryId:categoryId
  });

  await sale.save();

  // Update the referrer's wallet
  const wallet = await Wallet.findOne({ user: lead.referrer });
  if (!wallet) {
    throw new Error('Wallet not found');
  }

  // Add the referral bonus to the referrer's wallet
  await wallet.addTransaction('credit', Number(refBonus), `Referral bonus from sale conversion of value: ${conversionAmt}`);

  const firstDegUser = await User.findById(lead.referrer)
  console.log("2nd",firstDegUser.referredBy)
  // Handle second-degree referral bonus
  const secondDegUser = await User.findById(firstDegUser.referredBy);
  if (!secondDegUser) {
    throw new Error('Second-degree user not found');
  }

  const secondDegWallet = await Wallet.findOne({ user: secondDegUser._id });

  if (!secondDegWallet) {
    return { lead, sale, wallet, secondDegWallet };
  }

  // Fetch configuration for second-degree referral bonus
  const secondDegConfig = await getConfig('SECOND_DEGREE_VALUATION'); // Assuming it returns { type: 'percentage' or 'fixed', value: Number }
  if (secondDegConfig !== undefined) {
    let secondDegBonus;

    if (secondDegConfig.type === 'percentage') {
      // Calculate bonus as a percentage of conversionAmt
      secondDegBonus = conversionAmt * (secondDegConfig.value / 100);
    } else if (secondDegConfig.type === 'fixed') {
      // Fixed amount as specified in configuration
      secondDegBonus = secondDegConfig.value;
    } else {
      throw new Error('Invalid second-degree bonus configuration');
    }

    // Add the second-degree referral bonus to the second-degree user’s wallet
    await secondDegWallet.addTransaction('credit', secondDegBonus, `Second-degree referral bonus from sale conversion of value: ${conversionAmt}`);
  } else {
    throw new Error('Second-degree bonus configuration not found');
  }

  return { lead, sale, wallet, secondDegWallet };
}

module.exports = {
  convertLead,
};
