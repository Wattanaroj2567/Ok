const debug = require('debug')('app:model:user');
const { DataTypes, Op } = require('sequelize');
const sequelize = require('@/config/database');

// กำหนด User Model
const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 20], // ความยาว 3-20 ตัวอักษร
            notEmpty: true
        }
    },
    lastUsernameChange: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
    },
    displayName: {
        type: DataTypes.STRING,
        allowNull: false,  // เปลี่ยนเป็น false เพราะเป็นข้อมูลที่ต้องระบุตอนลงทะเบียน
        validate: {
            len: [2, 50]  // ความยาว 2-50 ตัวอักษร
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            notEmpty: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 100], // ความยาวขั้นต่ำ 6 ตัวอักษร
            notEmpty: true
        }
    },
    profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'default-profile.png' // รูปโปรไฟล์เริ่มต้น
    },
    resetToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetTokenExpiry: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

// CRUD Static Methods
// ฟังก์ชันตรวจสอบ username และ email ซ้ำ
User.checkDuplicate = async function(username, email) {
    try {
        const exists = await User.findOne({
            where: {
                [Op.or]: [
                    { username: username },
                    { email: email }
                ]
            }
        });
        return exists !== null;
    } catch (error) {
        debug('Error checking duplicate:', error);
        throw error;
    }
};

// ฟังก์ชันสำหรับล็อกอิน
User.login = async function(emailOrUsername, password) {
    try {
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { email: emailOrUsername },
                    { username: emailOrUsername }
                ]
            }
        });

        if (!user) {
            throw new Error('ไม่พบผู้ใช้งาน');
        }

        // TODO: เพิ่มการเปรียบเทียบรหัสผ่านที่เข้ารหัสแล้ว (ทำใน controller)
        // ตอนนี้เช็คแค่ว่ามี user อยู่จริง
        return user;
    } catch (error) {
        debug('Error logging in:', error);
        throw error;
    }
};

// ฟังก์ชันสำหรับรีเซ็ตรหัสผ่าน
User.resetPassword = async function(email) {
    try {
        const user = await User.findOne({
            where: { email: email }
        });

        if (!user) {
            throw new Error('ไม่พบอีเมลนี้ในระบบ');
        }

        // TODO: สร้าง token สำหรับรีเซ็ตรหัสผ่าน (ทำใน controller)
        // ส่งอีเมลพร้อม token (ทำใน controller)
        return true;
    } catch (error) {
        debug('Error resetting password:', error);
        throw error;
    }
};

// ฟังก์ชันอัพเดทรหัสผ่าน
User.updatePassword = async function(id, newPassword) {
    try {
        const user = await User.findByPk(id);
        if (!user) {
            throw new Error('ไม่พบผู้ใช้งาน');
        }

        // TODO: เข้ารหัสรหัสผ่านก่อนบันทึก (ทำใน controller)
        return await user.update({
            password: newPassword
        });
    } catch (error) {
        debug('Error updating password:', error);
        throw error;
    }
};

User.createUser = async function(userData) {
    try {
        // ตรวจสอบข้อมูลซ้ำก่อนสร้าง User
        const isDuplicate = await User.checkDuplicate(userData.username, userData.email);
        if (isDuplicate) {
            throw new Error('Username หรือ Email นี้ถูกใช้งานแล้ว');
        }
        return await User.create(userData);
    } catch (error) {
        debug('Error creating user:', error);
        throw error;
    }
};

User.getById = async function(id) {
    try {
        return await User.findByPk(id);
    } catch (error) {
        debug('Error getting user:', error);
        throw error;
    }
};

// ฟังก์ชันตรวจสอบว่าสามารถเปลี่ยน username ได้หรือไม่
User.canChangeUsername = async function(id) {
    try {
        const user = await User.findByPk(id);
        if (!user || !user.lastUsernameChange) return true;
        
        const daysSinceLastChange = Math.floor(
            (Date.now() - user.lastUsernameChange.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysSinceLastChange >= 7;
    } catch (error) {
        debug('Error checking username change eligibility:', error);
        throw error;
    }
};

// แยกฟังก์ชันอัพเดทตามประเภท
User.updateProfileImage = async function(id, imagePath) {
    try {
        const user = await User.findByPk(id);
        if (!user) {
            throw new Error('ไม่พบผู้ใช้งาน');
        }

        return await user.update({
            profileImage: imagePath
        });
    } catch (error) {
        debug('Error updating profile image:', error);
        throw error;
    }
};

User.updateDisplayName = async function(id, newDisplayName) {
    try {
        const user = await User.findByPk(id);
        if (user) {
            return await user.update({ displayName: newDisplayName });
        }
        return null;
    } catch (error) {
        debug('Error updating display name:', error);
        throw error;
    }
};

User.updateUsername = async function(id, newUsername) {
    try {
        const user = await User.findByPk(id);
        if (!user) return null;

        const canChange = await User.canChangeUsername(id);
        if (!canChange) {
            throw new Error('ต้องรอ 7 วันก่อนเปลี่ยน username อีกครั้ง');
        }

        // ตรวจสอบว่า username ใหม่ซ้ำหรือไม่
        const isDuplicate = await User.checkDuplicate(newUsername, user.email);
        if (isDuplicate) {
            throw new Error('Username นี้ถูกใช้งานแล้ว');
        }

        return await user.update({
            username: newUsername,
            lastUsernameChange: new Date()
        });
    } catch (error) {
        debug('Error updating username:', error);
        throw error;
    }
};

User.updateById = async function(id, updateData) {
    try {
        const user = await User.findByPk(id);
        if (!user) return null;

        // ถ้ามีการอัพเดท username ต้องตรวจสอบเงื่อนไขพิเศษ
        if (updateData.username && updateData.username !== user.username) {
            const canChange = await User.canChangeUsername(id);
            if (!canChange) {
                throw new Error('ต้องรอ 7 วันก่อนเปลี่ยน username อีกครั้ง');
            }
            updateData.lastUsernameChange = new Date();
        }

        return await user.update(updateData);
    } catch (error) {
        debug('Error updating user:', error);
        throw error;
    }
};

User.deleteById = async function(id) {
    try {
        const user = await User.findByPk(id);
        if (user) {
            await user.destroy();
            return true;
        }
        return false;
    } catch (error) {
        debug('Error deleting user:', error);
        throw error;
    }
};

module.exports = User;
