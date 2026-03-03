const BungaAnalysis = require('../models/BungaAnalysis');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { uploadToCloudinary } = require('../utils/Cloudinary');

// Helper to determine Market Grade
const getMarketGrade = (classStr) => {
  if (!classStr) return 'Unknown';
  
  // Check for Reject - Rotten, C-d, D-d
  if (classStr.toLowerCase() === 'rotten') {
    return 'Reject';
  }
  
  const match = classStr.match(/Class\s*([A-D])-([a-d])/);
  if (!match) return 'Unknown';
  
  const ripenessLetter = match[1]; // A, B, C, or D
  const healthLetter = match[2];   // a, b, c, or d
  
  // Reject: C-d, D-d
  if ((ripenessLetter === 'C' && healthLetter === 'd') ||
      (ripenessLetter === 'D' && healthLetter === 'd')) {
    return 'Reject';
  }
  
  // Premium: A-a
  if (ripenessLetter === 'A' && healthLetter === 'a') {
    return 'Premium';
  }
  
  // Standard: A-b, B-a, B-b
  if ((ripenessLetter === 'A' && healthLetter === 'b') ||
      (ripenessLetter === 'B' && (healthLetter === 'a' || healthLetter === 'b'))) {
    return 'Standard';
  }
  
  // Commercial: All others
  return 'Commercial';
};

/**
 * Analyze Bunga Image
 * - Runs Python script
 * - Uploads to Cloudinary
 * - Saves to DB
 */
