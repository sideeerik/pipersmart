const User = require('../models/User');
const BungaAnalysis = require('../models/BungaAnalysis');
const LeafAnalysis = require('../models/LeafAnalysis');
const Notification = require('../models/Notification');
const ForumPost = require('../models/ForumPost');
const Macromapping = require('../models/Macromapping');

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
        createdAt: { $lt: nextDate }
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

    const [
      recentUsers,
      recentBungaAnalyses,
      recentLeafAnalyses,
      recentPosts,
      recentLocations
    ] = await Promise.all([
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email avatar createdAt"),
      BungaAnalysis.find()
        .sort({ createdAt: -1 })
        .limit(4)
        .populate("user", "name")
        .select("user results confidence createdAt"),
      LeafAnalysis.find()
        .sort({ createdAt: -1 })
        .limit(4)
        .populate("user", "name")
        .select("user results confidence createdAt"),
      ForumPost.find({ status: "published" })
        .sort({ createdAt: -1 })
        .limit(4)
        .populate("createdBy", "name")
        .select("createdBy content createdAt threadId"),
      Macromapping.find()
        .sort({ createdAt: -1 })
        .limit(4)
        .populate("user", "name")
        .select("user name displayName locationDetails latitude longitude createdAt")
    ]);

    // Combine and sort by date
    const activities = [
      ...recentUsers.map(u => ({
        type: "user_registration",
        title: `New user registered: ${u.name || "User"}`,
        description: u.email,
        timestamp: u.createdAt,
        icon: "USER"
      })),
      ...recentBungaAnalyses.map(b => {
        const userName = (typeof b.user?.name === 'string' && b.user.name.trim())
          ? b.user.name
          : (typeof b.userName === 'string' && b.userName.trim() ? b.userName : 'User');
        const ripeness = (typeof b.results?.ripeness === 'string' && b.results.ripeness.trim())
          ? b.results.ripeness
          : 'Unknown';
        return {
          type: "bunga_analysis",
          title: `${userName} completed bunga analysis`,
          description: `Ripeness: ${ripeness}`,
          timestamp: b.createdAt,
          icon: "BUNGA"
        };
      }),
      ...recentLeafAnalyses.map(l => {
        const userName = (typeof l.user?.name === 'string' && l.user.name.trim())
          ? l.user.name
          : (typeof l.userName === 'string' && l.userName.trim() ? l.userName : 'User');
        const disease = (typeof l.results?.disease === 'string' && l.results.disease.trim())
          ? l.results.disease
          : 'Unknown';
        return {
          type: "leaf_analysis",
          title: `${userName} completed leaf analysis`,
          description: `Disease: ${disease}`,
          timestamp: l.createdAt,
          icon: "LEAF"
        };
      }),
      ...recentPosts.map(p => ({
        type: "forum_post",
        title: `${p.createdBy?.name || "User"} posted in forum`,
        description: p.content ? `${p.content.substring(0, 60)}${p.content.length > 60 ? "..." : ""}` : "New forum post",
        timestamp: p.createdAt,
        icon: "POST"
      })),
      ...recentLocations.map(loc => ({
        type: "saved_location",
        title: `${loc.user?.name || "User"} saved a location`,
        description: loc.displayName || loc.name || "Saved location",
        timestamp: loc.createdAt,
        icon: "MAP"
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
      message: "Error fetching recent activity",
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
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      newThisWeek,
      activeTodayUsers,
      active30DaysUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Promise.all([
        User.distinct('_id', { createdAt: { $gte: startOfDay, $lte: endOfDay } }),
        BungaAnalysis.distinct('user', { createdAt: { $gte: startOfDay, $lte: endOfDay } }),
        LeafAnalysis.distinct('user', { createdAt: { $gte: startOfDay, $lte: endOfDay } }),
        ForumPost.distinct('createdBy', { status: 'published', createdAt: { $gte: startOfDay, $lte: endOfDay } }),
        Macromapping.distinct('user', { createdAt: { $gte: startOfDay, $lte: endOfDay } })
      ]),
      Promise.all([
        User.distinct('_id', { createdAt: { $gte: thirtyDaysAgo } }),
        BungaAnalysis.distinct('user', { createdAt: { $gte: thirtyDaysAgo } }),
        LeafAnalysis.distinct('user', { createdAt: { $gte: thirtyDaysAgo } }),
        ForumPost.distinct('createdBy', { status: 'published', createdAt: { $gte: thirtyDaysAgo } }),
        Macromapping.distinct('user', { createdAt: { $gte: thirtyDaysAgo } })
      ])
    ]);

    const activeTodaySet = new Set(
      activeTodayUsers.flat().filter(Boolean).map(id => id.toString())
    );
    const activeToday = activeTodaySet.size;

    const active30DaysSet = new Set(
      active30DaysUsers.flat().filter(Boolean).map(id => id.toString())
    );
    const inactive = Math.max(0, totalUsers - active30DaysSet.size);

    res.status(200).json({
      success: true,
      data: {
        activeToday,
        newThisWeek,
        inactive,
        totalUsers
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
