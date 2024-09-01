const express = require('express');
const router = express.Router();
const ModelController = require('../controllers/modelController');
const { isAuthenticated, checkRoleOrPermission } = require('../middleware/authMiddleware');

router.get('/get',isAuthenticated,checkRoleOrPermission("READ_MODELS"), ModelController.getAllModels);

module.exports = router;
