const { body } = require('express-validator');

const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('Username ต้องมีความยาว 3-20 ตัวอักษร'),
    body('displayName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Display Name ต้องมีความยาว 2-50 ตัวอักษร'),
    body('email').trim().isEmail().withMessage('รูปแบบอีเมลไม่ถูกต้อง'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('รหัสผ่านไม่ตรงกัน');
        }
        return true;
    }),
];

const loginValidation = [
    body('emailOrUsername')
        .notEmpty()
        .withMessage('กรุณากรอกอีเมลหรือ username'),
    body('password').notEmpty().withMessage('กรุณากรอกรหัสผ่าน'),
];

module.exports = { registerValidation, loginValidation };
