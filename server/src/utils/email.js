const debug = require('debug')('app:utils:email');
const { sendEmail } = require('@/config/email');

// Email Templates
const resetPasswordTemplate = (resetLink) => {
    return `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>รีเซ็ตรหัสผ่าน</h2>
        <p>คุณได้ขอรีเซ็ตรหัสผ่าน กรุณาคลิกที่ลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่</p>
        <p style="margin: 20px 0;">
            <a href="${resetLink}" 
               style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
               รีเซ็ตรหัสผ่าน
            </a>
        </p>
        <p>ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง</p>
        <p>ถ้าคุณไม่ได้ขอรีเซ็ตรหัสผ่าน กรุณาละเว้นอีเมลนี้</p>
    </div>
    `;
};

// ส่งอีเมลรีเซ็ตรหัสผ่าน
const sendPasswordResetEmail = async (email, resetToken) => {
    try {
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        const html = resetPasswordTemplate(resetUrl);
        const subject = 'รีเซ็ตรหัสผ่าน Fiction Book Review';

        await sendEmail({
            to: email,
            subject,
            html,
        });

        return true;
    } catch (error) {
        debug('Send email error:', error);
        throw error;
    }
};

module.exports = {
    sendPasswordResetEmail,
    resetPasswordTemplate,
};
