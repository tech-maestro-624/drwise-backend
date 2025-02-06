// routes/roleRoutes.js

const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const {isAuthenticated ,checkRoleOrPermission} = require('../middleware/authMiddleware');

// Role management routes
router.post('/',isAuthenticated,  checkRoleOrPermission('CREATE_ROLE'), roleController.createRole);
router.get('/',isAuthenticated, checkRoleOrPermission('READ_ROLE'), roleController.getAllRoles);
router.get('/:roleId',isAuthenticated, checkRoleOrPermission('READ_ROLE'), roleController.getRoleById);
router.put('/:roleId',isAuthenticated, checkRoleOrPermission("UPDATE_ROLE"), roleController.updateRole);
router.delete('/:roleId', isAuthenticated, checkRoleOrPermission("DELETE_ROLE"), roleController.deleteRole);

module.exports = router;
