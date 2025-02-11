const Lead = require('../models/Lead');
const Wallet = require('../models/Wallet');
const Sale = require('../models/Sale');
const User = require('../models/User');
const { getConfig } = require('../services/configurationService');
const walletService = require('../services/walletService');

async function createReferral(referrerId, referredName, referredPhoneNumber) {
  const lead = new Lead({
    referrer: referrerId,
    name: referredName,
    phoneNumber: referredPhoneNumber,
    status: 'New',
  });
  await lead.save();
  return { lead };
}

async function convertLead(
  leadId,
  productId,
  price,
  conversionAmt,
  refBonus,
  categoryId
) {
  const lead = await Lead.findByIdAndUpdate(
    leadId,
    { status: 'Converted' },
    { new: true }
  );
  if (!lead) {
    throw new Error('Lead not found');
  }

  const sale = new Sale({
    lead: leadId,
    product: productId,
    price,
    referrer: lead.referrer,
    referralBonus: refBonus,
    categoryId,
  });
  await sale.save();

  // 1) First-degree user: credit immediately
  const firstDegWallet = await Wallet.findOne({ user: lead.referrer });
  if (!firstDegWallet) {
    throw new Error('No wallet found for first-degree referrer');
  }

  // Using your walletService or direct method:
  await walletService.creditWallet(
    lead.referrer,
    Number(refBonus),
    `Referral bonus from sale of value: ${conversionAmt}`
  );

  // 2) Check for second-degree user
  const firstDegUser = await User.findById(lead.referrer);
  const secondDegUserId = firstDegUser?.referredBy;

  if (secondDegUserId) {
    const secondDegUser = await User.findById(secondDegUserId);
    if (secondDegUser) {
      const secondDegWallet = await Wallet.findOne({ user: secondDegUser._id });
      if (secondDegWallet) {
        const secondDegConfig = await getConfig('SECOND_DEGREE_VALUATION');
        if (!secondDegConfig) {
          throw new Error('SECOND_DEGREE_VALUATION config not found');
        }

        let secondDegBonus = 0;
        if (secondDegConfig.type === 'percentage') {
          secondDegBonus = conversionAmt * (secondDegConfig.value / 100);
        } else if (secondDegConfig.type === 'fixed') {
          secondDegBonus = secondDegConfig.value;
        } else {
          throw new Error('Invalid second-degree bonus config');
        }

        const maybeUnlocked = await secondDegWallet.unlockReferralForUser(
          firstDegUser._id,
          firstDegUser.name
        );
        if (maybeUnlocked) {
          console.log('Unlocked an existing locked referral for second-degree user:', maybeUnlocked);
        }

        const secondDegTx = await secondDegWallet.addTransaction(
          'credit',
          secondDegBonus,
          `Second-degree referral bonus from user ${firstDegUser.name}`,
          secondDegUser._id
        );
        console.log('Created second-degree bonus transaction:', secondDegTx);
      }
    }
  }

  return { lead, sale };
}

module.exports = {
  createReferral,
  convertLead,
};
