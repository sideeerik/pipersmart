const dotenv = require('dotenv');
const { spawn } = require('child_process');
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

// --- START PYTHON INFERENCE SERVER ---
const startPythonServer = () => {
  const pythonScript = path.join(__dirname, 'utils/inference_server.py');
  const pythonExe = process.env.PYTHON_EXE || 'python'; // Use environment variable or default
  
  console.log(`🚀 Starting Python Inference Server...`);
  console.log(`   Script: ${pythonScript}`);
  
  // Use spawn with shell: true and quote paths to handle spaces
  const pythonProcess = spawn(pythonExe, [`"${pythonScript}"`], {
    stdio: 'inherit', // Pipe output to main console
    shell: true       // Use shell to resolve python command
  });
  
  pythonProcess.on('error', (err) => {
    console.error('❌ Failed to start Python server:', err);
  });
  
  // Ensure Python process is killed when Node exits
  const cleanup = () => {
    console.log('🛑 Stopping Python Server...');
    pythonProcess.kill();
  };
  
  const handleSignal = () => {
    cleanup();
    process.exit();
  };
  
  process.on('SIGINT', handleSignal);
  process.on('SIGTERM', handleSignal);
  process.on('exit', cleanup);
  
  return pythonProcess;
};

// Start the Python server in the background
// We don't await it because it runs indefinitely
startPythonServer();

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