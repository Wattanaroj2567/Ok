// src/utils/email.js
require('dotenv').config();
const nodemailer = require('nodemailer');
const debug = require('debug')('app:util:email');

let transporter;

// --- 1. ตั้งค่าการเชื่อมต่อ (Transporter Configuration) ---
// ส่วนนี้จะจัดการการเชื่อมต่อกับ Mail Server โดยแยกระหว่างโหมด Dev และ Prod
if (process.env.NODE_ENV === 'development') {
    debug('Email service is in DEVELOPMENT mode. Using Ethereal for testing.');
    nodemailer.createTestAccount((err, account) => {
        if (err) {
            console.error(
                '❌ Failed to create an Ethereal test account. ' + err.message,
            );
            return process.exit(1);
        }
        debug('✅ Ethereal test account created successfully.');
        transporter = nodemailer.createTransport({
            host: account.smtp.host,
            port: account.smtp.port,
            secure: account.smtp.secure,
            auth: { user: account.user, pass: account.pass },
        });
    });
} else {
    debug('Email service is in PRODUCTION mode.');
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
}

// --- 2. ฟังก์ชันหลักสำหรับส่งอีเมล (Core Sender) ---
/**
 * @description ฟังก์ชันระดับล่างสำหรับส่งอีเมล
 * @param {object} options - ตัวเลือกอีเมล { to, subject, html }
 */
const sendEmail = async (options) => {
    // รอจนกว่า transporter จะพร้อมใช้งาน
    await new Promise((resolve) => {
        const check = () => (transporter ? resolve() : setTimeout(check, 100));
        check();
    });

    try {
        const mailOptions = {
            from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
        };
        const info = await transporter.sendMail(mailOptions);
        debug(`Email sent to: ${options.to}, Message ID: ${info.messageId}`);
        if (process.env.NODE_ENV === 'development') {
            console.log(
                '📬 Preview email at: %s',
                nodemailer.getTestMessageUrl(info),
            );
        }
        return info;
    } catch (error) {
        debug('Error sending email:', error);
        throw new Error(`ไม่สามารถส่งอีเมลได้: ${error.message}`);
    }
};

// --- 3. Template สำหรับอีเมล ---
/**
 * @description สร้าง HTML Template สำหรับอีเมลรีเซ็ตรหัสผ่าน
 * @param {string} resetLink - URL สำหรับการรีเซ็ตรหัสผ่าน
 */
const resetPasswordTemplate = (resetLink) => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #333;">รีเซ็ตรหัสผ่าน</h2>
        <p>คุณได้ขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ กรุณาคลิกที่ปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่</p>
        <p style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px;">
               ตั้งรหัสผ่านใหม่
            </a>
        </p>
        <p>หากปุ่มไม่ทำงาน กรุณาคัดลอกและวางลิงก์ต่อไปนี้ในเบราว์เซอร์ของคุณ:</p>
        <p style="word-break: break-all;">${resetLink}</p>
        <hr>
        <p style="font-size: 12px; color: #888;">ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง หากคุณไม่ได้เป็นผู้ร้องขอ กรุณาละเว้นอีเมลนี้</p>
    </div>
    `;
};

// --- 4. ฟังก์ชันช่วยเหลือระดับสูง (High-level Helpers) ---
/**
 * @description ฟังก์ชันสำหรับส่งอีเมลรีเซ็ตรหัสผ่านโดยเฉพาะ
 * @param {string} email - อีเมลผู้รับ
 * @param {string} resetToken - Token สำหรับการรีเซ็ต
 */
const sendPasswordResetEmail = async (email, resetToken) => {
    try {
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        const html = resetPasswordTemplate(resetUrl);

        await sendEmail({
            to: email,
            subject: 'คำขอรีเซ็ตรหัสผ่านสำหรับ Fiction Book Review',
            html,
        });

        return true;
    } catch (error) {
        debug('Send password reset email error:', error);
        // ไม่โยน Error ต่อ เพื่อให้ Service จัดการได้ง่าย
        // แต่จะคืนค่า false เพื่อบ่งบอกว่าการส่งล้มเหลว
        return false;
    }
};

// --- 5. Export ---
// เราจะ export เฉพาะฟังก์ชันระดับสูงที่ส่วนอื่นของโปรแกรมต้องใช้
module.exports = {
    sendPasswordResetEmail,
};
