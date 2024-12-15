const affiliateService = require('../services/affiliateService');


const createAffiliate = async (req, res) => {
    try {
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
