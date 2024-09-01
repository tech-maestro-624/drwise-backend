// routes/leadRoutes.js

const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const authMiddleware = require('../middleware/authMiddleware');

// Lead management routes
router.post('/', authMiddleware.checkRoleOrPermission('CREATE_LEAD'), leadController.createLead);
router.get('/', authMiddleware.checkRoleOrPermission('READ_LEAD'),leadController.getAllLeads);
router.get('/:leadId',authMiddleware.checkRoleOrPermission('READ_LEAD'), leadController.getLeadById);
router.put('/:leadId', authMiddleware.checkRoleOrPermission('UPDATE_LEAD'), leadController.updateLead);
router.delete('/:leadId', authMiddleware.checkRoleOrPermission('DELETE_LEAD'), leadController.deleteLead);

module.exports = router;
