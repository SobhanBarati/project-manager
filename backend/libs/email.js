import nodemailer from 'nodemailer';
import 'dotenv/config';

// تنظیمات ارسال‌کننده Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

// ✅ تابع اصلی با پارامتر type
export const sendVerificationEmail = async (to, token, type = 'verify') => {
    let link, subject, htmlContent;

    if (type === 'reset') {
        // ✅ لینک ریست پسورد
        link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        subject = 'Reset Your Password - TaskHub';
        htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
                    .header { background: #E25A4A; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
                    .header h1 { color: white; margin: 0; }
                    .content { padding: 20px; }
                    .button { display: inline-block; padding: 12px 24px; background: #E25A4A; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; border-top: 1px solid #ddd; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔑 TaskHub</h1>
                    </div>
                    <div class="content">
                        <h2>Reset Your Password</h2>
                        <p>Hi there,</p>
                        <p>We received a request to reset your password. Click the button below to create a new password:</p>
                        <div style="text-align: center;">
                            <a href="${link}" class="button">Reset Password</a>
                        </div>
                        <p style="color: #888; font-size: 14px;">This link will expire in 15 minutes.</p>
                        <p style="color: #888; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 TaskHub. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    } else {
        // ✅ لینک تایید ایمیل (پیش‌فرض)
        link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        subject = 'Verify Your Email - TaskHub';
        htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
                    .header { background: #4A90E2; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
                    .header h1 { color: white; margin: 0; }
                    .content { padding: 20px; }
                    .button { display: inline-block; padding: 12px 24px; background: #4A90E2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; border-top: 1px solid #ddd; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚀 TaskHub</h1>
                    </div>
                    <div class="content">
                        <h2>Verify Your Email Address</h2>
                        <p>Hi there,</p>
                        <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
                        <div style="text-align: center;">
                            <a href="${link}" class="button">Verify Email Address</a>
                        </div>
                        <p style="color: #888; font-size: 14px;">This link will expire in 1 hour.</p>
                        <p style="color: #888; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 TaskHub. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    try {
        await transporter.sendMail({
            from: `"TaskHub" <${process.env.GMAIL_USER}>`,
            to: to,
            subject: subject,
            html: htmlContent,
        });

        console.log(`✅ ${subject} sent to ${to}`);
        return true;

    } catch (error) {
        console.error('❌ Email error:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

// ✅ تابع ارسال ایمیل عمومی
export const sendEmail = async (to, subject, htmlContent) => {
    try {
        await transporter.sendMail({
            from: `"TaskHub" <${process.env.GMAIL_USER}>`,
            to: to,
            subject: subject,
            html: htmlContent,
        });

        console.log(`✅ Email sent to ${to}`);
        return true;

    } catch (error) {
        console.error('❌ Email error:', error);
        return false;
    }
};

// ✅ تابع تست اتصال
export const testEmailConnection = async () => {
    try {
        await transporter.verify();
        console.log('✅ Email transporter is ready');
        return true;
    } catch (error) {
        console.error('❌ Email transporter error:', error);
        return false;
    }
};