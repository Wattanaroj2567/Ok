const nodemailer = require('nodemailer');

// สร้าง transporter สำหรับส่งอีเมล
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // ใช้ SSL/TLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// สร้างฟังก์ชันส่งอีเมล
const sendEmail = async (options) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: options.to,
            subject: options.subject,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        throw new Error('ไม่สามารถส่งอีเมลได้: ' + error.message);
    }
};

module.exports = { sendEmail };