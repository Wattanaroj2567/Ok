const multer = require('multer');
const path = require('path');

// กำหนดที่เก็บและชื่อไฟล์
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profiles/');
    },
    filename: function (req, file, cb) {
        // สร้างชื่อไฟล์ที่ไม่ซ้ำกัน: profile-timestamp-randomnumber.jpg
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    },
});

// ตรวจสอบประเภทไฟล์
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น'), false);
    }
};

const profileUpload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
        files: 1, // อัพโหลดได้ 1 ไฟล์
    },
    fileFilter: fileFilter,
});

module.exports = profileUpload;
