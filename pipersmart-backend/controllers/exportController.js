const BungaAnalysis = require('../models/BungaAnalysis');
const LeafAnalysis = require('../models/LeafAnalysis');
const ForumPost = require('../models/ForumPost');
const SavedLocation = require('../models/SavedLocation');
const User = require('../models/User');
const {
  generateActivityPDF,
  generateActivityWord,
  filterActivitiesByDate,
  filterActivitiesByType,
} = require('../utils/exportHelper');

function parseTypes(types) {
  if (!types) return [];

  if (Array.isArray(types)) {
    return types
      .flatMap((value) => String(value).split(','))
      .map((value) => value.trim())
      .filter(Boolean);
  }

  return String(types)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
}

async function fetchAllActivitiesForUser(userId) {
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
      .lean(),
  ]);

  return [
    ...bungaAnalyses.map((item) => ({
      _id: item._id,
      results: item.results,
      image: item.image,
      processingTime: item.processingTime,
      createdAt: item.createdAt,
      type: 'BUNGA_ANALYSIS',
      timestamp: new Date(item.createdAt).getTime(),
    })),
    ...leafAnalyses.map((item) => ({
      _id: item._id,
      results: item.results,
      image: item.image,
      processingTime: item.processingTime,
      createdAt: item.createdAt,
      type: 'LEAF_ANALYSIS',
      timestamp: new Date(item.createdAt).getTime(),
    })),
    ...forumPosts.map((item) => ({
      ...item,
      type: 'FORUM_POST',
      timestamp: new Date(item.createdAt).getTime(),
    })),
    ...savedLocations.map((item) => ({
      ...item,
      type: 'SAVED_LOCATION',
      timestamp: new Date(item.savedAt).getTime(),
    })),
  ];
}

function applyExportFilters(activities, query) {
  const { startDate, endDate, types, sort = 'newest' } = query;
  let filtered = activities;

  if (startDate && endDate) {
    filtered = filterActivitiesByDate(filtered, startDate, endDate);
  }

  const parsedTypes = parseTypes(types);
  if (parsedTypes.length > 0) {
    filtered = filterActivitiesByType(filtered, parsedTypes);
  }

  if (sort === 'oldest') {
    filtered.sort((a, b) => a.timestamp - b.timestamp);
  } else {
    filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  return filtered;
}

function getExportOptions(query) {
  const notes = typeof query.notes === 'string' ? query.notes.trim() : '';
  return {
    notes: notes ? notes.slice(0, 1000) : '',
  };
}

// ========== EXPORT RECENT ACTIVITIES AS PDF ==========
exports.exportActivitiesPDF = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('name email role');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const allActivities = await fetchAllActivitiesForUser(userId);
    const filteredActivities = applyExportFilters(allActivities, req.query);
    const exportOptions = getExportOptions(req.query);

    const pdfBuffer = await generateActivityPDF(user, filteredActivities, exportOptions);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="PiperSmart_Activities_${Date.now()}.pdf"`);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message,
    });
  }
};

// ========== EXPORT RECENT ACTIVITIES AS WORD ==========
exports.exportActivitiesWord = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('name email role');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const allActivities = await fetchAllActivitiesForUser(userId);
    const filteredActivities = applyExportFilters(allActivities, req.query);
    const exportOptions = getExportOptions(req.query);

    const wordBuffer = await generateActivityWord(user, filteredActivities, exportOptions);

    res.setHeader('Content-Type', 'application/msword');
    res.setHeader('Content-Disposition', `attachment; filename="PiperSmart_Activities_${Date.now()}.doc"`);
    return res.send(wordBuffer);
  } catch (error) {
    console.error('Error generating Word document:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating Word document',
      error: error.message,
    });
  }
};
