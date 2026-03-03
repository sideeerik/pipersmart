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
      return res.status(400).json({
        success: false,
        error: 'No image provided'
      });
    }

    console.log(`\n📸 [${requestId}] Bunga Analysis Request`);

    // 1. Save Temp File
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    const tempImagePath = path.join(tempDir, `${requestId}.jpg`);
    fs.writeFileSync(tempImagePath, req.file.buffer);

    // 2. Run Python Script
    const unifiedModelPath = path.join(__dirname, '../ml_models/bunga/train/weights/best.pt');
    const pythonScriptPath = path.join(__dirname, '../utils/predict_bunga_dual_models.py');
    const pythonExe = process.env.PYTHON_EXE || 'python';

    const result = await new Promise((resolve, reject) => {
      console.log(`🐍 Spawning Python...`);
      const python = spawn(pythonExe, [pythonScriptPath, tempImagePath, unifiedModelPath], {
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 120000 
      });

      let output = '';
      let errorOutput = '';

      python.stdout.on('data', (data) => output += data.toString());
      python.stderr.on('data', (data) => {
        errorOutput += data.toString();
        // console.log(data.toString()); // Debug logs
      });

      python.on('close', (code) => {
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
            else reject(new Error('No JSON output from Python'));
          } catch (e) {
            reject(new Error('Parse error: ' + e.message));
          }
        } else {
          reject(new Error('Python failed: ' + errorOutput));
        }
      });

      python.on('error', (err) => reject(err));
    });

    // Clean up temp file (local)
    try { fs.unlinkSync(tempImagePath); } catch (e) {}

    const duration = Date.now() - startTime;

    // 3. If Valid Detection, Upload to Cloudinary & Save to DB
    let savedAnalysis = null;
    if (result.success && result.ripeness) {
      try {
        console.log('☁️ Uploading evidence to Cloudinary...');
        
        // Upload buffer directly to Cloudinary
        // Convert buffer to base64 data URI
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        
        const uploadResult = await uploadToCloudinary(dataURI, 'pipersmart/bunga_scans');

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
        
        console.log(`💾 Saved analysis to DB: ${savedAnalysis._id} (${marketGrade})`);
      } catch (uploadError) {
        console.error('⚠️ Cloudinary Upload Failed - Result returned but not saved to history:', uploadError.message);
        // We continue to return the result to the user even if history save fails
      }
    }

    // 4. Respond to Client
    res.status(200).json({
      success: true,
      ...result,
      analysisId: savedAnalysis ? savedAnalysis._id : null,
      market_grade: savedAnalysis ? savedAnalysis.results.market_grade : null,
      processingTime: duration
    });

  } catch (error) {
    console.error('❌ Analysis Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Analysis failed'
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
