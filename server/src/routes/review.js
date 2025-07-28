const express = require('express');
const router = express.Router();
const reviewController = require('@/controllers/reviewController');
const authMiddleware = require('@/middleware/auth/authMiddleware');

// --- Review-Specific Routes ---

// GET /api/review/user/:userId - ดึงรีวิวทั้งหมดที่เขียนโดยผู้ใช้คนหนึ่ง
// เส้นทางนี้ยังคงอยู่ที่นี่ เพราะเป็นการค้นหาจาก user ไม่ใช่ book
router.get('/user/:userId', reviewController.getUserReviews);

// PUT /api/review/:id - อัปเดตรีวิวของตัวเอง
router.put('/:id', authMiddleware, reviewController.updateReview);

// DELETE /api/review/:id - ลบรีวิวของตัวเอง
router.delete('/:id', authMiddleware, reviewController.deleteReview);

module.exports = router;
