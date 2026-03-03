const User = require('../models/User');
const BungaAnalysis = require('../models/BungaAnalysis');
const LeafAnalysis = require('../models/LeafAnalysis');
const Notification = require('../models/Notification');

// Get Dashboard Overview Stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Total Users
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const unverifiedUsers = await User.countDocuments({ isVerified: false });

    // Total Analyses
    const totalBungaAnalyses = await BungaAnalysis.countDocuments();
    const totalLeafAnalyses = await LeafAnalysis.countDocuments();
    const totalAnalyses = totalBungaAnalyses + totalLeafAnalyses;

    // This Month's Analyses
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
    const analysesThisMonth = await BungaAnalysis.countDocuments({
      createdAt: { $gte: startOfMonth, $lt: endOfMonth }
    }) + await LeafAnalysis.countDocuments({
      createdAt: { $gte: startOfMonth, $lt: endOfMonth }
    });

    // Today's Analyses
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const analysesToday = await BungaAnalysis.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    }) + await LeafAnalysis.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // New Users This Week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: startOfWeek }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        verifiedUsers,
        unverifiedUsers,
        totalAnalyses,
        totalBungaAnalyses,
        totalLeafAnalyses,
        analysesThisMonth,
        analysesToday,
        newUsersThisWeek
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

// Get User Growth (Last 7 days)
exports.getUserGrowth = async (req, res) => {
  try {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const count = await User.countDocuments({
        createdAt: { $gte: date, $lt: nextDate }
      });

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: count
      });
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user growth',
      error: error.message
    });
  }
};

// Get Analysis Distribution (Bunga vs Leaf)
exports.getAnalysisDistribution = async (req, res) => {
  try {
    const bungaCount = await BungaAnalysis.countDocuments();
    const leafCount = await LeafAnalysis.countDocuments();

    const data = [
      {
        name: 'Bunga Analysis',
        value: bungaCount,
        percentage: bungaCount + leafCount > 0 
          ? ((bungaCount / (bungaCount + leafCount)) * 100).toFixed(1)
          : 0
      },
      {
        name: 'Leaf Analysis',
        value: leafCount,
        percentage: bungaCount + leafCount > 0
          ? ((leafCount / (bungaCount + leafCount)) * 100).toFixed(1)
          : 0
      }
    ];

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analysis distribution',
      error: error.message
    });
  }
};

// Get Top Diseases
exports.getTopDiseases = async (req, res) => {
  try {
    const diseases = await LeafAnalysis.aggregate([
      {
        $group: {
          _id: '$results.disease',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const data = diseases.map((d, index) => ({
      rank: index + 1,
      disease: d._id || 'Unknown',
      count: d.count
    }));

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching top diseases',
      error: error.message
    });
  }
};

// Get Recent Activity Feed
exports.getRecentActivity = async (req, res) => {
  try {
    const limit = 10;
    
    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email avatar createdAt');

    // Get recent bunga analyses
    const recentBungaAnalyses = await BungaAnalysis.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('userName results confidence createdAt');

    // Get recent leaf analyses
    const recentLeafAnalyses = await LeafAnalysis.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('userName results confidence createdAt');

    // Combine and sort by date
    const activities = [
      ...recentUsers.map(u => ({
        type: 'user_registration',
        title: `New user registered: ${u.name}`,
        description: u.email,
        timestamp: u.createdAt,
        icon: '👤'
      })),
      ...recentBungaAnalyses.map(b => ({
        type: 'bunga_analysis',
        title: `${b.userName} completed bunga analysis`,
        description: `Ripeness: ${b.results?.ripeness || 'N/A'}`,
        timestamp: b.createdAt,
        icon: '🌶️'
      })),
      ...recentLeafAnalyses.map(l => ({
        type: 'leaf_analysis',
        title: `${l.userName} completed leaf analysis`,
        description: `Disease: ${l.results?.disease || 'N/A'}`,
        timestamp: l.createdAt,
        icon: '🍃'
      }))
    ];

    // Sort by timestamp and limit
    activities.sort((a, b) => b.timestamp - a.timestamp);
    const sortedActivities = activities.slice(0, limit);

    res.status(200).json({
      success: true,
      data: sortedActivities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activity',
      error: error.message
    });
  }
};

// Get Weekly Activity (Last 7 days)
exports.getWeeklyActivity = async (req, res) => {
  try {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const bungaCount = await BungaAnalysis.countDocuments({
        createdAt: { $gte: date, $lt: nextDate }
      });

      const leafCount = await LeafAnalysis.countDocuments({
        createdAt: { $gte: date, $lt: nextDate }
      });

      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        bunga: bungaCount,
        leaf: leafCount,
        total: bungaCount + leafCount
      });
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching weekly activity',
      error: error.message
    });
  }
};

// Get User Overview
exports.getUserOverview = async (req, res) => {
  try {
    // Active users today (users who logged in today)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const activeToday = await User.countDocuments({
      lastLogin: { $gte: startOfDay, $lte: endOfDay }
    });

    // New users this week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const newThisWeek = await User.countDocuments({
      createdAt: { $gte: startOfWeek }
    });

    // Inactive users (not logged in for 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const inactive = await User.countDocuments({
      lastLogin: { $lt: thirtyDaysAgo }
    });

    // Verified vs unverified
    const verified = await User.countDocuments({ isVerified: true });
    const unverified = await User.countDocuments({ isVerified: false });

    res.status(200).json({
      success: true,
      data: {
        activeToday,
        newThisWeek,
        inactive,
        verified,
        unverified,
        totalVerified: verified,
        totalUnverified: unverified
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user overview',
      error: error.message
    });
  }
};

// Get System Health
exports.getSystemHealth = async (req, res) => {
  try {
    const health = {
      apiStatus: 'online',
      database: 'connected',
      timestamp: new Date(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };

    res.status(200).json({
      success: true,
      health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching system health',
      error: error.message
    });
  }
};

// Get Complete Dashboard Data (All in one)
exports.getCompleteDashboard = async (req, res) => {
  try {
    // Stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isVerified: true });

    const totalBungaAnalyses = await BungaAnalysis.countDocuments();
    const totalLeafAnalyses = await LeafAnalysis.countDocuments();
    const totalAnalyses = totalBungaAnalyses + totalLeafAnalyses;

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
    const analysesThisMonth = await BungaAnalysis.countDocuments({
      createdAt: { $gte: startOfMonth, $lt: endOfMonth }
    }) + await LeafAnalysis.countDocuments({
      createdAt: { $gte: startOfMonth, $lt: endOfMonth }
    });

    // Recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email avatar createdAt');

    const recentBungaAnalyses = await BungaAnalysis.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select('userName results confidence createdAt');

    // Analysis distribution
    const analysisData = [
      { name: 'Bunga', value: totalBungaAnalyses },
      { name: 'Leaf', value: totalLeafAnalyses }
    ];

    res.status(200).json({
      success: true,
      dashboard: {
        stats: {
          totalUsers,
          activeUsers,
          verifiedUsers,
          totalAnalyses,
          totalBungaAnalyses,
          totalLeafAnalyses,
          analysesThisMonth
        },
        recentUsers,
        recentBungaAnalyses,
        analysisData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complete dashboard',
      error: error.message
    });
  }
};
