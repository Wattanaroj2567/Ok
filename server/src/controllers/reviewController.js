const debug = require('debug')('app:controller:review');
const Review = require('@/models/Review');

// POST /review
exports.createReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookId, rating, content } = req.body;
        debug('Creating review:', { userId, bookId, rating });
        const review = await Review.createReview(userId, bookId, {
            rating,
            content,
        });
        debug('Review created successfully:', {
            reviewId: review.id,
            userId,
            bookId,
        });
        res.status(201).json({ success: true, review });
    } catch (error) {
        debug('Create review error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// GET /review/book/:bookId
exports.getBookReviews = async (req, res) => {
    try {
        const bookId = req.params.bookId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        debug('Getting reviews for book:', { bookId, page, limit });
        const result = await Review.getBookReviews(bookId, page, limit);
        debug('Book reviews retrieved successfully:', {
            bookId,
            count: result.count,
            reviews: result.rows.length,
        });
        res.json({ success: true, ...result });
    } catch (error) {
        debug('Get book reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงรีวิวหนังสือ',
        });
    }
};

// GET /review/user/:userId
exports.getUserReviews = async (req, res) => {
    try {
        const userId = req.params.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        debug('Getting reviews for user:', { userId, page, limit });
        const result = await Review.getUserReviews(userId, page, limit);
        debug('User reviews retrieved successfully:', {
            userId,
            count: result.count,
            reviews: result.rows.length,
        });
        res.json({ success: true, ...result });
    } catch (error) {
        debug('Get user reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงรีวิวของผู้ใช้',
        });
    }
};

// PUT /review/:id
exports.updateReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user.id;
        const { rating, content } = req.body;
        debug('Updating review:', { reviewId, userId, rating });
        const review = await Review.findOne({
            where: { id: reviewId, userId },
        });
        if (!review) {
            debug('Review not found or unauthorized:', { reviewId, userId });
            return res.status(404).json({
                success: false,
                message: 'ไม่พบรีวิวหรือไม่มีสิทธิ์แก้ไข',
            });
        }
        await review.update({ rating, content });
        debug('Review updated successfully:', { reviewId, userId });
        res.json({ success: true, review });
    } catch (error) {
        debug('Update review error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการแก้ไขรีวิว',
        });
    }
};

// DELETE /review/:id
exports.deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.user.id;
        debug('Deleting review:', { reviewId, userId });
        await Review.deleteReview(reviewId, userId);
        debug('Review deleted successfully:', { reviewId, userId });
        res.json({ success: true, message: 'ลบรีวิวสำเร็จ' });
    } catch (error) {
        debug('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการลบรีวิว',
        });
    }
};
