const debug = require('debug')('app:middleware:auth');
const jwt = require('jsonwebtoken');
const User = require('@/models/User');

const authMiddleware = async (req, res, next) => {
    try {
        // ตรวจสอบว่ามี Authorization header หรือไม่ และต้องขึ้นต้นด้วย 'Bearer '
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'กรุณาเข้าสู่ระบบ (Token is required)',
            });
        }

        // แยก Token ออกจาก "Bearer "
        const token = authHeader.split(' ')[1];

        try {
            // ตรวจสอบความถูกต้องของ Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // ค้นหาผู้ใช้จาก ID ที่อยู่ใน Token ด้วยเมธอดมาตรฐาน findByPk
            const user = await User.findByPk(decoded.id);

            // ตรวจสอบว่ามีผู้ใช้งานนี้ในระบบจริงหรือไม่
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'ไม่พบผู้ใช้งาน (User not found)',
                });
            }

            // ถ้าทุกอย่างถูกต้อง ให้แนบข้อมูลผู้ใช้ไปกับ Request แล้วไปขั้นตอนถัดไป
            req.user = user;
            next();
        } catch (error) {
            // Catch นี้จะทำงานเมื่อ Token ไม่ถูกต้อง หรือหมดอายุ
            return res.status(401).json({
                success: false,
                message:
                    'Token ไม่ถูกต้องหรือหมดอายุ (Invalid or expired token)',
            });
        }
    } catch (error) {
        // Catch ชั้นนอกสุดนี้จะทำงานเมื่อเกิดข้อผิดพลาดอื่นๆ ที่ไม่คาดคิดในระบบ
        // และจะบันทึก error ลงใน console ผ่าน debug
        debug('Auth middleware system error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์ (Authentication error)',
        });
    }
};

module.exports = authMiddleware;
