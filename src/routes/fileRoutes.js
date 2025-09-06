const express = require('express');
const router = express.Router();
const { isAuthenticated, checkRoleOrPermission } = require('../middleware/authMiddleware');
const { upload, fileUploadCheck } = require('../middleware/fileMiddleware');
const fileController = require('../controllers/fileController');

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    max: 2000,
    windowMs: 30 * 60 * 1000,
    message: "Too many requests from this IP"
  });

// router.use(limiter);

// Protected route for file upload
router.post('/upload', isAuthenticated,
  upload.single('file'),
  // fileUploadCheck, (req, res) => {
  // });
  fileController.uploadFileController
);

// Protected routes for file operations
router.post('/getSignedUrl', isAuthenticated, fileController.generateSignedUrl);

router.get('/download/:fileId', fileController.downloadFileController);

router.delete('/file/:fileId', isAuthenticated, fileController.deleteFileController);

router.get('/files', fileController.listFilesController);

router.put('/update/:fileId',
  isAuthenticated,
  upload.single('file'), fileController.updateFileController);

router.get('/search', fileController.searchFilesController);

// Add to fileRoutes.js
router.post('/download-multiple', fileController.downloadMultipleFilesController);

module.exports = router;

