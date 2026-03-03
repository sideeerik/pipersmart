const BungaAnalysis = require('../models/BungaAnalysis');
const LeafAnalysis = require('../models/LeafAnalysis');
const ForumPost = require('../models/ForumPost');
const SavedLocation = require('../models/SavedLocation');

// ========== GET RECENT ACTIVITIES ==========
exports.getRecentActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    console.log(`📊 Fetching recent activities for user: ${userId}`);

    // Fetch all 4 types of activities
    const [bungaAnalyses, leafAnalyses, forumPosts, savedLocations] = await Promise.all([
      BungaAnalysis.find({ user: userId })
        .select('results image processingTime createdAt')
        .lean(),
      LeafAnalysis.find({ user: userId })
        .select('results image processingTime createdAt')
        .lean(),
      ForumPost.find({ createdBy: userId })
        .select('content threadId likesCount createdAt')
        .populate('threadId', 'title')
        .lean(),
      SavedLocation.find({ userId })
        .select('_id farm userNotes isFavorite rating savedAt')
        .lean()
    ]);

    // Combine all activities with type identifier
    const allActivities = [
      ...bungaAnalyses.map(item => ({
        _id: item._id,
        results: item.results,
        image: item.image,
        processingTime: item.processingTime,
        createdAt: item.createdAt,
        type: 'BUNGA_ANALYSIS',
        timestamp: new Date(item.createdAt).getTime()
      })),
      ...leafAnalyses.map(item => ({
        _id: item._id,
        results: item.results,
        image: item.image,
        processingTime: item.processingTime,
        createdAt: item.createdAt,
        type: 'LEAF_ANALYSIS',
        timestamp: new Date(item.createdAt).getTime()
      })),
      ...forumPosts.map(item => ({
        ...item,
        type: 'FORUM_POST',
        timestamp: new Date(item.createdAt).getTime()
      })),
      ...savedLocations.map(item => ({
        ...item,
        type: 'SAVED_LOCATION',
        timestamp: new Date(item.savedAt).getTime()
      }))
    ];

    // Sort by newest first (descending)
    allActivities.sort((a, b) => b.timestamp - a.timestamp);

    // Calculate pagination
    const totalActivities = allActivities.length;
    const totalPages = Math.ceil(totalActivities / limit);
    const paginatedActivities = allActivities.slice(skip, skip + limit);

    console.log(`✅ Retrieved ${paginatedActivities.length} activities (Page ${page}/${totalPages})`);

    res.status(200).json({
      success: true,
      data: {
        activities: paginatedActivities,
        pagination: {
          currentPage: page,
          totalPages,
          totalActivities,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching recent activities:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activities',
      error: error.message
    });
  }
};

// ========== GET RECENT ACTIVITIES (LIMITED - for HomeScreen) ==========
exports.getRecentActivitiesLimited = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 3;

    console.log(`📊 Fetching ${limit} recent activities for user: ${userId}`);

    // Fetch all 4 types of activities
    const [bungaAnalyses, leafAnalyses, forumPosts, savedLocations] = await Promise.all([
      BungaAnalysis.find({ user: userId })
        .select('results image processingTime createdAt')
        .lean(),
      LeafAnalysis.find({ user: userId })
        .select('results image processingTime createdAt')
        .lean(),
      ForumPost.find({ createdBy: userId })
        .select('content threadId likesCount createdAt')
        .populate('threadId', 'title')
        .lean(),
      SavedLocation.find({ userId })
        .select('_id farm userNotes isFavorite rating savedAt')
        .lean()
    ]);

    // Combine all activities with type identifier
    const allActivities = [
      ...bungaAnalyses.map(item => ({
        _id: item._id,
        results: item.results,
        image: item.image,
        processingTime: item.processingTime,
        createdAt: item.createdAt,
        type: 'BUNGA_ANALYSIS',
        timestamp: new Date(item.createdAt).getTime()
      })),
      ...leafAnalyses.map(item => ({
        _id: item._id,
        results: item.results,
        image: item.image,
        processingTime: item.processingTime,
        createdAt: item.createdAt,
        type: 'LEAF_ANALYSIS',
        timestamp: new Date(item.createdAt).getTime()
      })),
      ...forumPosts.map(item => ({
        ...item,
        type: 'FORUM_POST',
        timestamp: new Date(item.createdAt).getTime()
      })),
      ...savedLocations.map(item => ({
        ...item,
        type: 'SAVED_LOCATION',
        timestamp: new Date(item.savedAt).getTime()
      }))
    ];

    // Sort by newest first and limit to X items
    const recentActivities = allActivities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);

    console.log(`✅ Retrieved ${recentActivities.length} limited activities`);

    res.status(200).json({
      success: true,
      data: {
        activities: recentActivities
      }
    });
  } catch (error) {
    console.error('❌ Error fetching limited recent activities:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activities',
      error: error.message
    });
  }
};
