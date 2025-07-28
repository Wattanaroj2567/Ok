const express = require('express');
const router = express.Router();
const authController = require('@/controllers/authController');
const {
    registerValidation,
    loginValidation,
    forgotPasswordValidation,
    resetPasswordValidation,
} = require('@/middleware/validation/authValidation');
const validateResult = require('@/middleware/validation/validateResult');
const authMiddleware = require('@/middleware/auth/authMiddleware');

// POST /api/auth/register - ลงทะเบียนผู้ใช้ใหม่
router.post(
    '/register',
    registerValidation,
    validateResult,
    authController.register,
);

// POST /api/auth/login - เข้าสู่ระบบ
router.post('/login', loginValidation, validateResult, authController.login);

// POST /api/auth/forgot-password - ขอรีเซ็ตรหัสผ่าน
router.post(
    '/forgot-password',
    forgotPasswordValidation,
    validateResult,
    authController.forgotPassword,
);

// PUT /api/auth/reset-password - ตั้งรหัสผ่านใหม่
router.put(
    '/reset-password',
    resetPasswordValidation,
    validateResult,
    authController.resetPassword,
);

// GET /api/auth/verify - ตรวจสอบ Token และดึงข้อมูลผู้ใช้ปัจจุบัน
router.get('/verify', authMiddleware, authController.verifyToken);

module.exports = router;
