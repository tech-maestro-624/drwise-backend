const mongoose = require('mongoose');

const fileUploadSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  entityType: {
    type: String,
  },
  entityName: {
    type: String,
  },
  localFilePath: String,
  fileType: String,
  fileSize: {
    type: Number,
    default: 0
  },
}, { timestamps: true });

// Index for efficient queries
fileUploadSchema.index({ entityType: 1, entityName: 1 });
fileUploadSchema.index({ fileName: 1 });

module.exports = mongoose.model('FileUpload', fileUploadSchema);

