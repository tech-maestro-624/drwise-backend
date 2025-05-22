const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { isAuthenticated, checkRoleOrPermission } = require('../middleware/authMiddleware');

// Generic report endpoints
router.post('/', 
  isAuthenticated, 
  checkRoleOrPermission('CREATE_REPORT'), 
  reportController.createReport
);

router.get('/', 
  isAuthenticated, 
  checkRoleOrPermission('READ_REPORT'), 
  reportController.getReports
);

router.get('/:id', 
  isAuthenticated, 
  checkRoleOrPermission('READ_REPORT'), 
  reportController.getReportById
);

router.delete('/:id', 
  isAuthenticated, 
  checkRoleOrPermission('DELETE_REPORT'), 
  reportController.deleteReport
);

// Specialized report generation endpoints
router.post('/transaction', 
  isAuthenticated, 
  checkRoleOrPermission('GENERATE_TRANSACTION_REPORT'), 
  reportController.generateTransactionReport
);

router.post('/sales', 
  isAuthenticated, 
  checkRoleOrPermission('GENERATE_SALES_REPORT'), 
  reportController.generateSalesReport
);

router.post('/leads', 
  isAuthenticated, 
  checkRoleOrPermission('GENERATE_LEADS_REPORT'), 
  reportController.generateLeadsReport
);

router.post('/payments', 
  isAuthenticated, 
  checkRoleOrPermission('GENERATE_PAYMENT_REPORT'), 
  reportController.generatePaymentReport
);

module.exports = router; 