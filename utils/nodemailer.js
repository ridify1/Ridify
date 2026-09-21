const nodemailer = require('nodemailer');
require('dotenv').config();

const smtpUser = process.env.SMTP_USER;
const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: true,
    service: 'gmail',
    auth: {
        user: smtpUser,
        pass: smtpPass,
    },
});

const sendMail = async (options) => {
    try {
        const info = await transporter.sendMail({
            from: `"Ridify" <${smtpUser}>`,
            to: options.email,
            subject: options.subject,
            html: options.html,
        });
        console.log('Message sent:', info.messageId);
        return info;
    } catch (error) {
        console.log('Error while sending mail:', error.message);
        throw error;
    }
};

module.exports = sendMail;