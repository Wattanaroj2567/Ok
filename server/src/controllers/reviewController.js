const debug = require('debug')('app:controller:review');
const reviewService = require('@/services/reviewService');

// POST /api/book/:bookId/reviews - สร้างรีวิวใหม่
const createReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookId } = req.params; // ดึง bookId จาก URL
        const { rating, content } = req.body;

        const review = await reviewService.create(userId, {
            bookId,
            rating,
            content,
        });

        res.status(201).json({ success: true, review });
    } catch (error) {
        debug('Create review controller error:', error.message);
        const isDuplicateError = error.message.includes('เคยรีวิว');
        res.status(isDuplicateError ? 400 : 500).json({
            success: false,
            message: error.message || 'เกิดข้อผิดพลาดในการสร้างรีวิว',
        });
    }
};

// GET /api/book/:bookId/reviews - ดึงรีวิวของหนังสือ
const getBookReviews = async (req, res) => {
    try {
        const { bookId } = req.params;
        const result = await reviewService.getByBook(bookId, req.query);
        res.json({ success: true, ...result });
    } catch (error) {
        debug('Get book reviews controller error:', error.message);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงรีวิว',
        });
    }
};

// GET /api/review/user/:userId - ดึงรีวิวของผู้ใช้
const getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await reviewService.getByUser(userId, req.query);
        res.json({ success: true, ...result });
    } catch (error) {
        debug('Get user reviews controller error:', error.message);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงรีวิว',
        });
    }
};

// PUT /api/review/:id - อัปเดตรีวิว
const updateReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user.id;

        const updatedReview = await reviewService.update(
            reviewId,
            userId,
            req.body,
        );

        res.json({ success: true, review: updatedReview });
    } catch (error) {
        debug('Update review controller error:', error.message);
        const isNotFoundError = error.message.includes('ไม่พบรีวิว');
        res.status(isNotFoundError ? 404 : 500).json({
            success: false,
            message: error.message || 'เกิดข้อผิดพลาดในการแก้ไขรีวิว',
        });
    }
};

// DELETE /api/review/:id - ลบรีวิว
const deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user.id;

        await reviewService.delete(reviewId, userId);

        res.json({ success: true, message: 'ลบรีวิวสำเร็จ' });
    } catch (error) {
        debug('Delete review controller error:', error.message);
        const isNotFoundError = error.message.includes('ไม่พบรีวิว');
        res.status(isNotFoundError ? 404 : 500).json({
            success: false,
            message: error.message || 'เกิดข้อผิดพลาดในการลบรีวิว',
        });
    }
};

module.exports = {
    createReview,
    getBookReviews,
    getUserReviews,
    updateReview,
    deleteReview,
};
