const fs = require("fs");
const path = require("path");
const FileUpload = require("../models/File");

const baseURL = process.env.BASE_URL || "http://localhost:5001";

/**
 * Generates a file path for storing files based on entity type, entity name, and file name.
 * @param {string} entityType - The type of entity (e.g., 'user', 'order').
 * @param {string} entityName - The name of the entity.
 * @param {string} fileName - The name of the file.
 * @returns {string} The file path.
 */
function getFilePath(entityType, entityName, fileName) {
  const folderPath = path.join("uploads", entityType, entityName);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  return path.join(folderPath, fileName);
}

/**
 * Uploads a file to local storage.
 * @async
 * @function uploadFile
 * @param {Object} file - The file to upload.
 * @param {string} entityType - The type of entity.
 * @param {string} entityName - The name of the entity.
 * @returns {Promise<Object>} The saved file object.
 * @throws {Error} If the upload fails.
 */
exports.uploadFile = async (file, entityType, entityName) => {
  const filePath = getFilePath(entityType, entityName, file.filename);

  const newFile = new FileUpload({
    fileName: file.filename,
    entityType,
    entityName,
    fileType: file.mimetype,
    fileSize: file.size || 0,
    localFilePath: filePath,
  });

  try {
    // Move file from temp location to final destination
    await fs.promises.copyFile(file.path, filePath);
    // Clean up temp file
    await fs.promises.unlink(file.path);

    await newFile.save();
    return newFile;
  } catch (err) {
    console.error("Error storing file locally:", err);
    throw err;
  }
};

/**
 * Generates a download link for a locally stored file.
 * @async
 * @function generateDownloadLink
 * @param {string} fileId - The ID of the file.
 * @returns {Promise<string>} The download link.
 * @throws {Error} If generating the download link fails.
 */
exports.generateDownloadLink = async (fileId) => {
  const file = await FileUpload.findById(fileId);
  if (!file) throw new Error("File not found");

  // For local files, return the direct URL
  // Remove 'uploads/' prefix from localFilePath since static route serves from /uploads
  const relativePath = file.localFilePath.replace(/^uploads[\/\\]/, '').replace(/\\/g, '/');
  const encodedFilePath = encodeURIComponent(relativePath);
  const fileURL = `${baseURL}/uploads/${encodedFilePath}`;
  return fileURL;
};

/**
 * Deletes a locally stored file.
 * @async
 * @function deleteFile
 * @param {string} fileId - The ID of the file to delete.
 * @returns {Promise<boolean>} True if the file was successfully deleted.
 * @throws {Error} If the deletion fails.
 */
exports.deleteFile = async (fileId) => {
  const file = await FileUpload.findById(fileId);

  if (!file) throw new Error("File not found");

  // Delete the physical file
  try {
    if (fs.existsSync(file.localFilePath)) {
      fs.unlinkSync(file.localFilePath);
    }
  } catch (error) {
    console.error("Error deleting physical file:", error);
    throw error;
  }

  // Delete the database record
  await FileUpload.findByIdAndDelete(fileId);
  return true;
};

/**
 * Lists files based on a query, with pagination.
 * @async
 * @function listFiles
 * @param {Object} [query={}] - The query to filter files.
 * @param {number} [limit=10] - The maximum number of files to return.
 * @param {number} [skip=0] - The number of files to skip.
 * @returns {Promise<Array>} The list of files.
 */
exports.listFiles = async (query = {}, limit = 10, skip = 0) => {
  return FileUpload.find(query).limit(limit).skip(skip).sort({ createdAt: -1 });
};

/**
 * Updates a file by deleting the old one and uploading a new one.
 * @async
 * @function updateFile
 * @param {string} fileId - The ID of the file to update.
 * @param {Object} newFile - The new file to upload.
 * @param {string} entityType - The type of entity.
 * @param {string} entityName - The name of the entity.
 * @returns {Promise<Object>} The updated file object.
 * @throws {Error} If the update fails.
 */
exports.updateFile = async (fileId, newFile, entityType, entityName) => {
  const file = await FileUpload.findById(fileId);
  if (!file) throw new Error("File not found");

  const oldFilePath = file.localFilePath;
  const newFilePath = getFilePath(entityType, entityName, newFile.filename);

  // Delete old file if it exists
  try {
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }
  } catch (error) {
    console.error("Error deleting old file:", error);
  }

  // Update file record
  file.fileName = newFile.filename;
  file.entityType = entityType;
  file.entityName = entityName;
  file.fileType = newFile.mimetype;
  file.fileSize = newFile.size || 0;
  file.localFilePath = newFilePath;

  // Move new file to final location
  try {
    await fs.promises.copyFile(newFile.path, newFilePath);
    await fs.promises.unlink(newFile.path);
  } catch (error) {
    console.error("Error moving new file:", error);
    throw error;
  }

  await file.save();
  return file;
};

/**
 * Searches files by file name with case-insensitive matching, with pagination.
 * @async
 * @function searchFiles
 * @param {string} searchTerm - The term to search for in file names.
 * @param {number} [limit=10] - The maximum number of files to return.
 * @param {number} [skip=0] - The number of files to skip.
 * @returns {Promise<Array>} The list of files matching the search term.
 */
exports.searchFiles = async (searchTerm, limit = 10, skip = 0) => {
  const regex = new RegExp(searchTerm, "i"); // case-insensitive search
  return FileUpload.find({ fileName: regex }).limit(limit).skip(skip).sort({ createdAt: -1 });
};

/**
 * Generates a signed URL for uploading a file (placeholder for local storage).
 * @async
 * @function generateSignedUrl
 * @param {string} filename - The name of the file.
 * @param {string} entityType - The type of entity.
 * @param {string} entityName - The name of the entity.
 * @returns {Promise<Object>} An object containing the file path and URL.
 */
exports.generateSignedUrl = async (filename, entityType, entityName) => {
  const filePath = getFilePath(entityType, entityName, filename);
  const url = `${baseURL}/upload/${encodeURIComponent(filePath)}`;
  return { filePath, url };
};

