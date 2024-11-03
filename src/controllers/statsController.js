const statsService = require('../services/statsService');

async function getDashboardStats(req, res) {
    try {
        // Execute all service functions in parallel to improve response time
        const [
            totalUsers,
            totalSales,
            salesByYear,
            salesByMonth,
            salesByDay,
            totalLeads,
            totalConvertedLeads,
            newLeadsForToday,
            leadsToFollowUp
        ] = await Promise.all([
            statsService.getTotalUsers(),
            statsService.getTotalSales(),
            statsService.getSalesByTimeframe('year'),
            statsService.getSalesByTimeframe('month'),
            statsService.getSalesByTimeframe('day'),
            statsService.getTotalLeads(),
            statsService.getTotalConvertedLeads(),
            statsService.getNewLeadsForToday(),
            statsService.getLeadsToFollowUp()
        ]);

        // Combine all data into a single response object
        const dashboardStats = {
            totalUsers,
            totalSales,
            salesByYear,
            salesByMonth,
            salesByDay,
            totalLeads,
            totalConvertedLeads,
            newLeadsForToday,
            leadsToFollowUp
        };

        res.status(200).json(dashboardStats);
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
}

module.exports = { getDashboardStats };
