// src/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/send-otp', authController.sendOtp);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/get-user', isAuthenticated, authController.getUserData);
router.post('/register-ambassador', authController.registerAmbassador);

module.exports = router;
