const express = require('express');
const router = express.Router();
const bookController = require('@/controllers/bookController');
const reviewController = require('@/controllers/reviewController'); // Import reviewController มาด้วย
const authMiddleware = require('@/middleware/auth/authMiddleware');

// --- Book Routes ---

// GET /api/book - ดึงรายการหนังสือทั้งหมด
router.get('/', bookController.getBookList);

// GET /api/book/:id - ดึงรายละเอียดหนังสือเล่มเดียว
router.get('/:id', bookController.getBookDetail);

// --- Nested Review Routes (เส้นทางรีวิวที่ขึ้นกับหนังสือ) ---

// GET /api/book/:bookId/reviews - ดึงรีวิวทั้งหมดของหนังสือเล่มนี้
// ย้ายมาจาก review.js เพื่อให้เส้นทางสมเหตุสมผลมากขึ้น
router.get('/:bookId/reviews', reviewController.getBookReviews);

// POST /api/book/:bookId/reviews - สร้างรีวิวใหม่ให้กับหนังสือเล่มนี้
// ย้ายมาจาก review.js และต้องมีการยืนยันตัวตนก่อน
router.post('/:bookId/reviews', authMiddleware, reviewController.createReview);

module.exports = router;
