const dotenv = require('dotenv');

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

app.listen(process.env.PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ WEB BACKEND SERVER STARTED`);
  console.log(`${'='.repeat(60)}`);
  console.log(`🌐 Port: ${process.env.PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 URL: http://localhost:${process.env.PORT}`);
  console.log(`✓ Frontend: http://localhost:5173`);
  console.log(`${'='.repeat(60)}\n`);
});