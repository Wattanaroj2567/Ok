const express = require('express');
const router = express.Router();
const userController = require('@/controllers/userController');
const authMiddleware = require('@/middleware/auth/authMiddleware');
// อาจจะต้องเพิ่ม validation middleware ในอนาคต

// GET /api/user/profile - ดึงข้อมูลโปรไฟล์ของผู้ใช้ที่ล็อกอินอยู่
router.get('/profile', authMiddleware, userController.getProfile);

// PUT /api/user/profile - อัปเดตโปรไฟล์ (displayName, profileImage)
router.put('/profile', authMiddleware, userController.updateProfile);

// PUT /api/user/email - เปลี่ยนอีเมล
router.put('/email', authMiddleware, userController.changeEmail);

// PUT /api/user/password - เปลี่ยนรหัสผ่าน
router.put('/password', authMiddleware, userController.changePassword);

// DELETE /api/user - ลบบัญชีผู้ใช้ของตัวเอง
router.delete('/', authMiddleware, userController.deleteAccount);

module.exports = router;
