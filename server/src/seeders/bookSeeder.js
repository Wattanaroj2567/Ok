const Book = require('@/models/Book');

const sampleBooks = [
    {
        title: "Harry Potter and the Sorcerer's Stone",
        author: 'J.K. Rowling',
        description: 'เรื่องราวของพ่อมดน้อยแฮร์รี่ พอตเตอร์',
        coverImage: 'harry-potter-1.jpg',
    },
    {
        title: 'The Lord of the Rings',
        author: 'J.R.R. Tolkien',
        description: 'การผจญภัยในดินแดนมิดเดิลเอิร์ธ',
        coverImage: 'lotr.jpg',
    },
    // เพิ่มหนังสืออื่นๆ ตามต้องการ
];

async function seedBooks() {
    try {
        for (const book of sampleBooks) {
            await Book.create(book);
        }
        console.log('เพิ่มข้อมูลหนังสือตัวอย่างสำเร็จ');
    } catch (error) {
        console.error('Error seeding books:', error);
    }
}

module.exports = seedBooks;
