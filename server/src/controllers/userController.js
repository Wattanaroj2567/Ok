const debug = require('debug')('app:controller:user');
const bcrypt = require('bcryptjs');
const User = require('@/models/User');

// GET /user/profile
exports.getProfile = async (req, res) => {
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

// PUT /user/profile
exports.updateProfile = async (req, res) => {
    try {
        const user = req.user;
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

// PUT /user/email
exports.changeEmail = async (req, res) => {
    try {
        const user = req.user;
        const { newEmail } = req.body;
        debug('Changing email for user:', user.id, 'to:', newEmail);
        // ตรวจสอบอีเมลซ้ำ
        const duplicate = await User.findOne({ where: { email: newEmail } });
        if (duplicate) {
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

// PUT /user/password
exports.changePassword = async (req, res) => {
    try {
        const user = req.user;
        const { oldPassword, newPassword } = req.body;
        debug('Changing password for user:', user.id);
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            debug('Old password mismatch for user:', user.id);
            return res
                .status(400)
                .json({ success: false, message: 'รหัสผ่านเดิมไม่ถูกต้อง' });
        }
        const hashed = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashed });
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

// DELETE /user
exports.deleteAccount = async (req, res) => {
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
