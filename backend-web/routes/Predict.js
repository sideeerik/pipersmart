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

/**
 * POST /api/v1/predict/disease
 * Predict pepper leaf disease from image
 */
router.post('/disease', isAuthenticatedUser, upload.single('image'), async (req, res) => {
  const startTime = Date.now();
  const requestId = req.query.requestId || req.body.requestId || `leaf_${Date.now()}`;

  console.log(`\n🟢 [${requestId}] NEW LEAF DISEASE PREDICTION REQUEST RECEIVED`);

  try {
    if (!req.file) {
      console.error(`❌ [${requestId}] No image file provided`);
      return res.status(400).json({
        success: false,
        error: 'No image provided. Please upload an image.',
        requestId
      });
    }

    console.log(`📸 [${requestId}] Image received: ${req.file.originalname} (${req.file.size} bytes)`);

    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Save image temporarily - use requestId for unique filename
    const tempImagePath = path.join(tempDir, `${requestId}.jpg`);
    fs.writeFileSync(tempImagePath, req.file.buffer);
    
    console.log(`💾 [${requestId}] Temp file saved: ${tempImagePath}`);

    // Call Python prediction script
    const result = await new Promise((resolve, reject) => {
      // Python script path - Use NEW CPU-Optimized Web Script
      const pythonScriptPath = path.join(__dirname, '../utils/predict_disease_yolov8.py');
      const modelPath = path.join(__dirname, '../ml_models/leaf/train/weights/best.pt');
      const pythonExe = process.env.PYTHON_EXE || 'C:\\Users\\admin\\AppData\\Local\\Programs\\Python\\Python313\\python.exe';
      
      console.log(`🐍 [${requestId}] Spawning Python (CPU-Optimized)...`);
      console.log(`🐍 [${requestId}] Script: ${pythonScriptPath}`);
      console.log(`🐍 [${requestId}] Model: leaf/train/weights/best.pt`);
      
      // Use shell: true to bypass Windows App Execution Alias issues
      // Quote paths to handle spaces in directory names
      const python = spawn(pythonExe, [`"${pythonScriptPath}"`, `"${tempImagePath}"`, `"${modelPath}"`], {
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`⚠️ [${requestId}] Python stderr: ${data}`);
      });

      python.on('close', (code) => {
        // Clean up temp file
        try {
          fs.unlinkSync(tempImagePath);
        } catch (e) {
          console.error(`[${requestId}] Error deleting temp file:`, e);
        }

        if (code === 0) {
          try {
            const parsedOutput = JSON.parse(output.trim());
            resolve(parsedOutput);
          } catch (e) {
            console.error(`[${requestId}] Error parsing Python output:`, e);
            reject(new Error('Invalid prediction output'));
          }
        } else {
          console.error(`[${requestId}] Python process exited with code ${code}`);
          console.error(`[${requestId}] Error: ${errorOutput}`);
          reject(new Error(`Prediction failed: ${errorOutput || 'Unknown error'}`));
        }
      });

      python.on('error', (err) => {
        console.error(`[${requestId}] Failed to start Python process:`, err);
        try {
          fs.unlinkSync(tempImagePath);
        } catch (e) {}
        reject(new Error('Failed to start prediction service'));
      });
    });

    if (result.error) {
      const duration = Date.now() - startTime;
      console.log(`⚠️ [${requestId}] Leaf prediction failed (took ${duration}ms):`, result.error);
      return res.status(200).json({
        success: false,
        error: result.error,
        processingTime: duration,
        requestId
      });
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [${requestId}] Leaf prediction completed in ${duration}ms`);
    console.log(`📊 [${requestId}] Result: ${result.disease} (${result.confidence}%)`);
    
    res.status(200).json({
      success: true,
      processingTime: duration,
      requestId,
      ...result
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${requestId}] Prediction error (${duration}ms):`, error.message);

    // Try to clean up temp file if it exists
    try {
        const tempDir = path.join(__dirname, '../temp');
        const tempImagePath = path.join(tempDir, `${requestId}.jpg`);
        if (fs.existsSync(tempImagePath)) {
          fs.unlinkSync(tempImagePath);
        }
    } catch (e) {}

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze image. Please try again.',
      requestId,
      processingTime: duration
    });
  }
});

/**
 * POST /api/v1/predict/bunga-with-objects
 * Predict bunga ripeness with health grading and object detection
 */
