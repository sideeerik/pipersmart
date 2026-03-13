const express = require('express');
const router = express.Router();
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { isAuthenticatedUser } = require('../middlewares/auth');
const LeafAnalysis = require('../models/LeafAnalysis');
const BungaAnalysis = require('../models/BungaAnalysis');
const { uploadToCloudinary } = require('../utils/Cloudinary');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });

const normalizeHealthClass = (rawHealthClass, rawClassStr) => {
    if (rawHealthClass !== undefined && rawHealthClass !== null && rawHealthClass !== '') {
        const directMatch = String(rawHealthClass).toLowerCase().match(/[a-d]/);
        return directMatch ? directMatch[0] : null;
    }
    if (rawClassStr) {
        const match = String(rawClassStr).match(/class\s*[A-D]\s*[-_ ]\s*([a-d])/i);
        if (match) return match[1].toLowerCase();
    }
    return null;
};

const normalizeRipeness = (rawRipeness, rawClassStr) => {
    if (rawRipeness !== undefined && rawRipeness !== null && rawRipeness !== '') {
        const norm = String(rawRipeness).toLowerCase().trim();
        if (norm === 'ripe') return 'Ripe';
        if (norm === 'unripe') return 'Unripe';
        if (norm === 'rotten') return 'Rotten';
    }
    if (rawClassStr) {
        const match = String(rawClassStr).match(/class\s*([A-D])\s*[-_ ]\s*[a-d]/i);
        if (match) {
            const letter = match[1].toUpperCase();
            return (letter === 'A' || letter === 'B') ? 'Ripe' : 'Unripe';
        }
    }
    return null;
};

const computeMarketGrade = (ripenessRaw, healthClassRaw) => {
    const ripeness = ripenessRaw ? String(ripenessRaw).toLowerCase() : '';
    const health = healthClassRaw ? String(healthClassRaw).toLowerCase().match(/[a-d]/)?.[0] : '';

    if (!ripeness) return 'Unknown';
    if (ripeness === 'rotten') return 'Reject';
    if (!health) return 'Unknown';

    if (ripeness === 'ripe') {
        if (health === 'a') return 'Premium';
        if (health === 'b') return 'Standard';
        return 'Commercial';
    }
    if (ripeness === 'unripe') {
        if (health === 'a' || health === 'b') return 'Standard';
        return 'Commercial';
    }
    return 'Unknown';
};

const extractClassLetters = (classStr) => {
    if (!classStr) return null;
    const raw = String(classStr).trim();
    if (/rotten/i.test(raw)) return null;
    let match = raw.match(/class\s*([A-D])\s*[-_ ]\s*([a-d])/i);
    if (!match) {
        match = raw.match(/([A-D])\s*[-_ ]\s*([a-d])/i);
    }
    if (!match) return null;
    return { ripenessLetter: match[1].toUpperCase(), healthLetter: match[2].toLowerCase() };
};

const calcPercentageFromLetter = (letter, confidencePct) => {
    const ranges = {
        A: { min: 76, max: 100 },
        B: { min: 51, max: 75 },
        C: { min: 26, max: 50 },
        D: { min: 0, max: 25 }
    };
    const range = ranges[letter];
    if (!range) return 0;
    const conf = Number.isFinite(confidencePct) ? confidencePct : 0;
    const clamped = Math.max(0, Math.min(100, conf));
    const pct = range.min + ((clamped / 100) * (range.max - range.min));
    return Math.round(pct * 10) / 10;
};

