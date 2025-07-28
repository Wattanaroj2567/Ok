// src/config/database.js
require('dotenv').config();
const debug = require('debug')('app:config:db');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        dialect: 'mysql',
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
        logging: false,
    },
);

// ทดสอบเชื่อมต่อ
sequelize
    .authenticate()
    .then(() => debug('✅ Database connected'))
    .catch((err) => debug('❌ DB connection error:', err));

module.exports = sequelize;

// ทดสอบเชื่อมต่อและ sync models
async function initDatabase() {
    try {
        // ทดสอบการเชื่อมต่อ
        await sequelize.authenticate();
        debug('✅ Database connected');

        // Sync all models
        await sequelize.sync({ alter: true });
        debug('✅ Models synchronized');

        // Seed ข้อมูลหนังสือตัวอย่าง
        await seedSampleBooks();
    } catch (error) {
        debug('❌ Database initialization error:', error);
        process.exit(1);
    }
}

// ฟังก์ชัน seed ข้อมูลหนังสือตัวอย่าง
async function seedSampleBooks() {
    try {
        const Book = require('@/models/Book');

        // ตรวจสอบว่ามีข้อมูลหนังสืออยู่แล้วหรือไม่
        const bookCount = await Book.count();
        if (bookCount > 0) {
            debug('📚 Books already exist, skipping seed');
            return;
        }

        const sampleBooks = [
            {
                title: "Harry Potter and the Sorcerer's Stone",
                author: 'J.K. Rowling',
                description:
                    'เรื่องราวของพ่อมดน้อยแฮร์รี่ พอตเตอร์ที่ค้นพบโลกแห่งเวทมนตร์',
                coverImage: 'harry-potter-1.jpg',
            },
            {
                title: 'The Lord of the Rings',
                author: 'J.R.R. Tolkien',
                description:
                    'การผจญภัยในดินแดนมิดเดิลเอิร์ธเพื่อทำลายแหวนแห่งอำนาจ',
                coverImage: 'lotr.jpg',
            },
            {
                title: 'The Hobbit',
                author: 'J.R.R. Tolkien',
                description: 'การเดินทางของบิลโบ แบ๊กกิ้นส์ไปกับคนแคระ 13 คน',
                coverImage: 'hobbit.jpg',
            },
            {
                title: 'The Chronicles of Narnia',
                author: 'C.S. Lewis',
                description: 'การผจญภัยของเด็กๆ ในดินแดนนาร์เนีย',
                coverImage: 'narnia.jpg',
            },
            {
                title: 'The Hunger Games',
                author: 'Suzanne Collins',
                description: 'เกมแห่งความอยู่รอดในโลกอนาคต',
                coverImage: 'hunger-games.jpg',
            },
        ];

        for (const book of sampleBooks) {
            await Book.create(book);
        }

        debug('✅ Sample books seeded successfully');
    } catch (error) {
        debug('❌ Error seeding books:', error);
    }
}

// เรียกใช้ฟังก์ชันเมื่อเริ่มต้นแอพ
initDatabase();
