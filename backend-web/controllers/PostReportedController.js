const ThreadReport = require('../models/ThreadReport');
const ForumThread = require('../models/ForumThread');
const User = require('../models/User');

// ==================== GET ALL REPORTED THREADS ====================

/**
 * Get all reported threads with filtering and pagination
 * - Admin only
 * Query params: page, limit, status, sortBy, sortOrder
 */
exports.getAllReportedPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    console.log(`\n📋 [Admin] Fetching reported threads - Page: ${pageNumber}, Status: ${status || 'all'}`);

    // Build filter
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Get total count
    const totalRecords = await ThreadReport.countDocuments(filter);
    console.log(`   Total reported threads: ${totalRecords}`);

    // Fetch reports with populated data
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const reports = await ThreadReport.find(filter)
      .populate({
        path: 'threadId',
        select: 'title description category status createdBy createdAt',
        populate: {
          path: 'createdBy',
          select: 'name email avatar'
        }
      })
      .populate({
        path: 'reportedBy',
        select: 'name email avatar'
      })
      .sort(sortObj)
      .skip(skip)
      .limit(pageSize)
      .lean();

    console.log(`   Fetched: ${reports.length} reports`);

    // Format response data
    const data = reports.map(report => ({
      _id: report._id,
      report: {
        id: report._id,
        reason: report.reason,
        status: report.status,
        adminNotes: report.adminNotes,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt
      },
      reportedBy: {
        id: report.reportedBy?._id,
        name: report.reportedBy?.name || 'Unknown User',
        email: report.reportedBy?.email || 'N/A',
        avatar: report.reportedBy?.avatar?.url || null
      },
      post: {
        id: report.threadId?._id,
        title: report.threadId?.title || 'Unknown Thread',
        content: report.threadId?.description || 'Thread content unavailable',
        category: report.threadId?.category || 'General',
        status: report.threadId?.status || 'unknown',
        createdAt: report.threadId?.createdAt
      },
      author: {
        id: report.threadId?.createdBy?._id,
        name: report.threadId?.createdBy?.name || 'Unknown Author',
        email: report.threadId?.createdBy?.email || 'N/A',
        avatar: report.threadId?.createdBy?.avatar?.url || null
      }
    }));

    res.status(200).json({
      success: true,
      message: '✅ Reported threads retrieved successfully',
      pagination: {
        currentPage: pageNumber,
        pageSize: pageSize,
        totalRecords: totalRecords,
        totalPages: Math.ceil(totalRecords / pageSize)
      },
      data: data
    });
  } catch (error) {
    console.error('❌ Error fetching reported threads:', error.message);
    res.status(500).json({
      success: false,
      message: '❌ Failed to fetch reported threads',
      error: error.message
    });
  }
};

// ==================== GET SINGLE REPORTED THREAD DETAIL ====================

/**
 * Get detailed information about a single report
 * - Admin only
 */
exports.getReportedPostDetail = async (req, res) => {
  try {
    const { reportId } = req.params;

    console.log(`\n🔍 [Admin] Fetching reported thread detail - Report ID: ${reportId}`);

    const report = await ThreadReport.findById(reportId)
      .populate({
        path: 'threadId',
        select: 'title description category status createdBy createdAt views repliesCount',
        populate: {
          path: 'createdBy',
          select: 'name email avatar contact address'
        }
      })
      .populate({
        path: 'reportedBy',
        select: 'name email avatar contact address'
      })
      .lean();

    if (!report) {
      console.warn('   ⚠️ Report not found');
      return res.status(404).json({
        success: false,
        message: '❌ Report not found'
      });
    }

    console.log(`   ✅ Report found - Status: ${report.status}`);

    const responseData = {
      _id: report._id,
      report: {
        id: report._id,
        reason: report.reason,
        status: report.status,
        adminNotes: report.adminNotes,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt
      },
      reportedBy: {
        id: report.reportedBy?._id,
        name: report.reportedBy?.name || 'Unknown User',
        email: report.reportedBy?.email || 'N/A',
        avatar: report.reportedBy?.avatar,
        contact: report.reportedBy?.contact,
        address: report.reportedBy?.address
      },
      post: {
        id: report.threadId?._id,
        title: report.threadId?.title || 'Unknown Thread',
        content: report.threadId?.description || 'Thread content unavailable',
        category: report.threadId?.category || 'General',
        status: report.threadId?.status,
        createdAt: report.threadId?.createdAt,
        views: report.threadId?.views || 0,
        repliesCount: report.threadId?.repliesCount || 0
      },
      author: {
        id: report.threadId?.createdBy?._id,
        name: report.threadId?.createdBy?.name || 'Unknown Author',
        email: report.threadId?.createdBy?.email || 'N/A',
        avatar: report.threadId?.createdBy?.avatar,
        contact: report.threadId?.createdBy?.contact,
        address: report.threadId?.createdBy?.address
      }
    };

    res.status(200).json({
      success: true,
      message: '✅ Report detail retrieved successfully',
      data: responseData
    });
  } catch (error) {
    console.error('❌ Error fetching report detail:', error.message);
    res.status(500).json({
      success: false,
      message: '❌ Failed to fetch report detail',
      error: error.message
    });
  }
};

// ==================== DELETE THREAD (Admin Action) ====================

/**
 * Admin deletes a reported thread and marks report as action-taken
 * - Admin only
 */
