const User = require('../models/User');
const Sale = require('../models/Sale');
const Lead = require('../models/Lead');
const Config = require('../models/Configuration')

// Centralized error logging function for consistency
function logAndThrowError(action, error) {
    console.error(`Error ${action}:`, error);
    throw error;
}

async function getTotalUsers() {
    try {
        return await User.countDocuments();
    } catch (error) {
        logAndThrowError('getting total users', error);
    }
}

async function getTotalSales() {
    try {
        return await Sale.countDocuments();
    } catch (error) {
        logAndThrowError('getting total sales', error);
    }
}

async function getSalesByTimeframe(timeframe) {
    try {
        const now = new Date();
        let startDate;

        switch (timeframe) {
            case 'year':
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
            case 'day':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
                break;
            default:
                throw new Error('Invalid timeframe');
        }

        return await Sale.countDocuments({ conversionDate: { $gte: startDate } });
    } catch (error) {
        logAndThrowError(`getting sales from ${timeframe}`, error);
    }
}

async function getTotalLeads() {
    try {
        return await Lead.countDocuments();
    } catch (error) {
        logAndThrowError('getting total leads', error);
    }
}

async function getTotalConvertedLeads() {
    try {
        return await Lead.countDocuments({ status: 'Converted' });
    } catch (error) {
        logAndThrowError('getting total converted leads', error);
    }
}

async function getNewLeadsForToday() {
    try {
        const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
        const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));

        return await Lead.countDocuments({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });
    } catch (error) {
        logAndThrowError('getting new leads for today', error);
    }
}

async function getLeadsToFollowUp() {
    try {
        const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));

        return await Lead.countDocuments({
            followUpDate: { $lte: startOfDay },
            status: { $ne: 'Converted' }
        });
    } catch (error) {
        logAndThrowError('getting leads to follow up', error);
    }
}

module.exports = {
    getTotalUsers,
    getTotalSales,
    getSalesByTimeframe,
    getTotalLeads,
    getTotalConvertedLeads,
    getNewLeadsForToday,
    getLeadsToFollowUp
};