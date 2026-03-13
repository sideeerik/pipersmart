const LeafAnalysis = require('../models/LeafAnalysis');
const BungaAnalysis = require('../models/BungaAnalysis');

// ========== SAVE LEAF ANALYSIS ==========
exports.saveLeafAnalysis = async (req, res) => {
    try {
        console.log('💾 Saving leaf analysis to database...');
        
        const { userId, image, results, processingTime } = req.body;

        if (!userId || !image || !results) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: userId, image, results' 
            });
        }

        const leafAnalysis = await LeafAnalysis.create({
            user: userId,
            image: {
                public_id: image.public_id || 'leaf_' + Date.now(),
                url: image.url
            },
            results: {
                disease: results.disease,
                confidence: results.confidence,
                detections: results.detections || []
            },
            processingTime: processingTime || 0
        });

        console.log('✅ Leaf analysis saved:', leafAnalysis._id);

        res.status(201).json({
            success: true,
            message: 'Leaf analysis saved successfully',
            data: leafAnalysis
        });

    } catch (error) {
        console.error('❌ Error saving leaf analysis:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save leaf analysis',
            error: error.message 
        });
    }
};

// ========== SAVE BUNGA ANALYSIS ==========
exports.saveBungaAnalysis = async (req, res) => {
    try {
        console.log('💾 Saving bunga analysis to database...');
        
        const { userId, image, results, processingTime } = req.body;

        if (!userId || !image || !results) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: userId, image, results' 
            });
        }

        const bungaAnalysis = await BungaAnalysis.create({
            user: userId,
            image: {
                public_id: image.public_id || 'bunga_' + Date.now(),
                url: image.url
            },
            results: {
                ripeness: results.ripeness,
                ripeness_percentage: results.ripeness_percentage || 0,
                health_class: results.health_class,
                health_percentage: results.health_percentage || 0,
                confidence: results.confidence || 0,
                market_grade: results.market_grade || 'Unknown'
            },
            processingTime: processingTime || 0
        });

        console.log('✅ Bunga analysis saved:', bungaAnalysis._id);

        res.status(201).json({
            success: true,
            message: 'Bunga analysis saved successfully',
            data: bungaAnalysis
        });

    } catch (error) {
        console.error('❌ Error saving bunga analysis:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save bunga analysis',
            error: error.message 
        });
    }
};

// ========== GET USER'S LEAF ANALYSES ==========
exports.getLeafAnalyses = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const analyses = await LeafAnalysis.find({ user: userId })
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        const total = await LeafAnalysis.countDocuments({ user: userId });

        res.status(200).json({
            success: true,
            data: analyses,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('❌ Error fetching leaf analyses:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch leaf analyses',
            error: error.message 
        });
    }
};

// ========== GET USER'S BUNGA ANALYSES ==========
exports.getBungaAnalyses = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const analyses = await BungaAnalysis.find({ user: userId })
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        const total = await BungaAnalysis.countDocuments({ user: userId });

        res.status(200).json({
            success: true,
            data: analyses,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('❌ Error fetching bunga analyses:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch bunga analyses',
            error: error.message 
        });
    }
};

// ========== DELETE LEAF ANALYSIS ==========
exports.deleteLeafAnalysis = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        const analysis = await LeafAnalysis.findOneAndDelete({ 
            _id: id, 
            user: userId 
        });

        if (!analysis) {
            return res.status(404).json({ 
                success: false, 
                message: 'Analysis not found' 
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
};

// ========== DELETE BUNGA ANALYSIS ==========
exports.deleteBungaAnalysis = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        const analysis = await BungaAnalysis.findOneAndDelete({ 
            _id: id, 
            user: userId 
        });

        if (!analysis) {
            return res.status(404).json({ 
                success: false, 
                message: 'Analysis not found' 
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
};