// ========== LEAF DISEASE PREDICTION ==========
router.post('/disease', upload.single('image'), async (req, res) => {
    try {
        console.log('🟢 [leaf] NEW LEAF DISEASE PREDICTION REQUEST RECEIVED');

        // Get image - check multiple sources
        let image = null;
        
        // 1. Check if file was uploaded (multipart/form-data)
        if (req.file) {
            console.log(`📎 [leaf] File received: ${req.file.originalname} ${req.file.size} bytes`);
            image = req.file.buffer.toString('base64');
        }
        // 2. Check if image is in body (JSON)
        else if (req.body && req.body.image) {
            console.log('📸 [leaf] Image received in body.image');
            image = req.body.image;
        }
        // 3. Handle if image is sent as direct base64 string
        else if (req.body && typeof req.body === 'string' && req.body.length > 100) {
            image = req.body;
        }
        
        if (!image) {
            console.log('⚠️ [leaf] No image found');
            console.log('⚠️ [leaf] Body keys:', Object.keys(req.body || {}));
            console.log('⚠️ [leaf] File:', req.file ? 'yes' : 'no');
            return res.status(400).json({
                success: false,
                message: 'Image is required'
            });
        }

        console.log(`🟢 [leaf] Processing image, size: ${image.length} chars`);

        // Create temp directory
        const tempDir = path.join(__dirname, '..', 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Save image to temp file
        const timestamp = Date.now();
        const filename = `leaf_${timestamp}.jpg`;
        const filepath = path.join(tempDir, filename);
        
        // Handle base64 - extract if data URL
        let base64Data = image;
        if (image.includes('data:image')) {
            const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
            if (matches) {
                base64Data = matches[2];
            } else {
                base64Data = image.replace(/^data:image\/\w+;base64,/, '');
            }
        }
        
        try {
            fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));
            const stats = fs.statSync(filepath);
            console.log(`💾 [leaf] Temp file saved: ${filename} (${stats.size} bytes)`);
        } catch (writeErr) {
            console.error('❌ [leaf] Error writing image:', writeErr);
            return res.status(500).json({ success: false, message: 'Failed to save image' });
        }

        // Get paths
        const pythonScript = path.join(__dirname, '..', 'utils', 'predict_disease_yolov8.py');
        const modelPath = path.join(__dirname, '..', 'ml_models', 'leaf', 'train', 'weights', 'best.pt');
        
        console.log(`🐍 [leaf] Spawning Python (CPU-Optimized)...`);
        console.log(`🐍 [leaf] Script: ${pythonScript}`);
        console.log(`🐍 [leaf] Model: ${modelPath}`);
        
        const startTime = Date.now();

        const pythonProcess = spawn('python', [
            pythonScript,
            filepath,
            modelPath
        ], {
            shell: false,
            windowsHide: true
        });

        let resultData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            const str = data.toString();
            errorData += str;
            if (str.includes('Processing') || str.includes('Loading') || str.includes('Model') || 
                str.includes('Detected') || str.includes('Disease')) {
                console.log(`⚠️ [leaf] Python: ${str.trim()}`);
            }
        });

        pythonProcess.on('error', (err) => {
            console.error('❌ [leaf] Process error:', err);
        });

        pythonProcess.on('close', async (code) => {
            const processingTime = Date.now() - startTime;
            console.log(`✅ [leaf] Prediction completed in ${processingTime}ms, code: ${code}`);

            // Clean up temp file
            try {
                fs.unlinkSync(filepath);
            } catch (err) {}

            if (code !== 0) {
                console.error('❌ [leaf] Python failed with code:', code);
                console.error('❌ [leaf] Error:', errorData);
                return res.status(200).json({
                    success: true,
                    data: { disease: 'Unknown', confidence: 0 },
                    processingTime
                });
            }

            try {
                // Parse result - find JSON in output
                const lines = resultData.trim().split('\n');
                let result = null;
                
                for (let i = lines.length - 1; i >= 0; i--) {
                    const line = lines[i].trim();
                    if (line.startsWith('{') && line.endsWith('}')) {
                        try {
                            const parsed = JSON.parse(line);
                            if (parsed.disease) {
                                result = parsed;
                                break;
                            }
                        } catch (e) {}
                    }
                }

                if (!result) {
                    result = { disease: 'Unknown', confidence: 0 };
                }

                console.log(`📊 [leaf] Result: ${result.disease} (${result.confidence}%)`);

                res.status(200).json({
                    success: true,
                    message: 'Leaf disease prediction completed',
                    data: {
                        disease: result.disease,
                        confidence: result.confidence,
                        detections: result.detections || []
                    },
                    processingTime
                });

            } catch (parseError) {
                console.error('❌ [leaf] Parse error:', parseError.message);
                res.status(200).json({
                    success: true,
                    message: 'Prediction completed',
                    data: { disease: 'Unknown', confidence: 0 },
                    processingTime
                });
            }
        });

    } catch (error) {
        console.error('❌ [leaf] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process prediction',
            error: error.message
        });
    }
});

