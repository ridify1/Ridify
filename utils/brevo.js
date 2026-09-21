const { BrevoClient } = require('@getbrevo/brevo');
require('dotenv').config();

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY
});

exports.sendBrevoEmail = async (options) => {
    try {
        const result = await brevo.transactionalEmails.sendTransacEmail({
            subject: options.subject,
            htmlContent: options.html,
            sender: {
                name: process.env.BREVO_SENDER_NAME || 'Ridify',
                email: process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER
            },
            family: 4,
            to: [{ email: options.email }]
        });

        console.log(`Email sent successfully to ${options.email}`, result.messageId);
        return result;
    } catch (error) {
        console.log(`Brevo failed for ${options.email}:`, error.message);
        throw error;
    }
};

