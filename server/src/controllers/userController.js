const debug = require('debug')('app:controller:user');
const userService = require('@/services/userService'); // 1. เรียกใช้ Service

// GET /api/user/profile - ดึงข้อมูลโปรไฟล์ผู้ใช้
const getProfile = async (req, res) => {
    // Logic ส่วนนี้ไม่ซับซ้อน สามารถคงไว้ที่ Controller ได้
    try {
        const user = req.user;
        debug('Get profile request for user:', user.id);
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
        debug('Get profile controller error:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
    }
};

// PUT /api/user/profile - อัปเดตข้อมูลโปรไฟล์
const updateProfile = async (req, res) => {
    try {
        await userService.updateProfile(req.user, req.body);
        res.json({ success: true, message: 'อัปเดตโปรไฟล์สำเร็จ' });
    } catch (error) {
        debug('Update profile controller error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์',
        });
    }
};

// PUT /api/user/email - เปลี่ยนอีเมล
const changeEmail = async (req, res) => {
    try {
        await userService.changeEmail(req.user, req.body.newEmail);
        res.json({ success: true, message: 'เปลี่ยนอีเมลสำเร็จ' });
    } catch (error) {
        debug('Change email controller error:', error.message);
        const statusCode = error.message.includes('ถูกใช้งานแล้ว') ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'เกิดข้อผิดพลาดในการเปลี่ยนอีเมล',
        });
    }
};

// PUT /api/user/password - เปลี่ยนรหัสผ่าน
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        await userService.changePassword(req.user, oldPassword, newPassword);
        res.json({ success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
    } catch (error) {
        debug('Change password controller error:', error.message);
        const statusCode = error.message.includes('ไม่ถูกต้อง') ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน',
        });
    }
};

// DELETE /api/user - ลบบัญชีผู้ใช้
const deleteAccount = async (req, res) => {
    try {
        await userService.deleteAccount(req.user);
        res.json({ success: true, message: 'ลบบัญชีผู้ใช้สำเร็จ' });
    } catch (error) {
        debug('Delete account controller error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message || 'เกิดข้อผิดพลาดในการลบบัญชี',
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
