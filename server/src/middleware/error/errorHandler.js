const multer = require('multer');

const errorHandler = (err, req, res, next) => {
    // จัดการ error จาก multer
    if (err instanceof multer.MulterError) {
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    message: 'ไฟล์มีขนาดใหญ่เกินไป',
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    success: false,
                    message: 'จำนวนไฟล์เกินกำหนด',
                });
            default:
                return res.status(400).json({
                    success: false,
                    message: 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์',
                });
        }
    }

    // จัดการ error ทั่วไป
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'เกิดข้อผิดพลาดในระบบ',
    });
};

module.exports = errorHandler;
