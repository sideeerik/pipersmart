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

    // Calculate detailed statistics (use full dataset for accuracy)
    const allAnalyses = await BungaAnalysis.find()
      .select('results processingTime')
      .lean();

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
    let ripenessClassStats = { A: 0, B: 0, C: 0, D: 0, Unknown: 0 };
    let confidenceSum = 0;
    let totalProcessingTime = 0;

    allAnalyses.forEach(analysis => {
      // Ripeness distribution
      if (analysis.results.ripeness === 'Ripe') ripeCount++;
      else if (analysis.results.ripeness === 'Unripe') unripeCount++;
      else if (analysis.results.ripeness === 'Rotten') rottenCount++;

      // Market Grade distribution
      const marketGrade = analysis.results.market_grade || 'Unknown';
      if (marketGradeStats[marketGrade] === undefined) {
        marketGradeStats[marketGrade] = 0;
      }
      marketGradeStats[marketGrade]++;

      // Health class distribution (from health_percentage)
      const healthPct = Number(analysis.results.health_percentage);
      const healthClass = classifyHealthClass(healthPct);
      if (healthClassStats[healthClass] === undefined) {
        healthClassStats[healthClass] = 0;
      }
      healthClassStats[healthClass]++;

      // Average confidence - ensure it's converted to number
      const confidence = parseFloat(analysis.results.confidence) || 0;
      confidenceSum += confidence;

      // Total processing time
      totalProcessingTime += analysis.processingTime || 0;

      // Ripeness class distribution (A/B/C/D from ripeness_percentage)
      const pct = Number(analysis.results.ripeness_percentage);
      let ripenessClass = 'Unknown';
      if (Number.isFinite(pct)) {
        if (pct >= 76) ripenessClass = 'A';
        else if (pct >= 51) ripenessClass = 'B';
        else if (pct >= 26) ripenessClass = 'C';
        else if (pct >= 0) ripenessClass = 'D';
      }
      ripenessClassStats[ripenessClass]++;
    });

    const totalAnalyses = allAnalyses.length;

    // Calculate percentages
    const stats = {
      totalRecords,
      recordsThisPage: analyses.length,
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
      ripenessClass: {
        A: totalAnalyses > 0 ? ((ripenessClassStats.A / totalAnalyses) * 100).toFixed(2) : 0,
        B: totalAnalyses > 0 ? ((ripenessClassStats.B / totalAnalyses) * 100).toFixed(2) : 0,
        C: totalAnalyses > 0 ? ((ripenessClassStats.C / totalAnalyses) * 100).toFixed(2) : 0,
        D: totalAnalyses > 0 ? ((ripenessClassStats.D / totalAnalyses) * 100).toFixed(2) : 0,
        Unknown: totalAnalyses > 0 ? ((ripenessClassStats.Unknown / totalAnalyses) * 100).toFixed(2) : 0,
        counts: ripenessClassStats
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
      message: 'Bunga Analysis Reports retrieved successfully',
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
    console.error('Error fetching Bunga Analysis reports:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Bunga Analysis reports',
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

      // Average confidence - ensure it's converted to number
      const confidence = parseFloat(analysis.results.confidence) || 0;
      confidenceSum += confidence;

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
      message: 'Leaf Analysis Reports retrieved successfully',
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
    console.error('Error fetching Leaf Analysis reports:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Leaf Analysis reports',
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
      avgConfidence += parseFloat(analysis.results.confidence) || 0;
    });

    const totalBungaCount = allBungaAnalyses.length;
    avgConfidence = totalBungaCount > 0 ? (avgConfidence / totalBungaCount).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
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
    console.error('Error fetching dashboard stats:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
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
      message: 'Filtered Bunga Analysis retrieved successfully',
      pagination: {
        currentPage: pageNumber,
        pageSize: pageSize,
        totalRecords: totalRecords,
        totalPages: Math.ceil(totalRecords / pageSize)
      },
      data: data
    });
  } catch (error) {
    console.error('Error filtering Bunga Analysis:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to filter Bunga Analysis',
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

    if (disease) {
      const regex = buildDiseaseRegex(disease);
      if (regex) {
        filter['results.disease'] = { $regex: regex };
      }
    }

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
      message: 'Filtered Leaf Analysis retrieved successfully',
      pagination: {
        currentPage: pageNumber,
        pageSize: pageSize,
        totalRecords: totalRecords,
        totalPages: Math.ceil(totalRecords / pageSize)
      },
      data: data
    });
  } catch (error) {
    console.error('Error filtering Leaf Analysis:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to filter Leaf Analysis',
      error: error.message
    });
  }
};

// ==================== PDF EXPORT ====================

/**
 * Export analytics data as PDF
 * Supports: bunga, leaf, all analyses, or activities
 */
