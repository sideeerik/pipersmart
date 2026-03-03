const BungaAnalysis = require('../models/BungaAnalysis');
const LeafAnalysis = require('../models/LeafAnalysis');
const User = require('../models/User');

// ==================== BUNGA ANALYSIS REPORTS ====================

/**
 * Get all Bunga Analysis reports with detailed stats and pagination
 * - Admin only
 */
exports.getBungaAnalysisReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Get total count
    const totalRecords = await BungaAnalysis.countDocuments();

    // Fetch records with user details and sort
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const analyses = await BungaAnalysis.find()
      .populate('user', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(pageSize)
      .lean();

    // Calculate detailed statistics
    let ripeCount = 0,
      unripeCount = 0,
      rottenCount = 0;
    let marketGradeStats = {
      Premium: 0,
      Standard: 0,
      Commercial: 0,
      Reject: 0,
      Unknown: 0
    };
    let healthClassStats = { a: 0, b: 0, c: 0, d: 0, null: 0 };
    let confidenceSum = 0;
    let totalProcessingTime = 0;

    analyses.forEach(analysis => {
      // Ripeness distribution
      if (analysis.results.ripeness === 'Ripe') ripeCount++;
      else if (analysis.results.ripeness === 'Unripe') unripeCount++;
      else if (analysis.results.ripeness === 'Rotten') rottenCount++;

      // Market Grade distribution
      marketGradeStats[analysis.results.market_grade]++;

      // Health class distribution
      const healthClass = analysis.results.health_class || 'null';
      healthClassStats[healthClass]++;

      // Average confidence
      confidenceSum += analysis.results.confidence;

      // Total processing time
      totalProcessingTime += analysis.processingTime;
    });

    const totalAnalyses = analyses.length;

    // Calculate percentages
    const stats = {
      totalRecords,
      recordsThisPage: totalAnalyses,
      ripeness: {
        Ripe: totalAnalyses > 0 ? ((ripeCount / totalAnalyses) * 100).toFixed(2) : 0,
        Unripe: totalAnalyses > 0 ? ((unripeCount / totalAnalyses) * 100).toFixed(2) : 0,
        Rotten: totalAnalyses > 0 ? ((rottenCount / totalAnalyses) * 100).toFixed(2) : 0,
        counts: { Ripe: ripeCount, Unripe: unripeCount, Rotten: rottenCount }
      },
      marketGrade: {
        Premium: totalAnalyses > 0 ? ((marketGradeStats.Premium / totalAnalyses) * 100).toFixed(2) : 0,
        Standard: totalAnalyses > 0 ? ((marketGradeStats.Standard / totalAnalyses) * 100).toFixed(2) : 0,
        Commercial: totalAnalyses > 0 ? ((marketGradeStats.Commercial / totalAnalyses) * 100).toFixed(2) : 0,
        Reject: totalAnalyses > 0 ? ((marketGradeStats.Reject / totalAnalyses) * 100).toFixed(2) : 0,
        Unknown: totalAnalyses > 0 ? ((marketGradeStats.Unknown / totalAnalyses) * 100).toFixed(2) : 0,
        counts: marketGradeStats
      },
      healthClass: {
        A: totalAnalyses > 0 ? ((healthClassStats.a / totalAnalyses) * 100).toFixed(2) : 0,
        B: totalAnalyses > 0 ? ((healthClassStats.b / totalAnalyses) * 100).toFixed(2) : 0,
        C: totalAnalyses > 0 ? ((healthClassStats.c / totalAnalyses) * 100).toFixed(2) : 0,
        D: totalAnalyses > 0 ? ((healthClassStats.d / totalAnalyses) * 100).toFixed(2) : 0,
        Unknown: totalAnalyses > 0 ? ((healthClassStats.null / totalAnalyses) * 100).toFixed(2) : 0,
        counts: healthClassStats
      },
      confidence: {
        average: totalAnalyses > 0 ? (confidenceSum / totalAnalyses).toFixed(2) : 0,
        total: confidenceSum
      },
      processingTime: {
        average: totalAnalyses > 0 ? ((totalProcessingTime / totalAnalyses) / 1000).toFixed(2) : 0, // in seconds
        total: (totalProcessingTime / 1000).toFixed(2) // in seconds
      }
    };

    // Format response data
    const data = analyses.map(analysis => ({
      _id: analysis._id,
      userName: analysis.user?.name || 'Unknown User',
      userEmail: analysis.user?.email || 'N/A',
      image: analysis.image,
      results: {
        ripeness: analysis.results.ripeness,
        ripeness_percentage: analysis.results.ripeness_percentage,
        health_class: analysis.results.health_class,
        health_percentage: analysis.results.health_percentage,
        confidence: analysis.results.confidence,
        market_grade: analysis.results.market_grade
      },
      processingTime: `${(analysis.processingTime / 1000).toFixed(2)}s`,
      createdAt: analysis.createdAt
    }));

    res.status(200).json({
      success: true,
      message: '✅ Bunga Analysis Reports retrieved successfully',
      pagination: {
        currentPage: pageNumber,
        pageSize: pageSize,
        totalRecords: totalRecords,
        totalPages: Math.ceil(totalRecords / pageSize)
      },
      statistics: stats,
      data: data
    });
  } catch (error) {
    console.error('❌ Error fetching Bunga Analysis reports:', error.message);
    res.status(500).json({
      success: false,
      message: '❌ Failed to fetch Bunga Analysis reports',
      error: error.message
    });
  }
};

