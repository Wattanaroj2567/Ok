// ให้บรรทัดนี้อยู่บนสุดสุด เพื่อเปิด alias ก่อน
require('module-alias/register');

// Patch สำหรับ path-to-regexp ก่อน require express
try {
    const pathToRegexp = require('path-to-regexp');
    const originalPathToRegexp = pathToRegexp.pathToRegexp;

    pathToRegexp.pathToRegexp = function (path, keys, options) {
        // ตรวจสอบ path ที่มีปัญหา
        if (typeof path === 'string') {
            // แก้ไข path ที่มี parameter syntax ผิด
            path = path.replace(/:\s*$/, ''); // ลบ : ที่ท้าย
            path = path.replace(/:([^\/]*?):/g, ':$1'); // แก้ไข parameter ที่มี : ซ้ำ
            path = path.replace(/\/:/g, '/'); // ลบ parameter ว่าง
        }

        try {
            return originalPathToRegexp.call(this, path, keys, options);
        } catch (error) {
            console.error('Path-to-regexp error with path:', path);
            console.error('Original error:', error.message);
            // ส่งคืน regex พื้นฐาน
            return /^.*$/;
        }
    };

    console.log('✅ Path-to-regexp patched successfully');
} catch (error) {
    console.log('⚠️ Could not patch path-to-regexp:', error.message);
}

// โหลดตัวแปรจาก .env
require('dotenv').config();

// สำหรับดีบัก flow หลักของเซิร์ฟเวอร์
const debug = require('debug')('app:server');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Sequelize instance
const sequelize = require('@/config/database');

// สร้าง Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware พื้นฐาน
app.use(helmet()); // Security headers
app.use(cors()); // CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Static files (สำหรับรูปภาพ)
app.use('/uploads', express.static(path.join(__dirname, 'src/uploads')));

// เพิ่ม middleware เพื่อ log ทุก request
app.use((req, res, next) => {
    debug(`${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    debug('Health check requested');
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// Route modules
try {
    debug('Loading auth routes...');
    const authRoutes = require('@/routes/auth');
    app.use('/api/auth', authRoutes);
    debug('✅ Auth routes registered');
} catch (error) {
    console.error('❌ Error with auth routes:', error.message);
}

try {
    debug('Loading user routes...');
    const userRoutes = require('@/routes/user');
    app.use('/api/user', userRoutes);
    debug('✅ User routes registered');
} catch (error) {
    console.error('❌ Error with user routes:', error.message);
}

try {
    debug('Loading book routes...');
    const bookRoutes = require('@/routes/book');
    app.use('/api/book', bookRoutes);
    debug('✅ Book routes registered');
} catch (error) {
    console.error('❌ Error with book routes:', error.message);
}

try {
    debug('Loading review routes...');
    const reviewRoutes = require('@/routes/review');
    app.use('/api/review', reviewRoutes);
    debug('✅ Review routes registered');
} catch (error) {
    console.error('❌ Error with review routes:', error.message);
}

// Error handler
try {
    const errorHandler = require('@/middleware/error/errorHandler');
    app.use(errorHandler);
    debug('✅ Error handler loaded');
} catch (error) {
    console.error('❌ Error loading error handler:', error.message);
}

// 404 handler
app.all('*', (req, res) => {
    debug(`404 - ${req.method} ${req.path}`);
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.path,
        method: req.method,
    });
});

// Global error handlers
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    if (error.message.includes('Missing parameter name')) {
        console.error('🔍 Path-to-regexp error detected');
        console.error(
            '🔍 This is likely caused by Express 5.x compatibility issues',
        );
        console.log('💡 Consider downgrading to Express 4.x for stability');
    }
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection:', reason);
});

// Start server
const server = app.listen(PORT, () => {
    debug(`🚀 Server running on port ${PORT}`);
    debug(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    debug(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

server.on('error', (error) => {
    console.error('❌ Server error:', error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    debug('SIGTERM received, shutting down gracefully');
    server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
    debug('SIGINT received, shutting down gracefully');
    server.close(() => process.exit(0));
});
