const debug = require('debug')('app:service:user');
const bcrypt = require('bcryptjs');
const User = require('@/models/User');

class UserService {
    /**
     * @description อัปเดตข้อมูลโปรไฟล์ (displayName, profileImage)
     * @param {object} user - Instance ของผู้ใช้จาก Middleware
     * @param {object} profileData - ข้อมูลโปรไฟล์ที่จะอัปเดต { displayName, profileImage }
     * @returns {Promise<void>}
     */
    async updateProfile(user, profileData) {
        debug(`Updating profile for user: ${user.id}`);
        const { displayName, profileImage } = profileData;
        await user.update({ displayName, profileImage });
    }

    /**
     * @description เปลี่ยนอีเมลของผู้ใช้
     * @param {object} user - Instance ของผู้ใช้
     * @param {string} newEmail - อีเมลใหม่
     * @returns {Promise<void>}
     */
    async changeEmail(user, newEmail) {
        debug(`Changing email for user: ${user.id} to ${newEmail}`);
        const existingUser = await User.findOne({ where: { email: newEmail } });
        if (existingUser && existingUser.id !== user.id) {
            throw new Error('อีเมลนี้ถูกใช้งานแล้ว');
        }
        await user.update({ email: newEmail });
    }

    /**
     * @description เปลี่ยนรหัสผ่านของผู้ใช้
     * @param {object} user - Instance ของผู้ใช้
     * @param {string} oldPassword - รหัสผ่านเดิม
     * @param {string} newPassword - รหัสผ่านใหม่
     * @returns {Promise<void>}
     */
    async changePassword(user, oldPassword, newPassword) {
        debug(`Changing password for user: ${user.id}`);
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            throw new Error('รหัสผ่านเดิมไม่ถูกต้อง');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });
    }

    /**
     * @description ลบบัญชีผู้ใช้
     * @param {object} user - Instance ของผู้ใช้
     * @returns {Promise<void>}
     */
    async deleteAccount(user) {
        debug(`Deleting account for user: ${user.id}`);
        await user.destroy();
    }
}

module.exports = new UserService();
