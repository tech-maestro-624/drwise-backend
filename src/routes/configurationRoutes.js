const express = require('express')
const { isAuthenticated, checkRoleOrPermission } = require('../middleware/authMiddleware')
const router = express.Router()
const configurationController = require('../controllers/configurationController')

router.get('/get-configs',isAuthenticated,
    // checkRoleOrPermission('READ_CONFIGURATION'), 
    configurationController.getAll)

router.post('/set-config',isAuthenticated, 
    // checkRoleOrPermission('UPDATE_CONFIGURATION'), 
    configurationController.setConfig)

module.exports = router