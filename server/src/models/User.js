const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
    class User extends Model {
        static associate(models) {
            // User มีได้หลาย Review
            this.hasMany(models.Review, {
                foreignKey: 'userId',
                as: 'reviews',
                onDelete: 'CASCADE',
            });
        }
    }

    User.init(
        {
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            displayName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            profileImage: {
                type: DataTypes.STRING,
                defaultValue: '/uploads/profiles/default-avatar.png',
            },
            resetToken: DataTypes.STRING,
            resetTokenExpiry: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: 'User',
            timestamps: true,
            hooks: {
                // Hook นี้จะทำงานก่อนที่ข้อมูล User ใหม่จะถูกสร้าง
                // เราไม่จำเป็นต้องเรียกใช้ bcrypt.hash ใน service อีก
                // แต่เพื่อความสอดคล้อง การมีไว้ใน service ก็ไม่ผิด
                // การเก็บไว้ที่นี่ทำให้มั่นใจว่ารหัสผ่านจะถูก hash เสมอไม่ว่าจะสร้างจากที่ไหน
                beforeCreate: async (user) => {
                    if (user.password) {
                        const salt = await bcrypt.genSalt(10);
                        user.password = await bcrypt.hash(user.password, salt);
                    }
                },
            },
        },
    );

    return User;
};
