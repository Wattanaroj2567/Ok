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
     * @param {object} userData - ข้อมูลผู้ใช้ { username, displayName, email, password }
     * @returns {Promise<User>} - ข้อมูลผู้ใช้ที่สร้างใหม่
     */
    async register(userData) {
        const { username, displayName, email, password } = userData;
        debug('Registering user in service:', { username, email });

        // 1. เช็คข้อมูลซ้ำ
        const isDuplicate = await User.findOne({
            where: { [Op.or]: [{ username }, { email }] },
        });
        if (isDuplicate) {
            debug('Registration failed - duplicate data');
            throw new Error('Username หรือ Email นี้ถูกใช้งานแล้ว');
        }

        // 2. เข้ารหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. สร้างผู้ใช้ใหม่
        const newUser = await User.create({
            username,
            displayName,
            email,
            password: hashedPassword,
        });

        return newUser;
    }

    /**
     * @description จัดการ Logic การเข้าสู่ระบบ
     * @param {object} loginData - ข้อมูล { emailOrUsername, password }
     * @returns {Promise<{token: string, user: object}>} - Token และข้อมูลผู้ใช้
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
            debug('Login failed - user not found');
            throw new Error('ข้อมูลเข้าสู่ระบบไม่ถูกต้อง');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            debug('Login failed - invalid password');
            throw new Error('ข้อมูลเข้าสู่ระบบไม่ถูกต้อง');
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        });

        // คืนค่าเฉพาะข้อมูลที่จำเป็น
        const userProfile = {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            email: user.email,
            profileImage: user.profileImage,
        };

        return { token, user: userProfile };
    }

    // ... สามารถย้าย Logic อื่นๆ เช่น forgotPassword, resetPassword มาไว้ที่นี่ได้ในลักษณะเดียวกัน ...
}

module.exports = new AuthService();
