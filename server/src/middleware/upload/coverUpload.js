const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/covers/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'cover-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น'), false);
    }
};

const coverUpload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1,
    },
    fileFilter: fileFilter,
});

module.exports = coverUpload;
