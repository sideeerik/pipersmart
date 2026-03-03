const express = require('express');
const cors = require('cors');

const app = express();

// ========== DYNAMIC CORS CONFIGURATION ==========
const corsOptions = {
  origin: function (origin, callback) {
    // Development: Allow web frontend and mobile
    if (process.env.NODE_ENV !== 'production') {
      // Allow localhost for web frontend development
      const allowedDevOrigins = [
        'http://localhost:5173',   // Vite web frontend
        'http://localhost:3000',   // Alternative web port
        'http://localhost:8080',   // Alternative web port
        'http://192.168.43.204:5173',  // Local network web
      ];
      
      // Allow undefined origin (mobile apps, Postman, etc.)
      if (!origin || allowedDevOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      console.warn('⚠️ CORS request from:', origin);
      return callback(null, true); // Still allow in development
    }
    
    // Production: Only allow specific origins
    const allowedOrigins = [
      'https://your-production-domain.com', // Your production frontend
      'https://admin.your-domain.com'       // Your admin panel
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Length', 'Authorization'],
  maxAge: 86400,
};

app.use(cors(corsOptions));

// ========== REQUEST LOGGING MIDDLEWARE ==========
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`\n📨 [${timestamp}] ${method} ${url}`);
  console.log(`   IP: ${ip}`);
  
  if (Object.keys(req.query).length > 0) {
    console.log(`   Query: ${JSON.stringify(req.query)}`);
  }
  
  if (req.headers.authorization) {
    console.log(`   Auth: ${req.headers.authorization.substring(0, 20)}...`);
  }
  
  // Log response
  const originalSend = res.send;
  res.send = function(data) {
    const statusCode = res.statusCode;
    const statusColor = statusCode >= 400 ? '❌' : statusCode >= 300 ? '⚠️' : '✅';
    console.log(`   ${statusColor} Response: ${statusCode}`);
    res.send = originalSend;
    return res.send(data);
  };
  
  next();
});

// ========== BODY PARSING ==========
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ========== USER ROUTES ==========
const userRoutes = require('./routes/User');
app.use('/api/v1/users', userRoutes);

// ========== PREDICTION ROUTES ==========
const predictRoutes = require('./routes/Predict');
app.use('/api/v1/predict', predictRoutes);

// ========== FORUM ROUTES ==========
const forumRoutes = require('./routes/Forum');
app.use('/api/v1/forum', forumRoutes);

// ========== CHAT ROUTES ==========
const chatRoutes = require('./routes/Chat');
app.use('/api/v1', chatRoutes);

// ========== NOTIFICATION ROUTES ==========
const notificationRoutes = require('./routes/Notification');
app.use('/api/v1', notificationRoutes);

// ========== REPORTS ROUTES ==========
const reportsRoutes = require('./routes/Reports');
app.use('/api/v1/reports', reportsRoutes);

// ========== POST REPORTED ROUTES ==========
const postReportedRoutes = require('./routes/PostReported');
app.use('/api/v1/reports', postReportedRoutes);

// ========== DASHBOARD ROUTES ==========
const dashboardRoutes = require('./routes/Dashboard');
app.use('/api/v1/dashboard', dashboardRoutes);

// ========== HEALTH CHECK ==========
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '✅ WEB Backend server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    backendType: 'WEB (Port 5000)',
    clientOrigin: req.headers.origin || 'No origin (likely mobile app)',
    clientIP: req.ip
  });
});

// ========== 404 HANDLER ==========
app.use((req, res) => {
  console.log(`\n❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: '❌ Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// ========== GLOBAL ERROR HANDLER ==========
app.use((err, req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.error(`\n❌ [${timestamp}] ERROR:`);
  console.error(`   Route: ${req.method} ${req.originalUrl}`);
  console.error(`   Message: ${err.message}`);
  console.error(`   Status: ${err.status || 500}`);
  if (err.stack) {
    const stackLines = err.stack.split('\n').slice(0, 5);
    console.error(`   Stack:\n${stackLines.map(line => `     ${line}`).join('\n')}`);
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {},
    timestamp: new Date().toISOString()
  });
});

module.exports = app;