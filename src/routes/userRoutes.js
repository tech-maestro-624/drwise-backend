const userController = require('../controllers/userController')
const express = require('express')
const { isAuthenticated, checkRoleOrPermission } = require('../middleware/authMiddleware')
const router = express.Router()
const { getDashboardStats } = require('../controllers/statsController');


router.get('/get-users',isAuthenticated,
    // checkRoleOrPermission('READ_USER'), 
    userController.get)

router.put('/update/:id',isAuthenticated,
    // checkRoleOrPermission('UPDATE_USER'), 
    userController.update)

router.put('/token',isAuthenticated,
    // checkRoleOrPermission('UPDATE_USER'), 
    userController.updatePushNotifyToken)

router.post('/create',isAuthenticated,checkRoleOrPermission('CREATE_USER'),userController.create)

router.post('/send-notification',userController.sendNotification)

router.get('/dashboard-stats',isAuthenticated,
    // checkRoleOrPermission('READ_STATS'), 
    getDashboardStats);

router.delete('/:id', isAuthenticated,
    // checkRoleOrPermission('DELETE_USER'),
    userController.delete);

router.put('/:id/verification-status', isAuthenticated,
    // checkRoleOrPermission('UPDATE_USER'),
    userController.updateVerificationStatus);

module.exports = router;