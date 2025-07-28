// โหลดตัวแปรจากไฟล์ .env มาใช้งาน
require('dotenv').config();
const { Sequelize } = require('sequelize');

// สร้าง instance ของ Sequelize โดยใช้ข้อมูลจาก Environment Variables
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        // แนะนำ: เปิด SQL logging เฉพาะในโหมด development เพื่อช่วยในการดีบัก
        // ในโหมด production จะไม่แสดง log เพื่อประสิทธิภาพที่ดีกว่า
        logging: process.env.NODE_ENV === 'development' ? console.log : false,

        // แนะนำ: กำหนด timezone เพื่อให้เวลาที่บันทึกลงฐานข้อมูลถูกต้องตามโซนเวลาของประเทศไทย
        timezone: '+07:00',
    },
);

// Export instance ที่สร้างขึ้นเพื่อนำไปใช้ในส่วนอื่นๆ ของโปรเจกต์
module.exports = sequelize;