exports.exportAnalyticsPDF = async (req, res) => {
  try {
    const { format = 'simple', dataType = 'all', filters = {} } = req.body;
    const PdfGenerator = require('../utils/PdfGenerator');

    // Validate inputs
    if (!['simple', 'full'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid format. Use "simple" or "full".'
      });
    }

    if (!['bunga', 'leaf', 'all', 'activities'].includes(dataType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dataType. Use "bunga", "leaf", "all", or "activities".'
      });
    }

    let data = [];
    let stats = {};

    // Fetch data based on type
    if (dataType === 'bunga' || dataType === 'all') {
      const bungaData = await fetchBungaData(filters);
      data.push(...bungaData.records);
      stats.bungaAnalyses = bungaData.stats;
    }

    if (dataType === 'leaf' || dataType === 'all') {
      const leafData = await fetchLeafData(filters);
      data.push(...leafData.records);
      stats.leafAnalyses = leafData.stats;
    }

    if (dataType === 'activities') {
      data = await fetchActivities(filters);
    }

    // Generate PDF
    const titleLabels = {
      bunga: 'Peppercorns',
      leaf: 'Leaf',
      all: 'All Analyses (Peppercorns + Leaf)',
      activities: 'Activities'
    };
    const titleLabel = titleLabels[dataType] || `${dataType.charAt(0).toUpperCase() + dataType.slice(1)}`;

    const pdfBuffer = await PdfGenerator.generateAnalyticsPDF(data, {
      format,
      title: `${titleLabel} Analytics Report`,
      stats,
      dataType
    });

    // Send PDF response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="analytics-${dataType}-${Date.now()}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('PDF export error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to export PDF',
      error: error.message
    });
  }
};

/**
 * Helper: Fetch Bunga Analysis data with filters
 */
async function fetchBungaData(filters) {
  try {
    const filter = {};

    const marketGrade = filters.market_grade || filters.marketGrade;
    const healthClass = filters.health_class || filters.healthClass;
    const minConfidence = filters.bungaMinConfidence ?? filters.minConfidence ?? filters.min_confidence;
    const maxConfidence = filters.bungaMaxConfidence ?? filters.maxConfidence ?? filters.max_confidence;
    const startDate = filters.startDate || filters.start_date;
    const endDate = filters.endDate || filters.end_date;

    if (filters.ripeness) filter['results.ripeness'] = filters.ripeness;
    if (marketGrade) filter['results.market_grade'] = marketGrade;
    if (healthClass) filter['results.health_class'] = healthClass;

    if (minConfidence || maxConfidence) {
      filter['results.confidence'] = {};
      if (minConfidence) filter['results.confidence'].$gte = parseInt(minConfidence);
      if (maxConfidence) filter['results.confidence'].$lte = parseInt(maxConfidence);
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      const start = normalizeStartDate(startDate);
      const end = normalizeEndDate(endDate);
      if (start) filter.createdAt.$gte = start;
      if (end) filter.createdAt.$lte = end;
    }

    const analyses = await BungaAnalysis.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate stats
    let ripeCount = 0, unripeCount = 0, rottenCount = 0;
    let confidenceSum = 0;
    const marketGradeCounts = { Premium: 0, Standard: 0, Commercial: 0, Reject: 0 };
    const healthClassCounts = { a: 0, b: 0, c: 0, d: 0 };
    const ripenessClassCounts = { A: 0, B: 0, C: 0, D: 0 };

    analyses.forEach(a => {
      const ripeness = (a.results.ripeness || '').toString();
      if (ripeness === 'Ripe') ripeCount++;
      else if (ripeness === 'Unripe') unripeCount++;
      else if (ripeness === 'Rotten') rottenCount++;

      const marketGrade = (a.results.market_grade || '').toString().toLowerCase();
      if (marketGrade.includes('premium')) marketGradeCounts.Premium += 1;
      else if (marketGrade.includes('standard')) marketGradeCounts.Standard += 1;
      else if (marketGrade.includes('commercial')) marketGradeCounts.Commercial += 1;
      else if (marketGrade.includes('reject')) marketGradeCounts.Reject += 1;

      const healthPct = Number(a.results.health_percentage);
      const healthClass = classifyHealthClass(healthPct);
      if (healthClassCounts[healthClass] !== undefined) {
        healthClassCounts[healthClass] += 1;
      }

      const ripenessPct = Number(a.results.ripeness_percentage);
      if (Number.isFinite(ripenessPct)) {
        if (ripenessPct >= 76) ripenessClassCounts.A += 1;
        else if (ripenessPct >= 51) ripenessClassCounts.B += 1;
        else if (ripenessPct >= 26) ripenessClassCounts.C += 1;
        else if (ripenessPct >= 0) ripenessClassCounts.D += 1;
      }

      confidenceSum += parseFloat(a.results.confidence) || 0;
    });

    const records = analyses.map(a => ({
      _id: a._id,
      userName: a.user?.name || 'Unknown',
      userEmail: a.user?.email,
      results: a.results,
      processingTime: a.processingTime,
      createdAt: a.createdAt
    }));

    return {
      records,
      stats: {
        total: analyses.length,
        avgConfidence: analyses.length > 0 ? (confidenceSum / analyses.length).toFixed(2) : 0,
        ripe: ripeCount,
        unripe: unripeCount,
        rotten: rottenCount,
        marketGradeCounts,
        healthClassCounts,
        ripenessClassCounts
      }
    };
  } catch (error) {
    console.error('Error fetching bunga data:', error);
    return { records: [], stats: {} };
  }
}

