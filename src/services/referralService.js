const Lead = require('../models/Lead');
const Wallet = require('../models/Wallet');
const Sale = require('../models/Sale');
const User = require('../models/User');
const Product = require('../models/Product');
const { getConfig } = require('../services/configurationService');
const walletService = require('../services/walletService');
const delayedCreditService = require('../services/delayedCreditService');

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

  // Get the product to check immediateCredit setting
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error('Product not found');
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

  // 1) First-degree user: credit based on product.immediateCredit setting
  const firstDegWallet = await Wallet.findOne({ user: lead.referrer });
  if (!firstDegWallet) {
    throw new Error('No wallet found for first-degree referrer');
  }

  if (product.immediateCredit) {
    // Immediate credit
    await walletService.creditWallet(
      lead.referrer,
      Number(refBonus),
      `Referral bonus from sale of value: ${conversionAmt}`
    );
  } else {
    // Delayed credit - schedule for later
    await delayedCreditService.createDelayedCredit(
      lead.referrer,
      Number(refBonus),
      `Referral bonus from sale of value: ${conversionAmt}`,
      'REFERRAL_BONUS'
    );
  }

  


  // 2) Check for second-degree user
  const firstDegUser = await User.findById(lead.referrer);
  const secondDegUserId = firstDegUser?.referredBy;
  console.log(secondDegUserId);

  if (secondDegUserId) {
    const secondDegUser = await User.findById(secondDegUserId);
    console.log('secondDegUser :',secondDegUser);
    
    if (secondDegUser) {
      const secondDegWallet = await Wallet.findOne({ user: secondDegUser._id });
      if (secondDegWallet) {
        const maybeUnlocked = await secondDegWallet.unlockReferralForUser(
          firstDegUser._id,
          firstDegUser.name
        );
       
      }
      const ambassadorRoleConfig = await getConfig('AMBASSADOR_ROLE_ID');
      console.log('ambassadorRoleConfig',ambassadorRoleConfig);
      

      if (!ambassadorRoleConfig) {
        throw new Error('AMBASSADOR_ROLE_ID config not found');
      }
      const ambassadorRoleId = ambassadorRoleConfig;
      console.log('ambassadorRoleId ;',ambassadorRoleId);
      
      if (secondDegUser.roles && secondDegUser.roles.includes(ambassadorRoleId)) {
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
          const secondDegTx = await secondDegWallet.addTransaction(
            'credit',
            secondDegBonus,
            `Second-degree referral bonus from user ${firstDegUser.name}`,
            secondDegUser._id
          );
        }
      } else {
        console.log(`User ${secondDegUser._id} is not an ambassador, skipping second-degree bonus.`);
      }
    }
  }

  return { lead, sale };
}

module.exports = {
  createReferral,
  convertLead,
};