exports.deleteReportedPost = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { adminNotes } = req.body;

    console.log(`\n🗑️ [Admin] Deleting reported thread - Report ID: ${reportId}`);

    // Find the report
    const report = await ThreadReport.findById(reportId);
    if (!report) {
      console.warn('   ⚠️ Report not found');
      return res.status(404).json({
        success: false,
        message: '❌ Report not found'
      });
    }

    const threadId = report.threadId;

    // Delete the thread
    const deletedThread = await ForumThread.findByIdAndDelete(threadId);
    if (!deletedThread) {
      console.warn('   ⚠️ Thread not found');
      return res.status(404).json({
        success: false,
        message: '❌ Thread not found'
      });
    }

    // Update report status
    report.status = 'action-taken';
    report.adminNotes = adminNotes || 'Thread deleted due to violation';
    await report.save();

    console.log(`   ✅ Thread deleted and report marked as action-taken`);

    res.status(200).json({
      success: true,
      message: '✅ Thread deleted successfully',
      data: report
    });
  } catch (error) {
    console.error('❌ Error deleting thread:', error.message);
    res.status(500).json({
      success: false,
      message: '❌ Failed to delete thread',
      error: error.message
    });
  }
};

// ==================== DISMISS REPORT (Admin Action) ====================

/**
 * Admin dismisses a report without deleting the thread
 * - Admin only
 */
exports.dismissReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { adminNotes } = req.body;

    console.log(`\n✅ [Admin] Dismissing report - Report ID: ${reportId}`);

    const report = await ThreadReport.findById(reportId);
    if (!report) {
      console.warn('   ⚠️ Report not found');
      return res.status(404).json({
        success: false,
        message: '❌ Report not found'
      });
    }

    // Update report
    report.status = 'dismissed';
    report.adminNotes = adminNotes || 'Report dismissed - no action needed';
    await report.save();

    console.log(`   ✅ Report dismissed`);

    res.status(200).json({
      success: true,
      message: '✅ Report dismissed successfully',
      data: report
    });
  } catch (error) {
    console.error('❌ Error dismissing report:', error.message);
    res.status(500).json({
      success: false,
      message: '❌ Failed to dismiss report',
      error: error.message
    });
  }
};

// ==================== GET STATISTICS ====================

/**
 * Get statistics about reported threads
 * - Admin only
 */
exports.getReportedPostsStats = async (req, res) => {
  try {
    console.log(`\n📊 [Admin] Fetching reported threads statistics`);

    const totalReports = await ThreadReport.countDocuments();
    const pendingReports = await ThreadReport.countDocuments({ status: 'pending' });
    const reviewedReports = await ThreadReport.countDocuments({ status: 'reviewed' });
    const dismissedReports = await ThreadReport.countDocuments({ status: 'dismissed' });
    const actionTakenReports = await ThreadReport.countDocuments({ status: 'action-taken' });

    // Get most reported threads
    const mostReportedThreads = await ThreadReport.aggregate([
      {
        $group: {
          _id: '$threadId',
          reportCount: { $sum: 1 },
          statuses: { $push: '$status' }
        }
      },
      { $sort: { reportCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'forumthreads',
          localField: '_id',
          foreignField: '_id',
          as: 'threadDetails'
        }
      }
    ]);

    console.log(`   ✅ Stats gathered - Total: ${totalReports}, Pending: ${pendingReports}`);

    const stats = {
      total: totalReports,
      pending: pendingReports,
      reviewed: reviewedReports,
      dismissed: dismissedReports,
      actionTaken: actionTakenReports,
      percentages: {
        pending: totalReports > 0 ? ((pendingReports / totalReports) * 100).toFixed(2) : 0,
        reviewed: totalReports > 0 ? ((reviewedReports / totalReports) * 100).toFixed(2) : 0,
        dismissed: totalReports > 0 ? ((dismissedReports / totalReports) * 100).toFixed(2) : 0,
        actionTaken: totalReports > 0 ? ((actionTakenReports / totalReports) * 100).toFixed(2) : 0
      },
      mostReportedThreads: mostReportedThreads
    };

    res.status(200).json({
      success: true,
      message: '✅ Statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('❌ Error fetching statistics:', error.message);
    res.status(500).json({
      success: false,
      message: '❌ Failed to fetch statistics',
      error: error.message
    });
  }
};

// ==================== MARK AS REVIEWED (Admin Action) ====================

/**
 * Admin marks a report as reviewed
 * - Admin only
 */
exports.markAsReviewed = async (req, res) => {
  try {
    const { reportId } = req.params;

    console.log(`\n👀 [Admin] Marking report as reviewed - Report ID: ${reportId}`);

    const report = await ThreadReport.findById(reportId);
    if (!report) {
      console.warn('   ⚠️ Report not found');
      return res.status(404).json({
        success: false,
        message: '❌ Report not found'
      });
    }

    // Update report
    report.status = 'reviewed';
    await report.save();

    console.log(`   ✅ Report marked as reviewed`);

    res.status(200).json({
      success: true,
      message: '✅ Report marked as reviewed',
      data: report
    });
  } catch (error) {
    console.error('❌ Error marking as reviewed:', error.message);
    res.status(500).json({
      success: false,
      message: '❌ Failed to mark as reviewed',
      error: error.message
    });
  }
};
