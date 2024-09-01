// routes/roleRoutes.js

const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middleware/authMiddleware');

// Role management routes
router.post('/', authMiddleware.checkRoleOrPermission('CREATE_ROLE'), roleController.createRole);
router.get('/',authMiddleware.checkRoleOrPermission('READ_ROLE'), roleController.getAllRoles);
router.get('/:roleId',authMiddleware.checkRoleOrPermission('READ_ROLE'), roleController.getRoleById);
router.put('/:roleId',authMiddleware.checkRoleOrPermission("UPDATE_ROLE"), roleController.updateRole);
router.delete('/:roleId', authMiddleware.checkRoleOrPermission("DELETE_ROLE"), roleController.deleteRole);

module.exports = router;
