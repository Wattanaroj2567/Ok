const { body, validationResult } = require('express-validator');

// Validation chains
const userValidationRules = {
    username: body('username')
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage('Username ต้องมีความยาว 3-20 ตัวอักษร')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username ต้องประกอบด้วยตัวอักษร ตัวเลข และ _ เท่านั้น'),
    
    displayName: body('displayName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('ชื่อที่แสดงต้องมีความยาว 2-50 ตัวอักษร'),
    
    email: body('email')
        .trim()
        .isEmail()
        .withMessage('รูปแบบอีเมลไม่ถูกต้อง')
        .normalizeEmail(),
    
    password: body('password')
        .isLength({ min: 6 })
        .withMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]/)
        .withMessage('รหัสผ่านต้องประกอบด้วยตัวอักษรและตัวเลขอย่างน้อย 1 ตัว'),
    
    confirmPassword: body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('รหัสผ่านไม่ตรงกัน');
            }
            return true;
        })
};

// Validation middleware
exports.validateRegistration = [
    userValidationRules.username,
    userValidationRules.displayName,
    userValidationRules.email,
    userValidationRules.password,
    userValidationRules.confirmPassword,
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'ข้อมูลไม่ถูกต้อง',
                errors: errors.array()
            });
        }
        next();
    }
];

exports.validateLogin = [
    body('emailOrUsername')
        .trim()
        .notEmpty()
        .withMessage('กรุณากรอก Email หรือ Username'),
    body('password')
        .notEmpty()
        .withMessage('กรุณากรอกรหัสผ่าน'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'ข้อมูลไม่ถูกต้อง',
                errors: errors.array()
            });
        }
        next();
    }
];
