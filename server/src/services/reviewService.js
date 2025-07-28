const debug = require('debug')('app:service:review');
const Review = require('@/models/Review');
const User = require('@/models/User');
const Book = require('@/models/Book');

class ReviewService {
    /**
     * @description สร้างรีวิวใหม่ พร้อมตรวจสอบว่าเคยรีวิวแล้วหรือยัง
     * @param {string} userId - ID ของผู้ใช้ที่สร้างรีวิว
     * @param {object} reviewData - ข้อมูลรีวิว { bookId, rating, content }
     * @returns {Promise<Review>}
     */
    async create(userId, reviewData) {
        const { bookId, rating, content } = reviewData;
        debug(`Creating review for book ${bookId} by user ${userId}`);

        const existingReview = await Review.findOne({
            where: { userId, bookId },
        });
        if (existingReview) {
            throw new Error('คุณเคยรีวิวหนังสือเล่มนี้ไปแล้ว');
        }

        const review = await Review.create({ userId, bookId, rating, content });
        return review;
    }

    /**
     * @description ดึงรีวิวทั้งหมดของหนังสือเล่มหนึ่ง
     * @param {string} bookId - ID ของหนังสือ
     * @param {object} query - ตัวเลือกการแบ่งหน้า { page, limit }
     * @returns {Promise<{count: number, rows: Review[]}>}
     */
    async getByBook(bookId, query) {
        const { page = 1, limit = 10 } = query;
        debug(
            `Getting reviews for book: ${bookId}, page: ${page}, limit: ${limit}`,
        );

        const options = {
            where: { bookId },
            limit: parseInt(limit, 10),
            offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: User,
                    attributes: ['id', 'displayName', 'profileImage'],
                },
            ],
        };

        return await Review.findAndCountAll(options);
    }

    /**
     * @description ดึงรีวิวทั้งหมดที่เขียนโดยผู้ใช้คนหนึ่ง
     * @param {string} userId - ID ของผู้ใช้
     * @param {object} query - ตัวเลือกการแบ่งหน้า { page, limit }
     * @returns {Promise<{count: number, rows: Review[]}>}
     */
    async getByUser(userId, query) {
        const { page = 1, limit = 10 } = query;
        debug(
            `Getting reviews by user: ${userId}, page: ${page}, limit: ${limit}`,
        );

        const options = {
            where: { userId },
            limit: parseInt(limit, 10),
            offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
            order: [['createdAt', 'DESC']],
            include: [
                { model: Book, attributes: ['id', 'title', 'coverImage'] },
            ],
        };

        return await Review.findAndCountAll(options);
    }

    /**
     * @description อัปเดตรีวิว (ต้องเป็นเจ้าของรีวิวเท่านั้น)
     * @param {string} reviewId - ID ของรีวิว
     * @param {string} userId - ID ของผู้ใช้ที่กำลังแก้ไข
     * @param {object} updateData - ข้อมูลที่จะอัปเดต { rating, content }
     * @returns {Promise<Review>}
     */
    async update(reviewId, userId, updateData) {
        const { rating, content } = updateData;
        debug(`Updating review ${reviewId} by user ${userId}`);

        const review = await Review.findOne({
            where: { id: reviewId, userId },
        });
        if (!review) {
            throw new Error('ไม่พบรีวิวหรือไม่มีสิทธิ์แก้ไข');
        }

        await review.update({ rating, content });
        return review;
    }

    /**
     * @description ลบรีวิว (ต้องเป็นเจ้าของรีวิวเท่านั้น)
     * @param {string} reviewId - ID ของรีวิว
     * @param {string} userId - ID ของผู้ใช้ที่กำลังลบ
     * @returns {Promise<void>}
     */
    async delete(reviewId, userId) {
        debug(`Deleting review ${reviewId} by user ${userId}`);

        const review = await Review.findOne({
            where: { id: reviewId, userId },
        });
        if (!review) {
            throw new Error('ไม่พบรีวิวหรือไม่มีสิทธิ์ลบ');
        }

        await review.destroy();
    }
}

module.exports = new ReviewService();
