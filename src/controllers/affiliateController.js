const affiliateService = require('../services/affiliateService');
const User = require('../models/User');
const { getConfig } = require('../services/configurationService');

const createAffiliate = async (req, res) => {
    try {
        // Check if the user trying to register as affiliate is already an Ambassador
        const { phoneNumber, email } = req.body;
        
        if (phoneNumber) {
            const existingUser = await User.findOne({ phoneNumber }).populate('roles');
            if (existingUser) {
                const isAmbassador = existingUser.roles.some(role =>
                    role.name.toLowerCase() === 'ambassador'
                );

                if (isAmbassador) {
                    return res.status(400).json({ 
                        message: 'Ambassadors cannot register as Affiliates. Self-referral commission is not allowed as per IRDAI guidelines.',
                        error: 'AMBASSADOR_CANNOT_BE_AFFILIATE'
                    });
                }
            }
        }
        
        if (email) {
            const existingUserByEmail = await User.findOne({ email }).populate('roles');
            if (existingUserByEmail) {
                const isAmbassador = existingUserByEmail.roles.some(role =>
                    role.name.toLowerCase() === 'ambassador'
                );
                
                if (isAmbassador) {
                    return res.status(400).json({ 
                        message: 'Ambassadors cannot register as Affiliates. Self-referral commission is not allowed as per IRDAI guidelines.',
                        error: 'AMBASSADOR_CANNOT_BE_AFFILIATE'
                    });
                }
            }
        }

        const affiliate = await affiliateService.createAffiliate(req.body);
        res.status(201).json(affiliate);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const getAllAffiliates = async (req, res) => {
    try {
        const affiliates = await affiliateService.getAllAffiliates(req.query);
        res.json(affiliates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAffiliateById = async (req, res) => {
    try {
        const affiliate = await affiliateService.getAffiliateById(req.params.id);

        if (!affiliate) {
            return res.status(404).json({ message: 'Affiliate not found' });
        }

        res.json(affiliate);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const updateAffiliate = async (req, res) => {
    try {
        const affiliate = await affiliateService.updateAffiliate(req.params.id, req.body);

        if (!affiliate) {
            return res.status(404).json({ message: 'Affiliate not found' });
        }

        res.json(affiliate);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const deleteAffiliate = async (req, res) => {
    try {
        const affiliate = await affiliateService.deleteAffiliate(req.params.id);

        if (!affiliate) {
            return res.status(404).json({ message: 'Affiliate not found' });
        }

        res.json({ message: 'Affiliate deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    createAffiliate,
    getAllAffiliates,
    getAffiliateById,
    updateAffiliate,
    deleteAffiliate,
};
