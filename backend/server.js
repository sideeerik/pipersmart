const dotenv = require('dotenv');
const path = require('path');

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

// Now import other modules AFTER environment variables are loaded
const app = require('./app');
const connectDatabase = require('./config/db');

connectDatabase();

// Start server with increased timeout for long ML inference tasks
const server = app.listen(process.env.PORT, () => {
  console.log(`Server started on port: ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
});

// Set server timeout to 2 minutes (120000ms) to allow time for Python ML model inference
server.setTimeout(120000);
server.keepAliveTimeout = 65000;