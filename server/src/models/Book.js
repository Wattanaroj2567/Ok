const debug = require('debug')('app:model:book');
const { DataTypes, Op } = require('sequelize');
const sequelize = require('@/config/database');

/**
 * Book Model สำหรับแสดงรายการหนังสือให้ผู้ใช้เลือกรีวิว
 * ไม่รวมฟังก์ชันจัดการหนังสือแบบเต็ม (CRUD โดยแอดมิน)
 */
const Book = sequelize.define('Book', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'ชื่อหนังสือ'
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'ชื่อผู้แต่ง'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'เรื่องย่อหรือคำอธิบายหนังสือ'
    },
    coverImage: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'default-book-cover.jpg',
        comment: 'URL หรือ path ของรูปปกหนังสือ'
    },
    averageRating: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
        comment: 'คะแนนเฉลี่ยจากรีวิวทั้งหมด'
    },
    totalReviews: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'จำนวนรีวิวทั้งหมด'
    }
});

// ฟังก์ชันพื้นฐานสำหรับการแสดงรายการหนังสือ
Book.getBookList = async function(page = 1, limit = 12) {
    try {
        return await Book.findAndCountAll({
            limit,
            offset: (page - 1) * limit,
            order: [['title', 'ASC']],
            attributes: ['id', 'title', 'author', 'coverImage', 'averageRating', 'totalReviews']
        });
    } catch (error) {
        debug('Error getting book list:', error);
        throw error;
    }
};

// ฟังก์ชันดึงข้อมูลหนังสือเพื่อแสดงรายละเอียด
Book.getBookDetail = async function(id) {
    try {
        return await Book.findByPk(id);
    } catch (error) {
        debug('Error getting book detail:', error);
        throw error;
    }
};

module.exports = Book;
