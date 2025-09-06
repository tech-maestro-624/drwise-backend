const Client = require('../models/Client');
const FileUpload = require('../models/File');

async function createClient(data) {
  // Validate file references if provided
  if (data.profileImage) {
    const profileImageFile = await FileUpload.findById(data.profileImage);
    if (!profileImageFile) {
      throw new Error('Profile image file not found');
    }
  }

  // Validate document file references
  if (data.documents && data.documents.length > 0) {
    for (const doc of data.documents) {
      const file = await FileUpload.findById(doc.file);
      if (!file) {
        throw new Error(`Document file not found: ${doc.file}`);
      }
    }
  }

  const client = new Client(data);
  await client.save();
  return client.populate(['user', 'profileImage', 'documents.file']);
}

async function getAllClients(query = {}) {
  const { limit = 10, skip = 0, status, clientType } = query;

  let filter = {};
  if (status) filter.status = status;
  if (clientType) filter.clientType = clientType;

  return Client.find(filter)
    .populate('user', 'firstName lastName email mobile')
    .populate('profileImage')
    .populate('documents.file')
    .populate('corporateDetails.documents.file')
    .populate('familyDetails.documents.file')
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .sort({ createdAt: -1 });
}

async function getClientById(clientId) {
  return Client.findById(clientId)
    .populate('user', 'firstName lastName email mobile')
    .populate('profileImage')
    .populate('documents.file')
    .populate('corporateDetails.documents.file')
    .populate('familyDetails.documents.file');
}

async function updateClient(clientId, data) {
  // Validate file references if provided
  if (data.profileImage) {
    const profileImageFile = await FileUpload.findById(data.profileImage);
    if (!profileImageFile) {
      throw new Error('Profile image file not found');
    }
  }

  // Validate document file references
  if (data.documents && data.documents.length > 0) {
    for (const doc of data.documents) {
      const file = await FileUpload.findById(doc.file);
      if (!file) {
        throw new Error(`Document file not found: ${doc.file}`);
      }
    }
  }

  const client = await Client.findByIdAndUpdate(
    clientId,
    data,
    { new: true }
  )
    .populate('user', 'firstName lastName email mobile')
    .populate('profileImage')
    .populate('documents.file')
    .populate('corporateDetails.documents.file')
    .populate('familyDetails.documents.file');

  if (!client) {
    throw new Error('Client not found');
  }

  return client;
}

async function deleteClient(clientId) {
  const client = await Client.findByIdAndDelete(clientId);
  if (!client) {
    throw new Error('Client not found');
  }
  return client;
}

async function getClientsByStatus(status) {
  return Client.find({ status })
    .populate('user', 'firstName lastName email mobile')
    .populate('profileImage')
    .populate('documents.file')
    .populate('corporateDetails.documents.file')
    .populate('familyDetails.documents.file')
    .sort({ createdAt: -1 });
}

async function addClientDocument(clientId, documentType, fileId) {
  // Validate file exists
  const file = await FileUpload.findById(fileId);
  if (!file) {
    throw new Error('File not found');
  }

  const client = await Client.findById(clientId);
  if (!client) {
    throw new Error('Client not found');
  }

  // Add document to client's documents array
  client.documents.push({
    documentType,
    file: fileId
  });

  await client.save();
  return client.populate(['user', 'profileImage', 'documents.file']);
}

async function removeClientDocument(clientId, documentId) {
  const client = await Client.findById(clientId);
  if (!client) {
    throw new Error('Client not found');
  }

  // Remove document from array
  client.documents = client.documents.filter(
    doc => doc._id.toString() !== documentId
  );

  await client.save();
  return client.populate(['user', 'profileImage', 'documents.file']);
}

async function updateClientProfileImage(clientId, fileId) {
  // Validate file exists
  const file = await FileUpload.findById(fileId);
  if (!file) {
    throw new Error('Profile image file not found');
  }

  const client = await Client.findByIdAndUpdate(
    clientId,
    { profileImage: fileId },
    { new: true }
  )
    .populate('user', 'firstName lastName email mobile')
    .populate('profileImage')
    .populate('documents.file');

  if (!client) {
    throw new Error('Client not found');
  }

  return client;
}

module.exports = {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
  getClientsByStatus,
  addClientDocument,
  removeClientDocument,
  updateClientProfileImage
};