// ========== BUNGA RIPENESS PREDICTION ==========
router.post('/ripeness', isAuthenticatedUser, upload.single('image'), async (req, res) => {
    try {
        let image = null;
        let dataUri = null;
        
        // Check file upload
        if (req.file) {
            console.log(`📎 [bunga] File received: ${req.file.originalname} ${req.file.size} bytes`);
            image = req.file.buffer.toString('base64');
            const mime = req.file.mimetype || 'image/jpeg';
            dataUri = `data:${mime};base64,${image}`;
        } else if (req.body?.image) {
            console.log('📸 [bunga] Image received in body.image');
            image = req.body.image;
            if (image.startsWith('data:image')) {
                dataUri = image;
            } else {
                dataUri = `data:image/jpeg;base64,${image}`;
            }
        }
        
        if (!image) {
            console.log('⚠️ [bunga] No image found');
            return res.status(400).json({ success: false, message: 'Image required' });
        }

        console.log('🟢 [bunga] Processing ripeness prediction...');

        const tempDir = path.join(__dirname, '..', 'temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        
        const timestamp = Date.now();
        const filename = `bunga_${timestamp}.jpg`;
        const filepath = path.join(tempDir, filename);
        
        // Handle base64 - extract if data URL
        let base64Data = image;
        if (image.includes('data:image')) {
            const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
            if (matches) {
                base64Data = matches[2];
            } else {
                base64Data = image.replace(/^data:image\/\w+;base64,/, '');
            }
        }
        
        try {
            fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));
            const stats = fs.statSync(filepath);
            console.log(`💾 [bunga] Temp file saved: ${filename} (${stats.size} bytes)`);
        } catch (writeErr) {
            console.error('❌ [bunga] Error writing image:', writeErr);
            return res.status(500).json({ success: false, message: 'Failed to save image' });
        }

        // Use the existing working script
        const pythonScript = path.join(__dirname, '..', 'utils', 'predict_bunga_web_cpu.py');
        const modelPath = path.join(__dirname, '..', 'ml_models', 'bunga', 'train', 'weights', 'best.pt');
        
        console.log(`🐍 [bunga] Script: ${pythonScript}`);
        console.log(`🐍 [bunga] Model: ${modelPath}`);
        
        const startTime = Date.now();

        const pythonProcess = spawn('python', [pythonScript, filepath, modelPath], { 
            shell: false,
            windowsHide: true 
        });
        
        let resultData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            resultData += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            const str = data.toString();
            errorData += str;
            if (str.includes('Processing') || str.includes('Loading') || str.includes('Detected')) {
                console.log(`⚠️ [bunga] Python: ${str.trim()}`);
            }
        });

        pythonProcess.on('error', (err) => {
            console.error('❌ [bunga] Process error:', err);
        });

        pythonProcess.on('close', async (code) => {
            const time = Date.now() - startTime;
            console.log(`✅ [bunga] Prediction completed in ${time}ms, code: ${code}`);
            
            // Clean up temp file
            try {
                fs.unlinkSync(filepath);
            } catch (err) {}
            
            if (code !== 0) {
                console.error('❌ [bunga] Python failed with code:', code);
                console.error('❌ [bunga] Error:', errorData);
                return res.status(200).json({ 
                    success: true, 
                    data: { ripeness: 'Unknown', confidence: 0, class: 'Unknown' }, 
                    processingTime: time 
                });
            }
            
            try {
                // Parse JSON from stdout
                const lines = resultData.trim().split('\n');
                let result = null;
                
                // Find JSON in output
                for (let i = lines.length - 1; i >= 0; i--) {
                    const line = lines[i].trim();
                    if (line.startsWith('{') && line.endsWith('}')) {
                        try {
                            const parsed = JSON.parse(line);
                            if (parsed.ripeness || parsed.class) {
                                result = parsed;
                                break;
                            }
                        } catch (e) {}
                    }
                }

                if (!result) {
                    result = { ripeness: 'Unknown', confidence: 0, class: 'Unknown' };
                }
                const confidencePct = Number(result.ripeness_confidence ?? result.confidence ?? 0);
                const letters = extractClassLetters(result.class);
                const normalizedRipeness = normalizeRipeness(result.ripeness, result.class);
                const normalizedHealthClass = normalizeHealthClass(result.health_class, result.class);

                let ripenessPercentage = Number(result.ripeness_percentage);
                if (!Number.isFinite(ripenessPercentage)) ripenessPercentage = 0;
                if (normalizedRipeness === 'Rotten') ripenessPercentage = 0;
                if (!ripenessPercentage && letters?.ripenessLetter) {
                    ripenessPercentage = calcPercentageFromLetter(letters.ripenessLetter, confidencePct);
                }

                let healthPercentage = Number(result.health_percentage);
                if (!Number.isFinite(healthPercentage)) healthPercentage = 0;
                if (!healthPercentage && letters?.healthLetter) {
                    healthPercentage = calcPercentageFromLetter(letters.healthLetter.toUpperCase(), confidencePct);
                }

                const marketGrade = computeMarketGrade(normalizedRipeness, normalizedHealthClass);

                console.log(`📊 [bunga] Result: ${result.ripeness || 'Unknown'} (${confidencePct || 0}%)`);

                let savedAnalysis = null;
                if (result.ripeness && normalizedRipeness && dataUri) {
                    try {
                        const uploadResult = await uploadToCloudinary(dataUri, 'pipersmart/bunga_scans');
                        savedAnalysis = await BungaAnalysis.create({
                            user: req.user._id,
                            image: {
                                public_id: uploadResult.public_id,
                                url: uploadResult.url
                            },
                            results: {
                                ripeness: normalizedRipeness,
                                ripeness_percentage: ripenessPercentage,
                                health_class: normalizedHealthClass,
                                health_percentage: healthPercentage,
                                confidence: confidencePct || 0,
                                market_grade: marketGrade
                            },
                            processingTime: time
                        });
                        console.log(`💾 [bunga] Saved to DB: ${savedAnalysis._id}`);
                    } catch (uploadError) {
                        console.error('❌ [bunga] Cloudinary upload failed:', uploadError.message);
                    }
                }

                // Return in format frontend expects
                res.status(200).json({ 
                    success: true, 
                    message: 'Bunga ripeness prediction completed',
                    data: {
                        ripeness: normalizedRipeness || result.ripeness || 'Unknown',
                        confidence: confidencePct || 0,
                        class: result.class || 'Unknown',
                        health_class: normalizedHealthClass,
                        health_percentage: healthPercentage,
                        ripeness_percentage: ripenessPercentage,
                        market_grade: marketGrade,
                        health_range: result.health_range,
                        bunga_detections: result.bunga_detections || [],
                        saved: !!savedAnalysis,
                        analysisId: savedAnalysis ? savedAnalysis._id : null
                    },
                    processingTime: time 
                });
            } catch (e) {
                console.error('❌ [bunga] Parse error:', e.message);
                console.error('❌ [bunga] Raw output:', resultData);
                res.status(200).json({ 
                    success: true, 
                    data: { ripeness: 'Unknown', confidence: 0, class: 'Unknown' }, 
                    processingTime: time 
                });
            }
        });

    } catch (error) {
        console.error('❌ [bunga] Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ========== GET USER'S LEAF ANALYSES ==========
router.get('/leaf-analysis', isAuthenticatedUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const analyses = await LeafAnalysis.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(100);
        
        res.status(200).json({
            success: true,
            data: analyses
        });
    } catch (error) {
        console.error('❌ Error fetching leaf analyses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch leaf analyses',
            error: error.message
        });
    }
});

// ========== GET USER'S BUNGA ANALYSES ==========
router.get('/bunga-analysis', isAuthenticatedUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const analyses = await BungaAnalysis.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(100);
        
        res.status(200).json({
            success: true,
            data: analyses
        });
    } catch (error) {
        console.error('❌ Error fetching bunga analyses:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bunga analyses',
            error: error.message
        });
    }
});

// ========== DELETE LEAF ANALYSIS ==========
router.delete('/leaf-analysis/:id', isAuthenticatedUser, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const analysis = await LeafAnalysis.findOneAndDelete({
            _id: id,
            user: userId
        });

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Leaf analysis not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Leaf analysis deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting leaf analysis:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete leaf analysis',
            error: error.message
        });
    }
});

// ========== DELETE BUNGA ANALYSIS ==========
router.delete('/bunga-analysis/:id', isAuthenticatedUser, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const analysis = await BungaAnalysis.findOneAndDelete({
            _id: id,
            user: userId
        });

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: 'Bunga analysis not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Bunga analysis deleted successfully'
        });
    } catch (error) {
        console.error('❌ Error deleting bunga analysis:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete bunga analysis',
            error: error.message
        });
    }
});

module.exports = router;


