const debug = require('debug')('app:model:review');
const { DataTypes } = require('sequelize');
const sequelize = require('@/config/database');
const User = require('./User');
const Book = require('./Book');

/**
 * Review Model สำหรับจัดการรีวิวหนังสือ
 * มีความสัมพันธ์กับ User (ผู้รีวิว) และ Book (หนังสือที่ถูกรีวิว)
 */
const Review = sequelize.define('Review', {
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        },
        comment: 'คะแนนดาว 1-5'
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [10, 1000] // ความยาว 10-1000 ตัวอักษร
        },
        comment: 'เนื้อหารีวิว'
    }
});

// สร้างความสัมพันธ์
Review.belongsTo(User, {
    foreignKey: {
        name: 'userId',
        allowNull: false
    },
    onDelete: 'CASCADE'
});

Review.belongsTo(Book, {
    foreignKey: {
        name: 'bookId',
        allowNull: false
    },
    onDelete: 'CASCADE'
});

// ฟังก์ชันสร้างรีวิวใหม่
Review.createReview = async function(userId, bookId, reviewData) {
    try {
        // ตรวจสอบว่าเคยรีวิวหนังสือเล่มนี้หรือยัง
        const existingReview = await Review.findOne({
            where: { userId, bookId }
        });

        if (existingReview) {
            throw new Error('คุณได้รีวิวหนังสือเล่มนี้ไปแล้ว');
        }

        const review = await Review.create({
            userId,
            bookId,
            rating: reviewData.rating,
            content: reviewData.content
        });

        // อัพเดทคะแนนเฉลี่ยและจำนวนรีวิวของหนังสือ
        await Book.findByPk(bookId).then(async (book) => {
            if (book) {
                const reviews = await Review.findAll({
                    where: { bookId }
                });
                const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
                await book.update({
                    averageRating: totalRating / reviews.length,
                    totalReviews: reviews.length
                });
            }
        });

        return review;
    } catch (error) {
        debug('Error creating review:', error);
        throw error;
    }
};

// ฟังก์ชันดึงรีวิวของหนังสือ
Review.getBookReviews = async function(bookId, page = 1, limit = 10) {
    try {
        return await Review.findAndCountAll({
            where: { bookId },
            include: [
                {
                    model: User,
                    attributes: ['username', 'displayName']
                }
            ],
            limit,
            offset: (page - 1) * limit,
            order: [['createdAt', 'DESC']]
        });
    } catch (error) {
        debug('Error getting book reviews:', error);
        throw error;
    }
};

// ฟังก์ชันดึงรีวิวของผู้ใช้
Review.getUserReviews = async function(userId, page = 1, limit = 10) {
    try {
        return await Review.findAndCountAll({
            where: { userId },
            include: [
                {
                    model: Book,
                    attributes: ['title', 'author', 'coverImage']
                }
            ],
            limit,
            offset: (page - 1) * limit,
            order: [['createdAt', 'DESC']]
        });
    } catch (error) {
        debug('Error getting user reviews:', error);
        throw error;
    }
};

// ฟังก์ชันอัพเดทรีวิว
Review.updateReview = async function(reviewId, userId, updateData) {
    try {
        const review = await Review.findOne({
            where: { id: reviewId, userId }
        });

        if (!review) {
            throw new Error('ไม่พบรีวิวที่ต้องการแก้ไข หรือคุณไม่มีสิทธิ์แก้ไขรีวิวนี้');
        }

        await review.update(updateData);

        // อัพเดทคะแนนเฉลี่ยของหนังสือ
        const book = await Book.findByPk(review.bookId);
        if (book) {
            const reviews = await Review.findAll({
                where: { bookId: review.bookId }
            });
            const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
            await book.update({
                averageRating: totalRating / reviews.length
            });
        }

        return review;
    } catch (error) {
        debug('Error updating review:', error);
        throw error;
    }
};

// ฟังก์ชันลบรีวิว
Review.deleteReview = async function(reviewId, userId) {
    try {
        const review = await Review.findOne({
            where: { id: reviewId, userId }
        });

        if (!review) {
            throw new Error('ไม่พบรีวิวที่ต้องการลบ หรือคุณไม่มีสิทธิ์ลบรีวิวนี้');
        }

        const bookId = review.bookId;
        await review.destroy();

        // อัพเดทคะแนนเฉลี่ยของหนังสือ
        const book = await Book.findByPk(bookId);
        if (book) {
            const reviews = await Review.findAll({
                where: { bookId }
            });
            if (reviews.length > 0) {
                const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
                await book.update({
                    averageRating: totalRating / reviews.length,
                    totalReviews: reviews.length
                });
            } else {
                await book.update({
                    averageRating: 0,
                    totalReviews: 0
                });
            }
        }

        return true;
    } catch (error) {
        debug('Error deleting review:', error);
        throw error;
    }
};

module.exports = Review;

