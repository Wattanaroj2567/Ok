const jwt = require('jsonwebtoken');
const User = require('@/models/User');

// ตรวจสอบ token และยืนยันตัวตน
const authenticateToken = async (req, res, next) => {
    try {
        // ดึง token จาก header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'กรุณาเข้าสู่ระบบ',
            });
        }

        // ตรวจสอบ token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.getById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'ไม่พบผู้ใช้งาน',
            });
        }

        // เพิ่มข้อมูล user ใน request
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token ไม่ถูกต้องหรือหมดอายุ',
        });
    }
};

module.exports = { authenticateToken };
