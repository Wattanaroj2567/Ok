const debug = require('debug')('app:controller:review');
const Review = require('@/models/Review');
const Book = require('@/models/Book'); // อาจจำเป็นต้องใช้ในอนาคต

// POST /api/review - สร้างรีวิวใหม่
const createReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bookId, rating, content } = req.body;
        debug('Creating review:', { userId, bookId, rating });

        // Optional: ตรวจสอบว่าเคยรีวิวหนังสือเล่มนี้ไปแล้วหรือยัง
        const existingReview = await Review.findOne({
            where: { userId, bookId },
        });
        if (existingReview) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: 'คุณเคยรีวิวหนังสือเล่มนี้ไปแล้ว',
                });
        }

        const review = await Review.create({ userId, bookId, rating, content });

        debug('Review created successfully:', {
            reviewId: review.id,
            userId,
            bookId,
        });
        res.status(201).json({ success: true, review });
    } catch (error) {
        debug('Create review error:', error);
        res.status(400).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการสร้างรีวิว',
        });
    }
};

// GET /api/review/book/:bookId - ดึงรีวิวทั้งหมดของหนังสือ
const getBookReviews = async (req, res) => {
    try {
        const { bookId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        debug('Getting reviews for book:', { bookId, page, limit });

        const result = await Review.findAndCountAll({
            where: { bookId },
            limit: limit,
            offset: (page - 1) * limit,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: User,
                    attributes: ['id', 'displayName', 'profileImage'],
                },
            ], // ดึงข้อมูลผู้เขียนรีวิวมาด้วย
        });

        debug('Book reviews retrieved successfully:', {
            bookId,
            count: result.count,
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

// GET /api/review/user/:userId - ดึงรีวิวทั้งหมดของผู้ใช้
const getUserReviews = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        debug('Getting reviews for user:', { userId, page, limit });

        const result = await Review.findAndCountAll({
            where: { userId },
            limit: limit,
            offset: (page - 1) * limit,
            order: [['createdAt', 'DESC']],
            include: [
                { model: Book, attributes: ['id', 'title', 'coverImage'] },
            ], // ดึงข้อมูลหนังสือที่รีวิวมาด้วย
        });

        debug('User reviews retrieved successfully:', {
            userId,
            count: result.count,
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

// PUT /api/review/:id - อัปเดตรีวิว
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { rating, content } = req.body;
        debug('Updating review:', { reviewId: id, userId, rating });

        const review = await Review.findOne({ where: { id, userId } });

        if (!review) {
            debug('Review not found or unauthorized:', {
                reviewId: id,
                userId,
            });
            return res
                .status(404)
                .json({
                    success: false,
                    message: 'ไม่พบรีวิวหรือไม่มีสิทธิ์แก้ไข',
                });
        }

        await review.update({ rating, content });

        debug('Review updated successfully:', { reviewId: id, userId });
        res.json({ success: true, review });
    } catch (error) {
        debug('Update review error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการแก้ไขรีวิว',
        });
    }
};

// DELETE /api/review/:id - ลบรีวิว
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        debug('Deleting review:', { reviewId: id, userId });

        const review = await Review.findOne({ where: { id, userId } });

        if (!review) {
            debug('Review not found or unauthorized for delete:', {
                reviewId: id,
                userId,
            });
            return res
                .status(404)
                .json({
                    success: false,
                    message: 'ไม่พบรีวิวหรือไม่มีสิทธิ์ลบ',
                });
        }

        await review.destroy();

        debug('Review deleted successfully:', { reviewId: id, userId });
        res.json({ success: true, message: 'ลบรีวิวสำเร็จ' });
    } catch (error) {
        debug('Delete review error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการลบรีวิว',
        });
    }
};

// ทำการ export ฟังก์ชันทั้งหมดเพื่อให้ไฟล์อื่นเรียกใช้ได้
module.exports = {
    createReview,
    getBookReviews,
    getUserReviews,
    updateReview,
    deleteReview,
};
