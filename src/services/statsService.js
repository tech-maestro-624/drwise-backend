const User = require('../models/User');
const Sale = require('../models/Sale');
const Lead = require('../models/Lead');
const Config = require('../models/Configuration');
const cacheService = require('./cacheService');

function logAndThrowError(action, error) {
  console.error(`Error ${action}:`, error);
  throw error;
}

async function getTotalUsers() {
  try {
    const cacheKey = 'stats:totalUsers';

    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        return await User.countDocuments();
      },
      300 // 5 minutes TTL for user stats
    );
  } catch (error) {
    logAndThrowError('getting total users', error);
  }
}

async function getTotalSales() {
  try {
    const cacheKey = 'stats:totalSales';

    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        return await Sale.countDocuments();
      },
      300 // 5 minutes TTL
    );
  } catch (error) {
    logAndThrowError('getting total sales', error);
  }
}

async function getSalesByTimeframe(timeframe) {
  try {
    const cacheKey = `stats:sales:${timeframe}`;

    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        const now = new Date();
        const startDate = new Date();

        switch (timeframe) {
          case 'year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
          case 'month':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case 'day':
            startDate.setDate(startDate.getDate() - 1);
            break;
          default:
            throw new Error('Invalid timeframe');
        }

        return await Sale.countDocuments({
          conversionDate: { $gte: startDate, $lte: now }
        });
      },
      300 // 5 minutes TTL
    );
  } catch (error) {
    logAndThrowError(`getting sales from ${timeframe}`, error);
  }
}

async function getTotalLeads() {
  try {
    const cacheKey = 'stats:totalLeads';

    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        return await Lead.countDocuments();
      },
      300 // 5 minutes TTL
    );
  } catch (error) {
    logAndThrowError('getting total leads', error);
  }
}

async function getTotalConvertedLeads() {
  try {
    const cacheKey = 'stats:totalConvertedLeads';

    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        return await Lead.countDocuments({ status: 'Converted' });
      },
      300 // 5 minutes TTL
    );
  } catch (error) {
    logAndThrowError('getting total converted leads', error);
  }
}

async function getNewLeadsForToday() {
  try {
    const cacheKey = 'stats:newLeadsToday';

    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));
        const endOfDay = new Date(new Date().setHours(23, 59, 59, 999));

        return await Lead.countDocuments({
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        });
      },
      600 // 10 minutes TTL for daily stats
    );
  } catch (error) {
    logAndThrowError('getting new leads for today', error);
  }
}

async function getLeadsToFollowUp() {
  try {
    const cacheKey = 'stats:leadsToFollowUp';

    return await cacheService.getOrSet(
      cacheKey,
      async () => {
        const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));

        return await Lead.countDocuments({
          followUpDate: { $lte: startOfDay },
          status: { $ne: 'Converted' }
        });
      },
      600 // 10 minutes TTL
    );
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
