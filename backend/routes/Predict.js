const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { isAuthenticatedUser } = require('../middlewares/auth');

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG images are allowed'));
    }
  }
});

// Routes are defined below using controllers


/**
 * POST /api/v1/predict/bunga-ripeness
 * Predict black pepper bunga ripeness from image
 */
router.post('/bunga-ripeness', isAuthenticatedUser, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image provided. Please upload an image.'
      });
    }

    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Save image temporarily
    const tempImagePath = path.join(tempDir, `temp_${Date.now()}_${req.file.originalname}`);
    fs.writeFileSync(tempImagePath, req.file.buffer);

    console.log(`📸 Processing bunga image: ${tempImagePath}`);

    // Call Python prediction script (ensemble v1 + v2)
    const result = await new Promise((resolve, reject) => {
      // Python script path - Use ensemble model (v1 + v2)
      const pythonScriptPath = path.join(__dirname, '../utils/predict_bunga_ripeness_ensemble.py');
      const pythonExe = 'C:\\Users\\admin\\AppData\\Local\\Programs\\Python\\Python313\\python.exe';
      
      // Use spawn without shell: true - Node.js handles paths with spaces correctly
      const python = spawn(pythonExe, [pythonScriptPath, tempImagePath], {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`⚠️ Python stderr: ${data}`);
      });

      python.on('close', (code) => {
        // Clean up temp file
        try {
          fs.unlinkSync(tempImagePath);
        } catch (e) {
          console.error('Error deleting temp file:', e);
        }

        if (code === 0) {
          try {
            // Extract JSON from output (skip any non-JSON lines like TensorFlow warnings)
            const lines = output.trim().split('\n');
            let jsonLine = '';
            for (let line of lines) {
              line = line.trim();
              if (line.startsWith('{')) {
                jsonLine = line;
                break;
              }
            }
            
            if (!jsonLine) {
              throw new Error('No JSON output found from Python script');
            }
            
            const parsedOutput = JSON.parse(jsonLine);
            resolve(parsedOutput);
          } catch (e) {
            console.error('Error parsing Python output:', e);
            reject(new Error('Invalid prediction output'));
          }
        } else {
          console.error(`Python process exited with code ${code}`);
          console.error(`Error: ${errorOutput}`);
          reject(new Error(`Prediction failed: ${errorOutput || 'Unknown error'}`));
        }
      });

      python.on('error', (err) => {
        console.error('Failed to start Python process:', err);
        try {
          fs.unlinkSync(tempImagePath);
        } catch (e) {}
        reject(new Error('Failed to start prediction service'));
      });
    });

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    console.log(`✅ Bunga ripeness prediction - Result: ${result.ripeness}, Confidence: ${result.confidence}%`);
    res.status(200).json({
      ...result
    });

  } catch (error) {
    console.error('❌ Bunga ripeness prediction error:', error);

    // Try to clean up temp file if it exists
    if (req.file) {
      try {
        const tempDir = path.join(__dirname, '../temp');
        const files = fs.readdirSync(tempDir);
        files.forEach(file => {
          if (file.startsWith('temp_')) {
            fs.unlinkSync(path.join(tempDir, file));
          }
        });
      } catch (e) {}
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze bunga. Please try again.'
    });
  }
});

const { analyzeBunga, getHistory } = require('../controllers/bungaController');
const { analyzeLeaf, getLeafHistory } = require('../controllers/leafController');

// ... existing code ...

/**
 * POST /api/v1/predict/disease
 * Predict pepper leaf disease from image
 */
router.post('/disease', isAuthenticatedUser, upload.single('image'), analyzeLeaf);

/**
 * GET /api/v1/predict/leaf-history
 * Get user's past leaf scans
 */
router.get('/leaf-history', isAuthenticatedUser, getLeafHistory);

/**
 * POST /api/v1/predict/bunga-with-objects
 * Predict bunga with UNIFIED model (Ripe/Unripe + Health A/B/C/D)
 * Optimized for SPEED - single model inference
 */
router.post('/bunga-with-objects', isAuthenticatedUser, upload.single('image'), analyzeBunga);

/**
 * GET /api/v1/predict/bunga-history
 * Get user's past bunga scans
 */
router.get('/bunga-history', isAuthenticatedUser, getHistory);

/**
 * GET /api/v1/predict/health
 * Check if prediction service is available
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '✅ Disease prediction service is running',
    disease_model: 'YOLOv8 (Leaf Disease Detection - leaf/train/weights/best.pt)',
    bunga_model: 'YOLOv8 Unified (Single Model - Ripe/Unripe + A/B/C/D Health)',
    object_detection: 'YOLOv8 + COCO (all objects)',
    accuracy: '99.22%',
    classes: [
      'Healthy',
      'Footrot',
      'Pollu_Disease',
      'Slow-Decline',
      'Leaf_Blight',
      'Yellow_Mottle_Virus'
    ],
    bunga_classes: [
      'Ripe Class A',
      'Ripe Class B',
      'Ripe Class C',
      'Ripe Class D',
      'Unripe Class A',
      'Unripe Class B',
      'Unripe Class C',
      'Unripe Class D'
    ]
  });
});

module.exports = router;
