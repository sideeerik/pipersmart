const axios = require('axios');
const nodemailer = require('nodemailer');

const parseBool = (value, fallback = false) => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
};

const getMailProvider = () => (process.env.MAIL_PROVIDER || '').trim().toLowerCase();

const getResendConfig = () => {
  if (getMailProvider() === 'smtp') return null;

  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    (
      process.env.GMAIL_FROM_EMAIL
        ? `${process.env.GMAIL_FROM_NAME || process.env.APP_NAME || 'PiperSmart'} <${process.env.GMAIL_FROM_EMAIL}>`
        : null
    );

  if (!apiKey || !from) return null;

  return {
    apiKey,
    from,
    replyTo: process.env.EMAIL_REPLY_TO || process.env.GMAIL_FROM_EMAIL || undefined,
  };
};

const getSmtpConfig = () => {
  const host = process.env.GMAIL_HOST || process.env.SMTP_HOST;
  const port = Number(process.env.GMAIL_PORT || process.env.SMTP_PORT || 587);
  const user = process.env.GMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.GMAIL_PASS || process.env.SMTP_PASS;
  const fromEmail = process.env.GMAIL_FROM_EMAIL || process.env.SMTP_FROM_EMAIL;
  const fromName =
    process.env.GMAIL_FROM_NAME ||
    process.env.SMTP_FROM_NAME ||
    process.env.APP_NAME ||
    'PiperSmart';

  const missing = [];
  if (!host) missing.push('SMTP_HOST/GMAIL_HOST');
  if (!user) missing.push('SMTP_USER/GMAIL_USER');
  if (!pass) missing.push('SMTP_PASS/GMAIL_PASS');
  if (!fromEmail) missing.push('SMTP_FROM_EMAIL/GMAIL_FROM_EMAIL');

  if (missing.length > 0) {
    throw new Error(`Missing email configuration: ${missing.join(', ')}`);
  }

  const secure = parseBool(process.env.SMTP_SECURE, port === 465);

  return {
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 15000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 20000),
    tls: {
      servername: host,
    },
    fromEmail,
    fromName,
  };
};

const sendWithResend = async (options, config) => {
  const payload = {
    from: config.from,
    to: [options.email],
    subject: options.subject,
    html: options.message,
  };

  if (config.replyTo) {
    payload.reply_to = config.replyTo;
  }

  if (options.attachments && Array.isArray(options.attachments) && options.attachments.length > 0) {
    payload.attachments = options.attachments.map((attachment) => ({
      filename: attachment.filename,
      content: attachment.content,
      type: attachment.contentType,
    }));
  }

  await axios.post('https://api.resend.com/emails', payload, {
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    timeout: Number(process.env.RESEND_TIMEOUT || 15000),
  });
};

const sendWithSmtp = async (options, config) => {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
    connectionTimeout: config.connectionTimeout,
    greetingTimeout: config.greetingTimeout,
    socketTimeout: config.socketTimeout,
    tls: config.tls,
  });

  const mailOptions = {
    from: `"${config.fromName}" <${config.fromEmail}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  if (options.attachments && Array.isArray(options.attachments)) {
    mailOptions.attachments = options.attachments;
  }

  await transporter.sendMail(mailOptions);
};

const sendEmail = async (options) => {
  const resendConfig = getResendConfig();
  const provider = resendConfig ? 'resend' : 'smtp';

  try {
    if (resendConfig) {
      await sendWithResend(options, resendConfig);
      console.log(`Email sent via Resend to: ${options.email}`);
      return;
    }

    const smtpConfig = getSmtpConfig();
    await sendWithSmtp(options, smtpConfig);
    console.log(`Email sent via SMTP to: ${options.email}`);
  } catch (error) {
    console.error('EMAIL SEND ERROR:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response?.data || error.response,
      provider,
      host: resendConfig ? 'api.resend.com' : process.env.GMAIL_HOST || process.env.SMTP_HOST,
      port: resendConfig ? 'https' : process.env.GMAIL_PORT || process.env.SMTP_PORT || 587,
    });
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

module.exports = sendEmail;
