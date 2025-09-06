const express = require('express');
const router = express.Router();
const { isAuthenticated, checkRoleOrPermission } = require('../middleware/authMiddleware');
const clientController = require('../controllers/clientController');

// Create client
router.post('/', isAuthenticated, checkRoleOrPermission('CREATE_CLIENT'), clientController.createClient);

// Get all clients with filtering
router.get('/', isAuthenticated, clientController.getAllClients);

// Get client by ID
router.get('/:id', isAuthenticated, clientController.getClientById);

// Update client
router.put('/:id', isAuthenticated, clientController.updateClient);

// Delete client
router.delete('/:id', isAuthenticated, clientController.deleteClient);

// Get clients by status
router.get('/status/:status', isAuthenticated, clientController.getClientsByStatus);

// Add document to client
router.post('/:id/documents', isAuthenticated, clientController.addClientDocument);

// Remove document from client
router.delete('/:id/documents/:documentId', isAuthenticated, clientController.removeClientDocument);

// Update client profile image
router.put('/:id/profile-image', isAuthenticated, clientController.updateClientProfileImage);

module.exports = router;
