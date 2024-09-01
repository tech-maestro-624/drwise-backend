// routes/permissionRoutes.js

const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const authMiddleware = require('../middleware/authMiddleware');

// Permission management routes
router.post('/', authMiddleware.checkRoleOrPermission("CREATE_PERMISSION"), permissionController.createPermission);
router.get('/',authMiddleware.checkRoleOrPermission('READ_PERMISSION'), permissionController.getAllPermissions);
router.get('/:permissionId',authMiddleware.checkRoleOrPermission('READ_PERMISSION'), permissionController.getPermissionById);
router.put('/:permissionId', authMiddleware.checkRoleOrPermission('UPDATE_PERMISSION'), permissionController.updatePermission);
router.delete('/:permissionId', authMiddleware.checkRoleOrPermission('DELETE_PERMISSION'), permissionController.deletePermission);

module.exports = router;
