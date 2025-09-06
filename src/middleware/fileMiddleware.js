const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    cb(null, basename + '-' + uniqueSuffix + extension);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allow all file types for now - you can customize this
  cb(null, true);
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit - adjust as needed
  }
});

// Middleware to handle file upload validation
const fileUploadCheck = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  // Additional validation can be added here
  next();
};

// Middleware for registration file uploads (Aadhar, Selfie, and potentially others)
const registrationUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 10 // Maximum 10 files for registration
  }
});

// Fields configuration for registration upload
const registrationUploadFields = registrationUpload.fields([
  { name: 'aadharFile', maxCount: 1 },
  { name: 'selfieFile', maxCount: 1 },
  { name: 'additionalFiles', maxCount: 8 } // For any additional documents
]);

// Validation middleware for registration uploads
const validateRegistrationFiles = (req, res, next) => {
  const files = req.files || {};

  // Check if required files are present
  if (!files.aadharFile || files.aadharFile.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Aadhar file is required'
    });
  }

  if (!files.selfieFile || files.selfieFile.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Selfie file is required'
    });
  }

  // Validate file types (allow images and PDFs)
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  const allFiles = [...files.aadharFile, ...files.selfieFile];

  if (files.additionalFiles) {
    allFiles.push(...files.additionalFiles);
  }

  for (const file of allFiles) {
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `File type ${file.mimetype} not allowed for file ${file.originalname}. Only JPEG, PNG, and PDF files are allowed.`
      });
    }
  }

  next();
};

module.exports = {
  upload,
  fileUploadCheck,
  registrationUploadFields,
  validateRegistrationFiles
};

