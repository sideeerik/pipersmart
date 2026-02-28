const LeafAnalysis = require('../models/LeafAnalysis');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { uploadToCloudinary } = require('../utils/Cloudinary');
const axios = require('axios');

/**
 * Analyze Leaf Image
 * - Runs Python script
 * - Uploads to Cloudinary
 * - Saves to DB
 */
exports.analyzeLeaf = async (req, res) => {
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

    // 1. Save Temp File
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempImagePath = path.join(tempDir, `${requestId}.jpg`);
    fs.writeFileSync(tempImagePath, req.file.buffer);
    
    console.log(`💾 [${requestId}] Temp file saved: ${tempImagePath}`);

    // 2. Run Python Prediction Script
    let result = null;
    
    // ATTEMPT 1: Try Fast Python Service (localhost:5000)
    try {
        console.log(`⚡ [${requestId}] Attempting fast inference via Python Service...`);
        const response = await axios.post('http://localhost:5000/predict/leaf', {
            file_path: tempImagePath
        }, { timeout: 10000 }); // 10s timeout
        
        if (response.data && response.data.success) {
            result = response.data;
            console.log(`✅ [${requestId}] Fast inference success! (${result.server_processing_time_ms}ms)`);
        }
    } catch (serviceError) {
        console.log(`⚠️ [${requestId}] Fast inference failed/unavailable (${serviceError.message}). Falling back to CLI script...`);
    }

    // ATTEMPT 2: Fallback to slow CLI script if service failed
    if (!result) {
        result = await new Promise((resolve, reject) => {
          // Python script path
          const pythonScriptPath = path.join(__dirname, '../utils/predict_disease_yolov8.py');
          const modelPath = path.join(__dirname, '../ml_models/leaf/train/weights/best.pt');
          const pythonExe = process.env.PYTHON_EXE || 'python';
          
          console.log(`🐍 [${requestId}] Spawning Python CLI (CPU-Optimized)...`);
          
          // Use spawn without shell: true - Node.js handles paths with spaces correctly
          const python = spawn(pythonExe, [pythonScriptPath, tempImagePath, modelPath], {
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
            // Clean up temp file (local) - ONLY if fast service didn't handle it
            // Actually we should keep it until end of request for Cloudinary upload
            
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
            reject(new Error('Failed to start prediction service'));
          });
        });
    }

    // Clean up temp file (local)
    // We do this AFTER getting result (either way) but BEFORE uploading?
    // Wait, we need the file for Cloudinary!
    // So we delete it at the very end.

    if (result.error) {
      const duration = Date.now() - startTime;
      console.log(`⚠️ [${requestId}] Leaf prediction failed (took ${duration}ms):`, result.error);
      
      // Cleanup
      try { if (fs.existsSync(tempImagePath)) fs.unlinkSync(tempImagePath); } catch(e) {}
      
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

    // 3. If Valid Detection, Upload to Cloudinary & Save to DB
    let savedAnalysis = null;
    if (result.success && result.disease) {
      try {
        console.log(`☁️ [${requestId}] Uploading evidence to Cloudinary...`);
        
        // Convert buffer to base64 data URI
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        
        const uploadResult = await uploadToCloudinary(dataURI, 'pipersmart/leaf_scans');

        // Save to DB
        savedAnalysis = await LeafAnalysis.create({
          user: req.user._id,
          image: {
            public_id: uploadResult.public_id,
            url: uploadResult.url
          },
          results: {
            disease: result.disease,
            confidence: result.confidence,
            detections: result.detections || []
          },
          processingTime: duration
        });
        
        console.log(`💾 [${requestId}] Saved analysis to DB: ${savedAnalysis._id}`);
      } catch (uploadError) {
        console.error(`⚠️ [${requestId}] Cloudinary/DB Save Failed:`, uploadError.message);
        // We continue to return the result to the user even if history save fails
      }
    }
    
    // Final Cleanup
    try { if (fs.existsSync(tempImagePath)) fs.unlinkSync(tempImagePath); } catch(e) {}
    
    res.status(200).json({
      success: true,
      processingTime: duration,
      requestId,
      analysisId: savedAnalysis ? savedAnalysis._id : null,
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
};

/**
 * Get User's Leaf Scan History
 */
exports.getLeafHistory = async (req, res) => {
  try {
    const history = await LeafAnalysis.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 scans

    res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    console.error('❌ Failed to fetch leaf history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch history'
    });
  }
};
