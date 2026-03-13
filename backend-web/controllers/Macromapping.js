const Macromapping = require('../models/Macromapping');

// ========== SAVE MACROMAPPING ANALYSIS ==========
exports.saveAnalysis = async (req, res) => {
    try {
        console.log('💾 Saving macromapping analysis...');
        
        // User should be authenticated from middleware
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not authenticated' 
            });
        }

        const {
            name,
            displayName,
            locationDetails,
            latitude,
            longitude,
            weather,
            elevation,
            annualRainfall,
            soilPH,
            score,
            scoreFactors,
            rating,
            recommendations
        } = req.body;

        // Validate required fields
        if (!name || latitude === undefined || longitude === undefined || !score || !rating) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide all required fields (name, latitude, longitude, score, rating)' 
            });
        }

        // Validate coordinates
        if (latitude < -90 || latitude > 90) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid latitude value' 
            });
        }

        if (longitude < -180 || longitude > 180) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid longitude value' 
            });
        }

        // Validate score range
        if (score < 0 || score > 100) {
            return res.status(400).json({ 
                success: false, 
                message: 'Score must be between 0 and 100' 
            });
        }

        // Create new macromapping analysis
        const macromapping = await Macromapping.create({
            user: req.user._id,
            name,
            displayName: displayName || '',
            locationDetails: locationDetails || {},
            latitude,
            longitude,
            weather: weather || {},
            elevation: elevation || 100,
            annualRainfall: annualRainfall || 2000,
            soilPH: soilPH || 6.0,
            score,
            scoreFactors: scoreFactors || {},
            rating,
            recommendations: recommendations || [],
            timestamp: new Date()
        });

        console.log('✅ Macromapping analysis saved:', macromapping._id);

        res.status(201).json({
            success: true,
            message: 'Analysis saved successfully',
            data: macromapping
        });

    } catch (error) {
        console.error('❌ Error saving macromapping analysis:', error);
        
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ 
                success: false, 
                message: messages.join(', ') 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: 'Failed to save analysis. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ========== GET USER'S MACROMAPPING ANALYSES ==========
exports.getAnalyses = async (req, res) => {
    try {
        console.log('📋 Fetching macromapping analyses for user:', req.user?._id);

        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not authenticated' 
            });
        }

        const { page = 1, limit = 20, sort = '-createdAt' } = req.query;

        // Calculate pagination
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const skip = (pageNum - 1) * limitNum;

        // Get total count
        const total = await Macromapping.countDocuments({ user: req.user._id });

        // Get analyses sorted by date (newest first by default)
        const analyses = await Macromapping.find({ user: req.user._id })
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .populate('user', 'name email avatar')
            .lean();

        console.log(`✅ Found ${analyses.length} analyses (total: ${total})`);

        res.status(200).json({
            success: true,
            data: analyses,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });

    } catch (error) {
        console.error('❌ Error fetching macromapping analyses:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch analyses',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// ========== DELETE MACROMAPPING ANALYSIS ==========
exports.deleteAnalysis = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not authenticated' 
            });
        }

        const analysis = await Macromapping.findOneAndDelete({ 
            _id: id, 
            user: req.user._id 
        });

        if (!analysis) {
            return res.status(404).json({ 
                success: false, 
                message: 'Analysis not found or already deleted' 
            });
        }

        console.log('✅ Analysis deleted:', id);

        res.status(200).json({
            success: true,
            message: 'Analysis deleted successfully',
            data: { _id: id }
        });

    } catch (error) {
        console.error('❌ Error deleting analysis:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid analysis ID' 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete analysis',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

