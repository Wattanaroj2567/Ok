const debug = require('debug')('app:controller:auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize'); // เพิ่มบรรทัดนี้
const User = require('@/models/User');
const sendEmail = require('@/utils/email');

class AuthController {
    // ลงทะเบียน
    async register(req, res) {
        try {
            const { username, displayName, email, password } = req.body;
            debug('User registration attempt:', { username, email });

            // เช็คข้อมูลซ้ำ
            const isDuplicate = await User.checkDuplicate(username, email);
            if (isDuplicate) {
                debug('Registration failed - duplicate data:', {
                    username,
                    email,
                });
                return res.status(400).json({
                    success: false,
                    message: 'Username หรือ Email นี้ถูกใช้งานแล้ว',
                });
            }

            // เข้ารหัสผ่าน
            const hashedPassword = await bcrypt.hash(password, 10);

            // สร้างผู้ใช้ใหม่
            await User.createUser({
                username,
                displayName,
                email,
                password: hashedPassword,
            });

            debug('User registered successfully:', { username, email });
            res.status(201).json({
                success: true,
                message: 'ลงทะเบียนสำเร็จ',
            });
        } catch (error) {
            debug('Register error:', error);
            res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการลงทะเบียน',
            });
        }
    }

    // เข้าสู่ระบบ
    async login(req, res) {
        try {
            const { emailOrUsername, password } = req.body;
            debug('Login attempt:', { emailOrUsername });

            // ค้นหาผู้ใช้
            const user = await User.login(emailOrUsername);
            if (!user) {
                debug('Login failed - user not found:', { emailOrUsername });
                return res.status(401).json({
                    success: false,
                    message: 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง',
                });
            }

            // ตรวจสอบรหัสผ่าน
            const isValidPassword = await bcrypt.compare(
                password,
                user.password,
            );
            if (!isValidPassword) {
                debug('Login failed - invalid password:', { emailOrUsername });
                return res.status(401).json({
                    success: false,
                    message: 'ข้อมูลเข้าสู่ระบบไม่ถูกต้อง',
                });
            }

            // สร้าง token
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN,
            });

            debug('User logged in successfully:', {
                userId: user.id,
                emailOrUsername,
            });
            res.json({
                success: true,
                message: 'เข้าสู่ระบบสำเร็จ',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    displayName: user.displayName,
                    email: user.email,
                    profileImage: user.profileImage,
                },
            });
        } catch (error) {
            debug('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
            });
        }
    }

    // ลืมรหัสผ่าน
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            debug('Forgot password request:', { email });

            // ค้นหาผู้ใช้จากอีเมล
            const user = await User.findOne({ where: { email } });
            if (!user) {
                debug('Forgot password failed - email not found:', { email });
                return res.status(404).json({
                    success: false,
                    message: 'ไม่พบอีเมลนี้ในระบบ',
                });
            }

            // สร้าง token สำหรับรีเซ็ตรหัสผ่าน
            const resetToken = crypto.randomBytes(32).toString('hex');
            const tokenExpiry = new Date(Date.now() + 3600000); // หมดอายุใน 1 ชั่วโมง

            // บันทึก token ลงในฐานข้อมูล
            await user.update({
                resetToken: resetToken,
                resetTokenExpiry: tokenExpiry,
            });

            // ส่งอีเมล
            await sendEmail.sendPasswordResetEmail(email, resetToken);

            debug('Password reset email sent successfully:', { email });
            res.json({
                success: true,
                message: 'ส่งอีเมลรีเซ็ตรหัสผ่านแล้ว กรุณาตรวจสอบอีเมลของคุณ',
            });
        } catch (error) {
            debug('Forgot password error:', error);
            res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน',
            });
        }
    }

    // รีเซ็ตรหัสผ่าน
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            debug('Password reset attempt with token');

            // ค้นหาผู้ใช้จาก token
            const user = await User.findOne({
                where: {
                    resetToken: token,
                    resetTokenExpiry: { [Op.gt]: new Date() },
                },
            });

            if (!user) {
                debug('Password reset failed - invalid or expired token');
                return res.status(400).json({
                    success: false,
                    message: 'Token ไม่ถูกต้องหรือหมดอายุ',
                });
            }

            // เข้ารหัสรหัสผ่านใหม่
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // อัพเดทรหัสผ่านและล้าง token
            await user.update({
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            });

            debug('Password reset successful:', { userId: user.id });
            res.json({
                success: true,
                message: 'รีเซ็ตรหัสผ่านสำเร็จ',
            });
        } catch (error) {
            debug('Reset password error:', error);
            res.status(500).json({
                success: false,
                message: 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน',
            });
        }
    }

    // ตรวจสอบสถานะการเข้าสู่ระบบ
    async verifyToken(req, res) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            debug('Token verification attempt');

            if (!token) {
                debug('Token verification failed - no token provided');
                return res.status(401).json({
                    success: false,
                    message: 'ไม่พบ Token',
                });
            }

            // ตรวจสอบ token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findByPk(decoded.id);

            if (!user) {
                debug('Token verification failed - user not found:', {
                    userId: decoded.id,
                });
                return res.status(401).json({
                    success: false,
                    message: 'ไม่พบผู้ใช้งาน',
                });
            }

            debug('Token verified successfully:', { userId: user.id });
            res.json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    displayName: user.displayName,
                    email: user.email,
                    profileImage: user.profileImage,
                },
            });
        } catch (error) {
            debug('Verify token error:', error);
            res.status(401).json({
                success: false,
                message: 'Token ไม่ถูกต้องหรือหมดอายุ',
            });
        }
    }
}

module.exports = new AuthController();
