// routes/permissionRoutes.js

const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const {checkRoleOrPermission} = require('../middleware/authMiddleware');

// Permission management routes
router.post('/', checkRoleOrPermission("CREATE_PERMISSION"), permissionController.createPermission);
router.get('/',checkRoleOrPermission('READ_PERMISSION'), permissionController.getAllPermissions);
router.get('/:permissionId',checkRoleOrPermission('READ_PERMISSION'), permissionController.getPermissionById);
router.put('/:permissionId', checkRoleOrPermission('UPDATE_PERMISSION'), permissionController.updatePermission);
router.delete('/:permissionId', checkRoleOrPermission('DELETE_PERMISSION'), permissionController.deletePermission);

module.exports = router;
