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
    const envOrigins = (process.env.CORS_ORIGINS || '')
      .split(',')
      .map((originItem) => originItem.trim())
      .filter(Boolean);

    const allowedOrigins = [
      ...envOrigins,
      'https://pipersmart-th7q.vercel.app', // Current Vercel deployment
      'https://your-production-domain.com', // Your production frontend
      'https://admin.your-domain.com'       // Your admin panel
    ];

    const allowVercelPreviews = process.env.CORS_ALLOW_VERCEL_PREVIEWS === 'true';
    
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      (allowVercelPreviews && origin.endsWith('.vercel.app'))
    ) {
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

// ========== BODY PARSING ==========
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ========== USER ROUTES ==========
const userRoutes = require('./routes/User');
app.use('/api/v1/users', userRoutes);

// ========== PREDICTION ROUTES ==========
const predictRoutes = require('./routes/Predict');
app.use('/api/v1/predict', predictRoutes);

// ========== MACROMAP ROUTES ==========
const macromapRoutes = require('./routes/Macromap');
app.use('/api/v1/macromap', macromapRoutes);

// ========== FORUM ROUTES ==========
const forumRoutes = require('./routes/Forum');
app.use('/api/v1/forum', forumRoutes);

// ========== DASHBOARD ROUTES ==========
const dashboardRoutes = require('./routes/Dashboard');
app.use('/api/v1/dashboard', dashboardRoutes);

// ========== REPORTS ROUTES ==========
const reportsRoutes = require('./routes/Reports');
app.use('/api/v1/reports', reportsRoutes);

// ========== POST REPORTED ROUTES ==========
const postReportedRoutes = require('./routes/PostReported');
app.use('/api/v1/reports', postReportedRoutes);

// ========== NEWS ROUTES ==========
const newsRoutes = require('./routes/News');
app.use('/api/v1/news', newsRoutes);

// ========== CHAT ROUTES ==========
const chatRoutes = require('./routes/Chat');
app.use('/api/v1', chatRoutes);

// ========== NOTIFICATION ROUTES ==========
const notificationRoutes = require('./routes/Notification');
app.use('/api/v1', notificationRoutes);

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

module.exports = app;
