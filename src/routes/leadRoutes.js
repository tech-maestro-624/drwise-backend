// routes/leadRoutes.js

const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const {isAuthenticated,checkRoleOrPermission} = require('../middleware/authMiddleware');

// Lead management routes
router.post('/',isAuthenticated, 
    // checkRoleOrPermission('CREATE_LEAD'), 
    leadController.createLead);
router.get('/', isAuthenticated, 
    // checkRoleOrPermission('READ_LEAD'), 
    leadController.getAllLeads);
router.get('/:leadId',isAuthenticated, 
    // checkRoleOrPermission('READ_LEAD'), 
    leadController.getLeadById);
router.put('/:leadId',isAuthenticated,
    // checkRoleOrPermission('UPDATE_LEAD'),
    leadController.updateLead);
router.delete('/:leadId', isAuthenticated, checkRoleOrPermission('DELETE_LEAD'), leadController.deleteLead);

// Admin route for migrating old lead data
router.post('/migrate-products', isAuthenticated, checkRoleOrPermission('ADMIN'), leadController.migrateLeadProducts);

module.exports = router;
