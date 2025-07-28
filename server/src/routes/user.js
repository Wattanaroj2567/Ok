const debug = require('debug')('app:route:user');
const express = require('express');
const router = express.Router();
const userController = require('@/controllers/userController');
const { authenticateToken } = require('@/middleware/auth/authMiddleware');

router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);
router.put('/email', authenticateToken, userController.changeEmail);
router.put('/password', authenticateToken, userController.changePassword);
router.delete('/', authenticateToken, userController.deleteAccount);

module.exports = router;
