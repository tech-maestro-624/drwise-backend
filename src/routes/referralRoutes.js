// routes/referralRoutes.js

const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const authMiddleware = require('../middleware/authMiddleware');

// Route to convert a lead (admin or authorized personnel only)
router.post('/convert', authMiddleware.isAuthenticated, referralController.convertLead);

module.exports = router;
