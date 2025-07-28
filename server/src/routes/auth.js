const debug = require('debug')('app:route:auth');
const express = require('express');
const router = express.Router();
const authController = require('@/controllers/authController');
const { validateRegistration, validateLogin } = require('@/middleware/validation/authValidation');

// ลงทะเบียน
router.post('/register', validateRegistration, authController.register);

// เข้าสู่ระบบ
router.post('/login', validateLogin, authController.login);

// ลืมรหัสผ่าน
router.post('/forgot-password', authController.forgotPassword);

// รีเซ็ตรหัสผ่าน
router.post('/reset-password', authController.resetPassword);

// ตรวจสอบ token
router.get('/verify', authController.verifyToken);

module.exports = router;
