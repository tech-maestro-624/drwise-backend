const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { isAuthenticated, checkRoleOrPermission } = require('../middleware/authMiddleware');

// Wallet management routes
router.get('/', isAuthenticated, checkRoleOrPermission('READ_WALLET'), walletController.getWallet);
router.post('/credit', isAuthenticated, checkRoleOrPermission('UPDATE_WALLET'), walletController.creditWallet);
router.post('/debit', isAuthenticated, checkRoleOrPermission('UPDATE_WALLET'), walletController.debitWallet);
router.get('/transactions', isAuthenticated, checkRoleOrPermission('READ_WALLET'), walletController.getWalletTransactions);

// Additional routes for withdrawal
router.post('/withdraw-request', isAuthenticated, walletController.withdrawRequest);
router.post('/withdrawal-requests', isAuthenticated, walletController.withdrawalRequests);
router.put('/update/:id', isAuthenticated, walletController.update);
router.post('/withdrawal-request/:id', isAuthenticated, walletController.withdrawalRequestByUser);

module.exports = router;
