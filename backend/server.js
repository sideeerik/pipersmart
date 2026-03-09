const dotenv = require('dotenv');
const path = require('path');

// Global model cache (Option 2: Model Caching)
global.modelCache = {
  bungaModel: null,
  leafModel: null,
  initialized: false
};

// Load environment variables FIRST, before any other imports
const result = dotenv.config({ path: './config/.env' });

if (result.error) {
  console.log('❌ Error loading .env from ./config/.env, trying .env in current directory');
  dotenv.config({ path: '.env' });
}

console.log('✅ Environment variables loaded:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ Missing');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Missing');
console.log('DB_URI:', process.env.DB_URI ? '✓ Set' : '✗ Missing - THIS WILL CAUSE STARTUP FAILURE');

const preferredMailProvider = (process.env.MAIL_PROVIDER || '').trim().toLowerCase();
const usingResend = preferredMailProvider === 'smtp' ? false : Boolean(process.env.RESEND_API_KEY);
const activeMailHost = usingResend ? 'api.resend.com' : process.env.GMAIL_HOST || process.env.SMTP_HOST;
const activeMailPort = usingResend ? 'https' : process.env.GMAIL_PORT || process.env.SMTP_PORT || 587;
const hasGmailKeys = Boolean(
  process.env.GMAIL_HOST &&
  process.env.GMAIL_USER &&
  process.env.GMAIL_PASS &&
  process.env.GMAIL_FROM_EMAIL
);
const hasResendKeys = Boolean(
  process.env.RESEND_API_KEY &&
  (process.env.EMAIL_FROM || process.env.RESEND_FROM_EMAIL || process.env.GMAIL_FROM_EMAIL)
);

console.log('MAIL CONFIG:', {
  provider: usingResend ? 'resend' : process.env.GMAIL_HOST ? 'gmail-smtp' : process.env.SMTP_HOST ? 'smtp' : 'missing',
  preferredProvider: preferredMailProvider || 'auto',
  host: activeMailHost || 'missing',
  port: activeMailPort,
  resendConfigured: hasResendKeys,
  gmailKeysDetected: hasGmailKeys,
  gmailUserSet: Boolean(process.env.GMAIL_USER),
  gmailPassSet: Boolean(process.env.GMAIL_PASS),
  gmailFromEmailSet: Boolean(process.env.GMAIL_FROM_EMAIL),
});

// Now import other modules AFTER environment variables are loaded
const app = require('./app');
const connectDatabase = require('./config/db');

// Start server with proper error handling
const startServer = async () => {
  try {
    console.log('🚀 Starting server...');
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔌 Port: ${process.env.PORT || 4001}`);
    
    // Connect to database FIRST with timeout
    console.log('⏱️  Connecting to database (max 30 seconds)...');
    const dbTimeout = setTimeout(() => {
      console.error('⏰ Database connection timeout - taking too long');
    }, 30000);

    await connectDatabase();
    clearTimeout(dbTimeout);
    console.log('✅ Database connected successfully');
    
    // Initialize model cache at startup
    console.log('🤖 Initializing model cache...');
    global.modelCache.initialized = true;
    console.log('✅ Model cache initialized (models will be loaded on first use and cached)');
    
    // Then start the Express server
    const server = app.listen(process.env.PORT || 4001, () => {
      console.log(`✅ Express server is listening on port: ${process.env.PORT || 4001}`);
      console.log('🎉 Server fully started and ready for requests!');
    });

    // Set server timeout to 2 minutes (120000ms) to allow time for Python ML model inference
    server.setTimeout(120000);
    server.keepAliveTimeout = 65000;

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, closing server gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 SIGINT received, closing server gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
