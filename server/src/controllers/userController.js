const debug = require('debug')('app:controller:user');
const bcrypt = require('bcryptjs');
const User = require('@/models/User');

// GET /api/user/profile - ดึงข้อมูลโปรไฟล์ผู้ใช้
const getProfile = async (req, res) => {
    try {
        const user = req.user;
        debug('Getting profile for user:', user.id);
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
        debug('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์',
        });
    }
};

// PUT /api/user/profile - อัปเดตข้อมูลโปรไฟล์
const updateProfile = async (req, res) => {
    try {
        const user = req.user;
        // รับข้อมูลเฉพาะ displayName และ profileImage เพื่อป้องกันการอัปเดต field อื่น
        const { displayName, profileImage } = req.body;
        debug('Updating profile for user:', user.id, {
            displayName,
            profileImage,
        });

        await user.update({ displayName, profileImage });

        debug('Profile updated successfully for user:', user.id);
        res.json({ success: true, message: 'อัปเดตโปรไฟล์สำเร็จ' });
    } catch (error) {
        debug('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์',
        });
    }
};

// PUT /api/user/email - เปลี่ยนอีเมล
const changeEmail = async (req, res) => {
    try {
        const user = req.user;
        const { newEmail } = req.body;
        debug('Changing email for user:', user.id, 'to:', newEmail);

        // ตรวจสอบอีเมลซ้ำ
        const existingUser = await User.findOne({ where: { email: newEmail } });
        if (existingUser && existingUser.id !== user.id) {
            debug('Email already exists:', newEmail);
            return res
                .status(400)
                .json({ success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว' });
        }

        await user.update({ email: newEmail });

        debug('Email changed successfully for user:', user.id);
        res.json({ success: true, message: 'เปลี่ยนอีเมลสำเร็จ' });
    } catch (error) {
        debug('Change email error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการเปลี่ยนอีเมล',
        });
    }
};

// PUT /api/user/password - เปลี่ยนรหัสผ่าน
const changePassword = async (req, res) => {
    try {
        const user = req.user;
        const { oldPassword, newPassword } = req.body;
        debug('Changing password for user:', user.id);

        // ตรวจสอบรหัสผ่านเดิม
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            debug('Old password mismatch for user:', user.id);
            return res
                .status(400)
                .json({ success: false, message: 'รหัสผ่านเดิมไม่ถูกต้อง' });
        }

        // เข้ารหัสรหัสผ่านใหม่
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });

        debug('Password changed successfully for user:', user.id);
        res.json({ success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
    } catch (error) {
        debug('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน',
        });
    }
};

// DELETE /api/user - ลบบัญชีผู้ใช้
const deleteAccount = async (req, res) => {
    try {
        const user = req.user;
        debug('Deleting account for user:', user.id);

        await user.destroy();

        debug('Account deleted successfully for user:', user.id);
        res.json({ success: true, message: 'ลบบัญชีผู้ใช้สำเร็จ' });
    } catch (error) {
        debug('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการลบบัญชี',
        });
    }
};

// ทำการ export ฟังก์ชันทั้งหมดเพื่อให้ไฟล์อื่นเรียกใช้ได้
module.exports = {
    getProfile,
    updateProfile,
    changeEmail,
    changePassword,
    deleteAccount,
};