// ==================== LEAF ANALYSIS REPORTS ====================

/**
 * Get all Leaf Analysis reports with detailed stats and pagination
 * - Admin only
 */
exports.getLeafAnalysisReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Get total count
    const totalRecords = await LeafAnalysis.countDocuments();

    // Fetch records with user details and sort
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const analyses = await LeafAnalysis.find()
      .populate('user', 'name email')
      .sort(sortObj)
      .skip(skip)
      .limit(pageSize)
      .lean();

    // Calculate detailed statistics
    let diseaseStats = {};
    let confidenceSum = 0;
    let totalProcessingTime = 0;
    let totalDetections = 0;

    analyses.forEach(analysis => {
      // Disease distribution
      const disease = analysis.results.disease;
      diseaseStats[disease] = (diseaseStats[disease] || 0) + 1;

      // Average confidence
      confidenceSum += analysis.results.confidence;

      // Total processing time
      totalProcessingTime += analysis.processingTime;

      // Total detections
      if (analysis.results.detections) {
        totalDetections += analysis.results.detections.length;
      }
    });

    const totalAnalyses = analyses.length;

    // Calculate disease percentages
    const diseaseDistribution = {};
    Object.entries(diseaseStats).forEach(([disease, count]) => {
      diseaseDistribution[disease] = {
        count: count,
        percentage: totalAnalyses > 0 ? ((count / totalAnalyses) * 100).toFixed(2) : 0
      };
    });

    // Sort diseases by percentage descending
    const sortedDiseases = Object.entries(diseaseDistribution)
      .sort(([, a], [, b]) => b.percentage - a.percentage)
      .reduce((acc, [disease, stats]) => {
        acc[disease] = stats;
        return acc;
      }, {});

    const stats = {
      totalRecords,
      recordsThisPage: totalAnalyses,
      diseaseDistribution: sortedDiseases,
      mostCommonDisease: Object.keys(sortedDiseases)[0] || 'None',
      confidence: {
        average: totalAnalyses > 0 ? (confidenceSum / totalAnalyses).toFixed(2) : 0,
        total: confidenceSum
      },
      processingTime: {
        average: totalAnalyses > 0 ? ((totalProcessingTime / totalAnalyses) / 1000).toFixed(2) : 0, // in seconds
        total: (totalProcessingTime / 1000).toFixed(2) // in seconds
      },
      totalDetections: totalDetections,
      averageDetectionsPerAnalysis: totalAnalyses > 0 ? (totalDetections / totalAnalyses).toFixed(2) : 0
    };

    // Format response data
    const data = analyses.map(analysis => ({
      _id: analysis._id,
      userName: analysis.user?.name || 'Unknown User',
      userEmail: analysis.user?.email || 'N/A',
      image: analysis.image,
      results: {
        disease: analysis.results.disease,
        confidence: analysis.results.confidence,
        detections: analysis.results.detections || []
      },
      processingTime: `${(analysis.processingTime / 1000).toFixed(2)}s`,
      createdAt: analysis.createdAt
    }));

    res.status(200).json({
      success: true,
      message: '✅ Leaf Analysis Reports retrieved successfully',
      pagination: {
        currentPage: pageNumber,
        pageSize: pageSize,
        totalRecords: totalRecords,
        totalPages: Math.ceil(totalRecords / pageSize)
      },
      statistics: stats,
      data: data
    });
  } catch (error) {
    console.error('❌ Error fetching Leaf Analysis reports:', error.message);
    res.status(500).json({
      success: false,
      message: '❌ Failed to fetch Leaf Analysis reports',
      error: error.message
    });
  }
};

// ==================== DASHBOARD STATISTICS ====================

