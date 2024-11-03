// routes/walletRoutes.js

const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const authMiddleware = require('../middleware/authMiddleware')


// Wallet management routes
router.get('/', authMiddleware.checkRoleOrPermission('READ_WALLET'), walletController.getWallet);
router.post('/credit', authMiddleware.checkRoleOrPermission('UPDATE_WALLET'), walletController.creditWallet);
router.post('/debit', authMiddleware.checkRoleOrPermission('UPDATE_WALLET'), walletController.debitWallet);
router.get('/transactions', authMiddleware.checkRoleOrPermission('READ_WALLET'), walletController.getWalletTransactions);
router.post('/withdraw-request',authMiddleware.isAuthenticated,walletController.withdrawRequest)
router.post('/withdrawal-requests',authMiddleware.isAuthenticated,walletController.withdrawalRequests)
router.put('/update/:id',authMiddleware.isAuthenticated,walletController.update)
router.post('/withdrawal-request/:id',authMiddleware.isAuthenticated,walletController.withdrawalRequestByUser)

module.exports = router;

