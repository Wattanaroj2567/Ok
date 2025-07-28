const debug = require('debug')('app:service:auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const User = require('@/models/User');
const sendEmail = require('@/utils/email');

class AuthService {
    /**
     * @description จัดการ Logic การลงทะเบียนผู้ใช้ใหม่
     */
    async register(userData) {
        const { username, displayName, email, password } = userData;
        debug('Registering user in service:', { username, email });

        const isDuplicate = await User.findOne({
            where: { [Op.or]: [{ username }, { email }] },
        });
        if (isDuplicate) {
            throw new Error('Username หรือ Email นี้ถูกใช้งานแล้ว');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        return await User.create({
            username,
            displayName,
            email,
            password: hashedPassword,
        });
    }

    /**
     * @description จัดการ Logic การเข้าสู่ระบบ
     */
    async login(loginData) {
        const { emailOrUsername, password } = loginData;
        debug('Processing login in service:', { emailOrUsername });

        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username: emailOrUsername },
                    { email: emailOrUsername },
                ],
            },
        });
        if (!user) {
            throw new Error('ข้อมูลเข้าสู่ระบบไม่ถูกต้อง');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('ข้อมูลเข้าสู่ระบบไม่ถูกต้อง');
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });
        const userProfile = {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            email: user.email,
            profileImage: user.profileImage,
        };

        return { token, user: userProfile };
    }

    /**
     * @description จัดการ Logic การลืมรหัสผ่าน
     */
    async forgotPassword(email) {
        debug('Processing forgot password for email:', email);
        const user = await User.findOne({ where: { email } });
        if (!user) {
            // ไม่โยน Error เพื่อความปลอดภัย แต่ทำงานให้เหมือนสำเร็จ
            debug('Forgot password - email not found, but pretending success.');
            return;
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(Date.now() + 3600000); // 1 ชั่วโมง

        await user.update({ resetToken, resetTokenExpiry: tokenExpiry });
        await sendEmail.sendPasswordResetEmail(email, resetToken);
    }

    /**
     * @description จัดการ Logic การรีเซ็ตรหัสผ่าน
     */
    async resetPassword(token, newPassword) {
        debug('Processing password reset with token');
        const user = await User.findOne({
            where: {
                resetToken: token,
                resetTokenExpiry: { [Op.gt]: new Date() },
            },
        });

        if (!user) {
            throw new Error('Token ไม่ถูกต้องหรือหมดอายุ');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
        });
    }

    /**
     * @description ตรวจสอบ Token และดึงข้อมูลผู้ใช้
     */
    async verifyToken(token) {
        debug('Verifying token in service');
        if (!token) {
            throw new Error('ไม่พบ Token');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            throw new Error('ไม่พบผู้ใช้งาน');
        }

        return {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            email: user.email,
            profileImage: user.profileImage,
        };
    }
}

module.exports = new AuthService();
