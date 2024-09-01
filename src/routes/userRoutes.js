const userController = require('../controllers/userController')
const express = require('express')
const { isAuthenticated, checkRoleOrPermission } = require('../middleware/authMiddleware')
const router = express.Router()

router.get('/get-users',isAuthenticated,checkRoleOrPermission('READ_USER'),userController.get)

module.exports = router