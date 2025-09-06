// src/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { registrationUploadFields, validateRegistrationFiles } = require('../middleware/fileMiddleware');

router.post('/register',
  registrationUploadFields,
  validateRegistrationFiles,
  authController.register
);
router.post('/send-otp', authController.sendOtp);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/get-user', isAuthenticated, authController.getUserData);
router.get('/:phoneNumber', authController.getUserByPhoneNumber);
router.put('/update-documents/:userId',
  isAuthenticated,
  registrationUploadFields,
  validateRegistrationFiles,
  authController.updateUserDocuments
);
router.post('/register-ambassador', authController.registerAmbassador);

module.exports = router;
