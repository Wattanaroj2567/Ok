const debug = require('debug')('app:controller:auth');
const authService = require('@/services/authService');

class AuthController {
    /**
     * @description รับ Request สำหรับการลงทะเบียน และส่งต่อให้ Service
     */
    async register(req, res) {
        try {
            await authService.register(req.body);
            debug('User registration request successful');
            res.status(201).json({
                success: true,
                message: 'ลงทะเบียนสำเร็จ',
            });
        } catch (error) {
            debug('Register controller error:', error.message);
            const isDuplicateError = error.message.includes('ถูกใช้งานแล้ว');
            res.status(isDuplicateError ? 400 : 500).json({
                success: false,
                message: error.message || 'เกิดข้อผิดพลาดในการลงทะเบียน',
            });
        }
    }

    /**
     * @description รับ Request สำหรับการเข้าสู่ระบบ และส่งต่อให้ Service
     */
    async login(req, res) {
        try {
            const { token, user } = await authService.login(req.body);
            debug('User login request successful for:', user.username);
            res.json({
                success: true,
                message: 'เข้าสู่ระบบสำเร็จ',
                token,
                user,
            });
        } catch (error) {
            debug('Login controller error:', error.message);
            const isAuthError = error.message.includes('ไม่ถูกต้อง');
            res.status(isAuthError ? 401 : 500).json({
                success: false,
                message: error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
            });
        }
    }

    /**
     * @description รับ Request สำหรับการลืมรหัสผ่าน และส่งต่อให้ Service
     */
    async forgotPassword(req, res) {
        try {
            await authService.forgotPassword(req.body.email);
            // เพื่อความปลอดภัย, ส่ง Response สำเร็จเสมอ
            res.json({
                success: true,
                message:
                    'หากอีเมลของคุณมีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปให้แล้ว',
            });
        } catch (error) {
            debug('Forgot password controller error:', error.message);
            res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน',
            });
        }
    }

    /**
     * @description รับ Request สำหรับการรีเซ็ตรหัสผ่าน และส่งต่อให้ Service
     */
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            await authService.resetPassword(token, newPassword);
            res.json({
                success: true,
                message: 'รีเซ็ตรหัสผ่านสำเร็จ',
            });
        } catch (error) {
            debug('Reset password controller error:', error.message);
            const isTokenError = error.message.includes('Token');
            res.status(isTokenError ? 400 : 500).json({
                success: false,
                message: error.message || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน',
            });
        }
    }

    /**
     * @description รับ Request สำหรับการตรวจสอบ Token และส่งต่อให้ Service
     */
    async verifyToken(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            const user = await authService.verifyToken(token);
            res.json({ success: true, user });
        } catch (error) {
            debug('Verify token controller error:', error.message);
            res.status(401).json({
                success: false,
                message: error.message || 'Token ไม่ถูกต้อง',
            });
        }
    }
}

module.exports = new AuthController();