/**
 * Get dashboard overview statistics
 * - Admin only
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const totalBungaAnalyses = await BungaAnalysis.countDocuments();
    const totalLeafAnalyses = await LeafAnalysis.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // Get latest analyses
    const latestBunga = await BungaAnalysis.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const latestLeaf = await LeafAnalysis.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Calculate combined stats
    const allBungaAnalyses = await BungaAnalysis.find().lean();
    let ripeCount = 0,
      unripeCount = 0,
      rottenCount = 0;
    let avgConfidence = 0;

    allBungaAnalyses.forEach(analysis => {
      if (analysis.results.ripeness === 'Ripe') ripeCount++;
      else if (analysis.results.ripeness === 'Unripe') unripeCount++;
      else if (analysis.results.ripeness === 'Rotten') rottenCount++;
      avgConfidence += analysis.results.confidence;
    });

    avgConfidence = totalBungaAnalyses > 0 ? (avgConfidence / totalBungaAnalyses).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      message: '✅ Dashboard statistics retrieved successfully',
      overview: {
        totalAnalyses: totalBungaAnalyses + totalLeafAnalyses,
        totalBungaAnalyses,
        totalLeafAnalyses,
        totalUsers,
        totalAdmins,
        systemUsers: totalUsers + totalAdmins
      },
      bungaStatistics: {
        total: totalBungaAnalyses,
        ripeness: {
          Ripe: ripeCount,
          Unripe: unripeCount,
          Rotten: rottenCount
        },
        averageConfidence: avgConfidence
      },
      latestBungaAnalyses: latestBunga.map(a => ({
        _id: a._id,
        userName: a.user?.name,
        ripeness: a.results.ripeness,
        confidence: a.results.confidence,
        createdAt: a.createdAt
      })),
      latestLeafAnalyses: latestLeaf.map(a => ({
        _id: a._id,
        userName: a.user?.name,
        disease: a.results.disease,
        confidence: a.results.confidence,
        createdAt: a.createdAt
      }))
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error.message);
    res.status(500).json({
      success: false,
      message: '❌ Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

// ==================== FILTERING & SEARCH ====================

/**
 * Get Bunga Analysis reports filtered by specific criteria
 */
exports.filterBungaAnalyses = async (req, res) => {
  try {
    const { ripeness, marketGrade, healthClass, minConfidence, maxConfidence, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    const filter = {};

    if (ripeness) filter['results.ripeness'] = ripeness;
    if (marketGrade) filter['results.market_grade'] = marketGrade;
    if (healthClass) filter['results.health_class'] = healthClass;

    if (minConfidence || maxConfidence) {
      filter['results.confidence'] = {};
      if (minConfidence) filter['results.confidence'].$gte = parseInt(minConfidence);
      if (maxConfidence) filter['results.confidence'].$lte = parseInt(maxConfidence);
    }

    const totalRecords = await BungaAnalysis.countDocuments(filter);

    const analyses = await BungaAnalysis.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const data = analyses.map(analysis => ({
      _id: analysis._id,
      userName: analysis.user?.name || 'Unknown User',
      userEmail: analysis.user?.email || 'N/A',
      image: analysis.image,
      results: analysis.results,
      processingTime: `${(analysis.processingTime / 1000).toFixed(2)}s`,
      createdAt: analysis.createdAt
    }));

    res.status(200).json({
      success: true,
      message: '✅ Filtered Bunga Analysis retrieved successfully',
      pagination: {
        currentPage: pageNumber,
        pageSize: pageSize,
        totalRecords: totalRecords,
        totalPages: Math.ceil(totalRecords / pageSize)
      },
      data: data
    });
  } catch (error) {
    console.error('❌ Error filtering Bunga Analysis:', error.message);
    res.status(500).json({
      success: false,
      message: '❌ Failed to filter Bunga Analysis',
      error: error.message
    });
  }
};

/**
 * Get Leaf Analysis reports filtered by specific criteria
 */
exports.filterLeafAnalyses = async (req, res) => {
  try {
    const { disease, minConfidence, maxConfidence, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    const filter = {};

    if (disease) filter['results.disease'] = disease;

    if (minConfidence || maxConfidence) {
      filter['results.confidence'] = {};
      if (minConfidence) filter['results.confidence'].$gte = parseInt(minConfidence);
      if (maxConfidence) filter['results.confidence'].$lte = parseInt(maxConfidence);
    }

    const totalRecords = await LeafAnalysis.countDocuments(filter);

    const analyses = await LeafAnalysis.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    const data = analyses.map(analysis => ({
      _id: analysis._id,
      userName: analysis.user?.name || 'Unknown User',
      userEmail: analysis.user?.email || 'N/A',
      image: analysis.image,
      results: {
        disease: analysis.results.disease,
        confidence: analysis.results.confidence,
        detections: analysis.results.detections || []
      },
      processingTime: `${(analysis.processingTime / 1000).toFixed(2)}s`,
      createdAt: analysis.createdAt
    }));

    res.status(200).json({
      success: true,
      message: '✅ Filtered Leaf Analysis retrieved successfully',
      pagination: {
        currentPage: pageNumber,
        pageSize: pageSize,
        totalRecords: totalRecords,
        totalPages: Math.ceil(totalRecords / pageSize)
      },
      data: data
    });
  } catch (error) {
    console.error('❌ Error filtering Leaf Analysis:', error.message);
    res.status(500).json({
      success: false,
      message: '❌ Failed to filter Leaf Analysis',
      error: error.message
    });
  }
};