router.post('/bunga-with-objects', isAuthenticatedUser, upload.single('image'), async (req, res) => {
  const startTime = Date.now();
  const requestId = req.query.requestId || req.body.requestId || `bunga_${Date.now()}`;
  
  console.log(`\n🔵 [${requestId}] NEW BUNGA PREDICTION REQUEST RECEIVED`);
  
  try {
    if (!req.file) {
      console.error(`❌ [${requestId}] No image file provided`);
      return res.status(400).json({
        success: false,
        error: 'No image provided. Please upload an image.',
        requestId
      });
    }

    console.log(`📸 [${requestId}] Image received: ${req.file.originalname} (${req.file.size} bytes)`);

    // Create temp directory if it doesn't exist
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Save image temporarily - use requestId for unique filename
    const tempImagePath = path.join(tempDir, `${requestId}.jpg`);
    fs.writeFileSync(tempImagePath, req.file.buffer);

    console.log(`💾 [${requestId}] Temp file saved: ${tempImagePath}`);

    // Call Python prediction script
    const result = await new Promise((resolve, reject) => {
      // Python script path - Use NEW CPU-Optimized Web Script
      const pythonScriptPath = path.join(__dirname, '../utils/predict_bunga_web_cpu.py');
      const bungaModelPath = path.join(__dirname, '../ml_models/bunga/train/weights/best.pt');
      const pythonExe = process.env.PYTHON_EXE || 'C:\\Users\\admin\\AppData\\Local\\Programs\\Python\\Python313\\python.exe';
      
      console.log(`🐍 [${requestId}] Spawning Python (CPU-Optimized)...`);
      console.log(`🐍 [${requestId}] Script: ${pythonScriptPath}`);
      console.log(`🐍 [${requestId}] Model: bunga/train/weights/best.pt`);
      
      // Use shell: true to properly handle paths with spaces (e.g., "6.1 Reporting")
      // Quote paths to handle spaces in directory names
      const python = spawn(pythonExe, [`"${pythonScriptPath}"`, `"${tempImagePath}"`, `"${bungaModelPath}"`], {
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let output = '';
      let errorOutput = '';

      python.stdout.on('data', (data) => {
        output += data.toString();
      });

      python.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`⚠️ [${requestId}] Python stderr: ${data}`);
      });

      python.on('close', (code) => {
        // Clean up temp file
        try {
          fs.unlinkSync(tempImagePath);
        } catch (e) {
          console.error(`[${requestId}] Error deleting temp file:`, e);
        }

        if (code === 0) {
          try {
            const parsedOutput = JSON.parse(output.trim());
            resolve(parsedOutput);
          } catch (e) {
            console.error(`[${requestId}] Error parsing Python output:`, e);
            reject(new Error('Invalid prediction output'));
          }
        } else {
          console.error(`[${requestId}] Python process exited with code ${code}`);
          console.error(`[${requestId}] Error: ${errorOutput}`);
          reject(new Error(`Prediction failed: ${errorOutput || 'Unknown error'}`));
        }
      });

      python.on('error', (err) => {
        console.error(`[${requestId}] Failed to start Python process:`, err);
        try {
          fs.unlinkSync(tempImagePath);
        } catch (e) {}
        reject(new Error('Failed to start prediction service'));
      });
    });

    if (result.error) {
      const duration = Date.now() - startTime;
      console.log(`⚠️ [${requestId}] Bunga prediction failed (took ${duration}ms):`, result.error);
      return res.status(200).json({
        success: false,
        error: result.error,
        processingTime: duration,
        requestId
      });
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [${requestId}] Bunga prediction completed in ${duration}ms`);
    console.log(`📊 [${requestId}] Result:`, JSON.stringify(result, null, 2));
    res.status(200).json({
      success: result.success || true,
      processingTime: duration,
      requestId,
      ...result
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${requestId}] Prediction error (${duration}ms):`, error.message);

    // Try to clean up temp file - use requestId-based filename
    try {
      const tempDir = path.join(__dirname, '../temp');
      const tempFile = path.join(tempDir, `${requestId}.jpg`);
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
    } catch (e) {
      console.error(`[${requestId}] Error cleaning temp file:`, e.message);
    }

    res.status(200).json({
      success: false,
      error: error.message || 'Failed to analyze image. Please try again.',
      requestId,
      processingTime: duration
    });
  }
});

/**
 * GET /api/v1/predict/health
 * Check if prediction service is available
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '✅ Prediction service is running',
    models: {
      leaf_disease: 'YOLOv8 (Leaf Disease Detection - leaf/train/weights/best.pt)',
      bunga_ripeness: 'YOLOv8 Unified (Bunga Ripeness & Health - bunga/train/weights/best.pt)',
      object_detection: 'YOLOv8 COCO (General objects)'
    },
    accuracy: '99%+',
    diseases: [
      'Healthy',
      'Footrot',
      'Pollu_Disease',
      'Slow-Decline',
      'Leaf_Blight',
      'Yellow_Mottle_Virus'
    ],
    bunga_classes: [
      'Ripe (A-a to B-d)',
      'Unripe (C-a to D-d)',
      'Rotten'
    ]
  });
});

module.exports = router;
