// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/send-otp', authController.sendOtp);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/get-user', authController.getUserData);

module.exports = router;