exports.analyzeBunga = async (req, res) => {
  const startTime = Date.now();
  const requestId = `bunga_${Date.now()}`;

  try {
    if (!req.file) {
      console.error(`❌ [${requestId}] IMAGE RECEPTION FAILED - No image file provided`);
      return res.status(400).json({
        success: false,
        error: 'No image provided',
        requestId
      });
    }

    // ✅ CONFIRM IMAGE RECEIVED
    const userAgent = req.headers['user-agent'] || 'unknown';
    const platform = userAgent.toLowerCase().includes('android') ? 'Android' : 
                     userAgent.toLowerCase().includes('iphone') ? 'iOS' : 'Unknown';
    
    console.log(`\n🟢 [${requestId}] NEW BUNGA RIPENESS PREDICTION REQUEST RECEIVED`);
    console.log(`   ⏰ Timestamp: ${new Date().toISOString()}`);
    console.log(`   📱 Platform: ${platform}`);
    console.log(`   👤 User ID: ${req.user._id}`);
    console.log(`✅ [${requestId}] IMAGE RECEPTION CONFIRMED`);
    console.log(`   📸 Filename: ${req.file.originalname}`);
    console.log(`   📦 File size: ${req.file.size} bytes (${(req.file.size / 1024).toFixed(2)} KB)`);
    console.log(`   📋 MIME type: ${req.file.mimetype}`);
    console.log(`   🔍 Buffer size: ${req.file.buffer.length} bytes`);
    console.log(`   📱 Device: ${platform}`);
    console.log(`   📍 Request ID: ${requestId}`);

    // 1. Save Temp File
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    const tempImagePath = path.join(tempDir, `${requestId}.jpg`);
    fs.writeFileSync(tempImagePath, req.file.buffer);

    console.log(`💾 [${requestId}] IMAGE SAVED TO TEMPORARY STORAGE`);
    console.log(`   📁 Temp path: ${tempImagePath}`);

    // 2. Run Python Script
    const unifiedModelPath = path.join(__dirname, '../ml_models/bunga/train/weights/best.pt');
    const pythonScriptPath = path.join(__dirname, '../utils/predict_bunga_dual_models.py');
    const pythonExe = process.env.PYTHON_EXE || 'python';

    const result = await new Promise((resolve, reject) => {
      console.log(`🐍 Spawning Python...`);
      const python = spawn(pythonExe, [pythonScriptPath, tempImagePath, unifiedModelPath], {
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 300000  // 5 minutes - YOLO inference is compute-heavy
      });

      let output = '';
      let errorOutput = '';
      let timeoutTriggered = false;

      python.stdout.on('data', (data) => output += data.toString());
      python.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.log(data.toString()); // Show Python debug logs in real-time
      });

      const timeoutHandle = setTimeout(() => {
        timeoutTriggered = true;
        python.kill('SIGTERM');
        reject(new Error(`Python inference timeout (>300s) - CPU may be throttled. Output so far: ${output}`));
      }, 300000);

      python.on('close', (code) => {
        clearTimeout(timeoutHandle);
        if (timeoutTriggered) return; // Already handled by timeout
        
        if (code === 0 || code === null) {
          try {
            const lines = output.trim().split('\n');
            let jsonLine = '';
            for (let line of lines) {
              line = line.trim();
              if (line.startsWith('{')) {
                jsonLine = line;
                break;
              }
            }
            if (jsonLine) resolve(JSON.parse(jsonLine));
            else reject(new Error('No JSON output from Python. Stderr: ' + errorOutput));
          } catch (e) {
            reject(new Error('Parse error: ' + e.message + '. Raw output: ' + output));
          }
        } else {
          reject(new Error(`Python failed with code ${code}: ${errorOutput}`));
        }
      });

      python.on('error', (err) => {
        clearTimeout(timeoutHandle);
        reject(err);
      });
    });

    // ✅ PYTHON PROCESSING COMPLETE
    console.log(`🐍 [${requestId}] PYTHON PROCESSING COMPLETED`);
    console.log(`   🎯 Ripeness: ${result.ripeness}`);
    console.log(`   📊 Ripeness %: ${result.ripeness_percentage}%`);
    console.log(`   🎯 Health Class: ${result.health_class}`);
    console.log(`   📊 Health %: ${result.health_percentage}%`);
    console.log(`   📈 Confidence: ${result.confidence}%`);

    // Clean up temp file (local)
    try { fs.unlinkSync(tempImagePath); } catch (e) {}

    const duration = Date.now() - startTime;

    // 3. If Valid Detection, Upload to Cloudinary & Save to DB
    let savedAnalysis = null;
    if (result.success && result.ripeness) {
      try {
        console.log(`☁️ [${requestId}] UPLOADING TO CLOUDINARY...`);
        
        // Upload buffer directly to Cloudinary
        // Convert buffer to base64 data URI
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        
        const uploadResult = await uploadToCloudinary(dataURI, 'pipersmart/bunga_scans');

        console.log(`☁️ [${requestId}] CLOUDINARY UPLOAD SUCCESSFUL`);
        console.log(`   🔗 Public ID: ${uploadResult.public_id}`);
        console.log(`   📍 URL: ${uploadResult.url}`);

        // Determine market grade based on ripeness and health_class
        let marketGrade = 'Unknown';
        
        if (result.ripeness === 'Rotten') {
          marketGrade = 'Reject';
        } else if (result.ripeness === 'Ripe' && result.health_class === 'a') {
          marketGrade = 'Premium';
        } else if ((result.ripeness === 'Ripe' && result.health_class === 'b') || 
                   (result.ripeness === 'Ripe' && result.health_class === 'a')) {
          marketGrade = 'Standard';
        } else {
          marketGrade = 'Commercial';
        }

        savedAnalysis = await BungaAnalysis.create({
          user: req.user._id,
          image: {
            public_id: uploadResult.public_id,
            url: uploadResult.url
          },
          results: {
            ripeness: result.ripeness,                    // "Ripe", "Unripe", "Rotten"
            ripeness_percentage: result.ripeness_percentage,
            health_class: result.health_class,            // "a", "b", "c", "d"
            health_percentage: result.health_percentage,
            confidence: result.confidence,                // 0-100
            market_grade: marketGrade
          },
          processingTime: duration
        });
        
        console.log(`💾 [${requestId}] SAVED TO DATABASE`);
        console.log(`   🔑 Analysis ID: ${savedAnalysis._id}`);
        console.log(`   🏷️ Market Grade: ${marketGrade}`);
        console.log(`   👤 User: ${req.user._id}`);
      } catch (uploadError) {
        console.error(`❌ [${requestId}] CLOUDINARY UPLOAD FAILED:`, uploadError.message);
        console.warn(`⚠️ [${requestId}] Result will be returned but NOT saved to history`);
        // We continue to return the result to the user even if history save fails
      }
    }

    // 4. Respond to Client
    console.log(`\n✅ [${requestId}] RESPONSE SENT TO FRONTEND`);
    console.log(`   🎯 Status: SUCCESS`);
    console.log(`   ⏱️ Total processing time: ${duration}ms`);
    console.log(`   🔍 Result: ${result.ripeness} | Health: ${result.health_class} | Confidence: ${result.confidence}%`);
    console.log(`   💾 Saved to DB: ${savedAnalysis ? '✅ YES' : '❌ NO'}`);
    console.log(`   🏷️ Market Grade: ${savedAnalysis ? savedAnalysis.results.market_grade : 'NOT SAVED'}`);
    
    res.status(200).json({
      success: true,
      ...result,
      analysisId: savedAnalysis ? savedAnalysis._id : null,
      market_grade: savedAnalysis ? savedAnalysis.results.market_grade : null,
      processingTime: duration
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${requestId}] ANALYSIS ERROR (${duration}ms):`, error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Analysis failed',
      requestId
    });
  }
};

/**
 * Get User's Scan History
 */
exports.getHistory = async (req, res) => {
  try {
    const history = await BungaAnalysis.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 scans

    res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch history'
    });
  }
};

/**
 * Delete a Bunga Analysis Record
 */
exports.deleteBungaAnalysis = async (req, res) => {
  try {
    const { analysisId } = req.params;
    const userId = req.user._id;

    // Find the analysis record
    const analysis = await BungaAnalysis.findById(analysisId);

    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: 'Analysis record not found'
      });
    }

    // Verify ownership - user can only delete their own records
    if (analysis.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: You can only delete your own analysis records'
      });
    }

    // Delete the record
    await BungaAnalysis.findByIdAndDelete(analysisId);

    console.log(`✅ Deleted bunga analysis: ${analysisId}`);

    res.status(200).json({
      success: true,
      message: 'Analysis record deleted successfully',
      analysisId
    });
  } catch (error) {
    console.error('❌ Error deleting bunga analysis:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete analysis record'
    });
  }
};
