const { body } = require('express-validator');

const bookSearchValidation = [
    body('search')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('คำค้นหาต้องมีความยาวอย่างน้อย 2 ตัวอักษร'),
];

module.exports = { bookSearchValidation };
