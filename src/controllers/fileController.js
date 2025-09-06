const fileService = require('../services/fileService');

exports.uploadFileController = async (req, res) => {
  try {
    const { entityType, entityName } = req.body; // Extract entityType and entityName from the request
    const file = await fileService.uploadFile(req.file, entityType, entityName);
    res.status(200).json({ success: true, data: file });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.downloadFileController = async (req, res) => {
  try {
    const link = await fileService.generateDownloadLink(req.params.fileId);
    res.status(200).json({ success: true, data: link });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add to fileController.js
exports.downloadMultipleFilesController = async (req, res) => {
  try {
    const { fileIds } = req.body; // Array of file IDs

    if (!Array.isArray(fileIds)) {
      return res.status(400).json({
        success: false,
        message: 'fileIds must be an array'
      });
    }

    const fileUrls = {};
    const promises = fileIds.map(async (fileId) => {
      try {
        const link = await fileService.generateDownloadLink(fileId);
        fileUrls[fileId] = link;
      } catch (error) {
        console.error(`Error generating link for file ${fileId}:`, error);
        fileUrls[fileId] = null; // Continue with other files
      }
    });

    await Promise.all(promises);
    res.status(200).json({ success: true, data: fileUrls });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFileController = async (req, res) => {
  try {
    const success = await fileService.deleteFile(req.params.fileId);
    res.status(200).json({ success: true, data: success });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.listFilesController = async (req, res) => {
  try {
    const files = await fileService.listFiles(req.query, req.query.limit, req.query.skip);
    res.status(200).json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFileController = async (req, res) => {
  try {
    const { entityType, entityName } = req.body; // Extract entityType and entityName from the request
    const file = await fileService.updateFile(req.params.fileId, req.file, entityType, entityName);
    res.status(200).json({ success: true, data: file });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchFilesController = async (req, res) => {
  try {
    const files = await fileService.searchFiles(req.query.searchTerm, req.query.limit, req.query.skip);
    res.status(200).json({ success: true, data: files });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateSignedUrl = async(req,res) => {
  try {
    const { entityType, entityName, filename } = req.body; // Extract entityType and entityName from the request
    const url = await fileService.generateSignedUrl(filename, entityType, entityName);
    res.status(200).json({ success: true, data: url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

