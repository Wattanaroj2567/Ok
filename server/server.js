// ให้บรรทัดนี้อยู่บนสุดเสมอ เพื่อเปิดใช้งาน Path Alias
require('module-alias/register');

// โหลดตัวแปรสภาพแวดล้อมจากไฟล์ .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const debug = require('debug')('app:server');

// --- การตั้งค่าพื้นฐานของแอปพลิเคชัน ---
const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware พื้นฐาน ---
app.use(helmet()); // เพิ่ม Security Headers
app.use(cors()); // เปิดใช้งาน Cross-Origin Resource Sharing
app.use(express.json()); // แปลง Request Body เป็น JSON
app.use(express.urlencoded({ extended: true })); // แปลง URL-encoded bodies

// Middleware สำหรับให้บริการไฟล์รูปภาพแบบ Static
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// Middleware สำหรับ Log ทุก Request ที่เข้ามา
app.use((req, res, next) => {
    debug(`${req.method} ${req.path}`);
    next();
});

// --- Health Check Endpoint ---
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is up and running!',
        timestamp: new Date().toISOString(),
    });
});

// --- โหลดและลงทะเบียน Routes ---
try {
    debug('Loading route modules...');
    app.use('/api/auth', require('@/routes/auth'));
    app.use('/api/user', require('@/routes/user'));
    app.use('/api/book', require('@/routes/book'));
    app.use('/api/review', require('@/routes/review'));
    debug('✅ All routes registered successfully.');
} catch (error) {
    console.error('❌ Fatal error during route registration:', error);
    process.exit(1); // ออกจากโปรแกรมหากไม่สามารถโหลด Route ได้
}

// --- Middleware สำหรับจัดการ Error ---
// Handler สำหรับ 404 Not Found (ต้องอยู่ก่อน Error Handler ตัวสุดท้าย)
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    });
});

// Global Error Handler (ต้องอยู่ท้ายสุดของ Middleware chain)
app.use(require('@/middleware/error/errorHandler'));
debug('✅ Custom error handler loaded.');

// --- การจัดการ Process และการเริ่ม Server ---
const server = app.listen(PORT, () => {
    debug(`🚀 Server is running on port ${PORT}`);
    debug(`✨ Environment: ${process.env.NODE_ENV || 'development'}`);
});

// จัดการ Unhandled Promise Rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    server.close(() => process.exit(1));
});

// จัดการ Uncaught Exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    server.close(() => process.exit(1));
});

// จัดการ Graceful Shutdown
const shutdown = (signal) => {
    debug(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
        debug('✅ Server closed.');
        process.exit(0);
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
