const debug = require('debug')('app:middleware:auth');
const jwt = require('jsonwebtoken');
const User = require('@/models/User');

const authMiddleware = async (req, res, next) => {
    try {
        // ตรวจสอบว่ามี token ใน header หรือไม่
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'กรุณาเข้าสู่ระบบ'
            });
        }

        // แยก token
        const token = authHeader.split(' ')[1];

        try {
            // ตรวจสอบ token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // ค้นหาผู้ใช้จาก token
            const user = await User.findByPk(decoded.id);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'ไม่พบผู้ใช้งาน'
                });
            }

            // เพิ่มข้อมูลผู้ใช้ใน request
            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token ไม่ถูกต้องหรือหมดอายุ'
            });
        }
    } catch (error) {
        debug('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์'
        });
    }
};

module.exports = authMiddleware;
