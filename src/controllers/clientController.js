const clientService = require('../services/clientService');

exports.createClient = async (req, res) => {
  try {
    const client = await clientService.createClient(req.body);
    res.status(201).json({ success: true, data: client });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllClients = async (req, res) => {
  try {
    const clients = await clientService.getAllClients(req.query);
    res.status(200).json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await clientService.getClientById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    res.status(200).json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const client = await clientService.updateClient(req.params.id, req.body);
    res.status(200).json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const client = await clientService.deleteClient(req.params.id);
    res.status(200).json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getClientsByStatus = async (req, res) => {
  try {
    const clients = await clientService.getClientsByStatus(req.params.status);
    res.status(200).json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addClientDocument = async (req, res) => {
  try {
    const { documentType, fileId } = req.body;
    const client = await clientService.addClientDocument(req.params.id, documentType, fileId);
    res.status(200).json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeClientDocument = async (req, res) => {
  try {
    const client = await clientService.removeClientDocument(req.params.id, req.params.documentId);
    res.status(200).json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateClientProfileImage = async (req, res) => {
  try {
    const client = await clientService.updateClientProfileImage(req.params.id, req.body.fileId);
    res.status(200).json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