/**
 * Helper: Fetch Leaf Analysis data with filters
 */
async function fetchLeafData(filters) {
  try {
    const filter = {};

    const minConfidence = filters.leafMinConfidence ?? filters.minConfidence ?? filters.min_confidence;
    const maxConfidence = filters.leafMaxConfidence ?? filters.maxConfidence ?? filters.max_confidence;
    const startDate = filters.startDate || filters.start_date;
    const endDate = filters.endDate || filters.end_date;

    if (filters.disease) {
      const regex = buildDiseaseRegex(filters.disease);
      if (regex) {
        filter['results.disease'] = { $regex: regex };
      }
    }

    if (minConfidence || maxConfidence) {
      filter['results.confidence'] = {};
      if (minConfidence) filter['results.confidence'].$gte = parseInt(minConfidence);
      if (maxConfidence) filter['results.confidence'].$lte = parseInt(maxConfidence);
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      const start = normalizeStartDate(startDate);
      const end = normalizeEndDate(endDate);
      if (start) filter.createdAt.$gte = start;
      if (end) filter.createdAt.$lte = end;
    }

    const analyses = await LeafAnalysis.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    let confidenceSum = 0;
    let totalDetections = 0;
    const diseaseCounts = {};

    const normalizeDisease = (value = '') => {
      const cleaned = value.toString().trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
      if (!cleaned) return '';
      return cleaned.replace(/\b\w/g, (m) => m.toUpperCase());
    };

    analyses.forEach(a => {
      confidenceSum += parseFloat(a.results.confidence) || 0;
      totalDetections += (a.results.detections?.length || 0);
      const diseaseLabel = normalizeDisease(a.results.disease || '');
      if (diseaseLabel) {
        diseaseCounts[diseaseLabel] = (diseaseCounts[diseaseLabel] || 0) + 1;
      }
    });

    const records = analyses.map(a => ({
      _id: a._id,
      userName: a.user?.name || 'Unknown',
      userEmail: a.user?.email,
      results: a.results,
      processingTime: a.processingTime,
      createdAt: a.createdAt
    }));

    return {
      records,
      stats: {
        total: analyses.length,
        avgConfidence: analyses.length > 0 ? (confidenceSum / analyses.length).toFixed(2) : 0,
        totalDetections: totalDetections,
        avgDetectionsPerAnalysis: analyses.length > 0 ? (totalDetections / analyses.length).toFixed(2) : 0,
        diseaseCounts
      }
    };
  } catch (error) {
    console.error('Error fetching leaf data:', error);
    return { records: [], stats: {} };
  }
}

function normalizeStartDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function normalizeEndDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(23, 59, 59, 999);
  return date;
}

function classifyHealthClass(healthPct) {
  if (!Number.isFinite(healthPct)) return 'null';
  if (healthPct >= 76) return 'a';
  if (healthPct >= 51) return 'b';
  if (healthPct >= 26) return 'c';
  if (healthPct >= 0) return 'd';
  return 'null';
}

function buildDiseaseRegex(value) {
  const normalized = String(value || '')
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');
  if (!normalized) return null;
  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = `^${escaped.replace(/\s+/g, '[-_\\s]+')}$`;
  return new RegExp(pattern, 'i');
}

/**
 * Helper: Fetch activity data
 */
async function fetchActivities(filters) {
  try {
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email avatar createdAt')
      .lean();

    const recentBunga = await BungaAnalysis.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('userName results createdAt')
      .lean();

    const recentLeaf = await LeafAnalysis.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('userName results createdAt')
      .lean();

    const activities = [
      ...recentUsers.map(u => ({
        type: 'User Registration',
        userName: u.name,
        description: u.email,
        timestamp: u.createdAt
      })),
      ...recentBunga.map(b => ({
        type: 'Bunga Analysis',
        userName: b.userName,
        description: `Ripeness: ${b.results?.ripeness || 'N/A'}`,
        timestamp: b.createdAt
      })),
      ...recentLeaf.map(l => ({
        type: 'Leaf Analysis',
        userName: l.userName,
        description: `Disease: ${l.results?.disease || 'N/A'}`,
        timestamp: l.createdAt
      }))
    ];

    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Error fetching activities:', error);
    return [];
  }
}
