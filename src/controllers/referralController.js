// controllers/referralController.js

const referralService = require('../services/referralService');

exports.createReferral = async (req, res) => {
  const { referredName, referredPhoneNumber } = req.body;
  const referrerId = req.user._id; 

  try {
    const result = await referralService.createReferral(referrerId, referredName, referredPhoneNumber);
    res.status(201).json({ message: 'Referral created successfully', ...result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create referral' });
  }
};

exports.convertLead = async (req, res) => {
  console.log(req.body);
  
  const { leadId, productId, price } = req.body;

  try {
    const result = await referralService.convertLead(leadId, productId, price);
    res.status(200).json({ message: 'Lead converted successfully, sale recorded, and bonus awarded', ...result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};