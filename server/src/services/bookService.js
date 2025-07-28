const debug = require('debug')('app:service:book');
const { Op } = require('sequelize');
const Book = require('@/models/Book');

class BookService {
    /**
     * @description ดึงรายการหนังสือพร้อมแบ่งหน้าและค้นหา
     * @param {object} query - ตัวเลือกการค้นหา { page, limit, searchTerm }
     * @returns {Promise<{count: number, rows: Book[]}>}
     */
    async getList(query) {
        const { page = 1, limit = 12, searchTerm = '' } = query;
        debug(
            `Getting book list with page: ${page}, limit: ${limit}, search: '${searchTerm}'`,
        );

        const options = {
            limit: parseInt(limit, 10),
            offset: (parseInt(page, 10) - 1) * parseInt(limit, 10),
            order: [['createdAt', 'DESC']],
        };

        if (searchTerm) {
            options.where = {
                title: {
                    [Op.like]: `%${searchTerm}%`,
                },
            };
        }

        const result = await Book.findAndCountAll(options);
        return result;
    }

    /**
     * @description ดึงรายละเอียดหนังสือเล่มเดียวจาก ID
     * @param {string} bookId - ID ของหนังสือ
     * @returns {Promise<Book>}
     */
    async getDetail(bookId) {
        debug(`Getting book detail for ID: ${bookId}`);
        const book = await Book.findByPk(bookId);

        if (!book) {
            throw new Error('ไม่พบหนังสือ');
        }

        return book;
    }
}

module.exports = new BookService();
