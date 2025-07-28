const { body } = require('express-validator');

const reviewValidation = [
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('คะแนนต้องอยู่ระหว่าง 1-5'),
    body('content')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('เนื้อหารีวิวต้องมีความยาว 10-1000 ตัวอักษร'),
];

module.exports = { reviewValidation };
