// backend/utils/Mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.GMAIL_HOST,
  port: process.env.GMAIL_PORT,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

/**
 * Send an email with optional attachments
 * @param {Object} options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - HTML message
 * @param {Array} options.attachments - Optional array of attachments [{ filename, content, encoding, contentType }]
 */
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `"${process.env.GMAIL_FROM_NAME}" <${process.env.GMAIL_FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      html: options.message,
    };

    // Attach files if provided
    if (options.attachments && Array.isArray(options.attachments)) {
      mailOptions.attachments = options.attachments;
    }

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to: ${options.email}`);
  } catch (error) {
    console.error("❌ EMAIL SEND ERROR:\n", error);
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

module.exports = sendEmail;