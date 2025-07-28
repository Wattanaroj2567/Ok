const debug = require('debug')('app:controller:book');
const Book = require('@/models/Book');

// GET /api/book - ดึงรายการหนังสือทั้งหมด (แบ่งหน้า)
const getBookList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        debug('Getting book list:', { page, limit });

        const result = await Book.findAndCountAll({
            limit: limit,
            offset: (page - 1) * limit,
            order: [['createdAt', 'DESC']],
        });

        debug('Book list retrieved successfully:', {
            count: result.count,
            rows: result.rows.length,
        });
        res.json({ success: true, ...result });
    } catch (error) {
        debug('Get book list error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงรายการหนังสือ',
        });
    }
};

// GET /api/book/:id - ดึงรายละเอียดหนังสือ
const getBookDetail = async (req, res) => {
    try {
        const bookId = req.params.id;
        debug('Getting book detail for ID:', bookId);

        const book = await Book.findByPk(bookId);

        if (!book) {
            debug('Book not found for ID:', bookId);
            return res
                .status(404)
                .json({ success: false, message: 'ไม่พบหนังสือ' });
        }

        debug('Book detail retrieved successfully for ID:', bookId);
        res.json({ success: true, book });
    } catch (error) {
        debug('Get book detail error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงรายละเอียดหนังสือ',
        });
    }
};

// ทำการ export ฟังก์ชันทั้งหมดเพื่อให้ไฟล์อื่นเรียกใช้ได้
module.exports = {
    getBookList,
    getBookDetail,
};
