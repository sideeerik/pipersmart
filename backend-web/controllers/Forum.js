const ForumThread = require('../models/ForumThread');
const ForumPost = require('../models/ForumPost');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;
const { validateContent } = require('../utils/contentValidation');

// ============ FORUM THREADS ============

// Create new thread (or save as draft)
exports.createThread = async (req, res) => {
  try {
    const { title, description, category, status = 'published', images = [] } = req.body;
    
    // Handle both authenticated and unauthenticated requests
    // For now, use a default userId or require one in the request body
    let userId = req.user?._id;
    
    if (!userId && req.body.userId) {
      userId = req.body.userId;
    }
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    // Content moderation for threads
    const combinedContent = `${title} ${description}`;
    const validation = validateContent(combinedContent);
    
    if (!validation.isValid) {
      if (validation.severity === 'BLOCK') {
        // Bad words detected - block immediately
        return res.status(400).json({
          success: false,
          message: validation.message,
          severity: 'BLOCK',
          detectedWords: validation.badWordsFound
        });
      } else if (validation.severity === 'WARNING') {
        // Missing keywords - still block but with different message
        return res.status(400).json({
          success: false,
          message: validation.message,
          severity: 'WARNING'
        });
      }
    }

    const newThread = await ForumThread.create({
      title,
      description,
      category,
      status,
      images,
      createdBy: userId
    });

    const populatedThread = await newThread.populate('createdBy', 'firstName lastName email avatar');

    res.status(201).json({
      success: true,
      message: status === 'draft' ? 'Draft saved successfully' : 'Thread posted successfully',
      data: populatedThread
    });
  } catch (error) {
    console.error('❌ Error creating thread:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all threads (published only, or with drafts for owner)
exports.getAllThreads = async (req, res) => {
  try {
    const { category, page = 1, limit = 20, search } = req.query;
    const userId = req.user?._id;

    let query = { status: 'published' };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    // Use aggregation to get threads with repliesCount in one query
    const threads = await ForumThread.aggregate([
      { $match: query },
      { $sort: { lastActivity: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      { $lookup: {
        from: 'forumposts',
        let: { threadId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$threadId', '$$threadId'] }, status: 'published' } },
          { $count: 'count' }
        ],
        as: 'repliesData'
      }},
      { $addFields: {
        repliesCount: { $cond: [{ $gt: [{ $size: '$repliesData' }, 0] }, { $arrayElemAt: ['$repliesData.count', 0] }, 0] }
      }},
      { $project: { repliesData: 0 } }
    ]);

    // Populate createdBy for each thread
    await ForumThread.populate(threads, { path: 'createdBy', select: 'firstName lastName email avatar' });

    const total = await ForumThread.countDocuments(query);

    res.status(200).json({
      success: true,
      data: threads,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's draft threads
exports.getDraftThreads = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const userId = req.user._id;
    const drafts = await ForumThread.find({ createdBy: userId, status: 'draft' })
      .populate('createdBy', 'firstName lastName email avatar')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: drafts,
      count: drafts.length
    });
  } catch (error) {
    console.error('❌ Error fetching drafts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single thread with all posts
exports.getThreadById = async (req, res) => {
  try {
    const { threadId } = req.params;

    const thread = await ForumThread.findById(threadId)
      .populate('createdBy', 'firstName lastName email avatar');

    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    const posts = await ForumPost.find({ threadId, status: 'published' })
      .populate('createdBy', 'firstName lastName email avatar')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: {
        thread,
        posts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update thread (edit own)
exports.updateThread = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { threadId } = req.params;
    const { title, description, category, status, images } = req.body;
    const userId = req.user._id;

    const thread = await ForumThread.findById(threadId);

    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    if (thread.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this thread' });
    }

    // Content moderation for thread updates
    const combinedContent = `${title || thread.title} ${description || thread.description}`;
    const validation = validateContent(combinedContent);
    
    if (!validation.isValid) {
      if (validation.severity === 'BLOCK') {
        return res.status(400).json({
          success: false,
          message: validation.message,
          severity: 'BLOCK',
          detectedWords: validation.badWordsFound
        });
      } else if (validation.severity === 'WARNING') {
        return res.status(400).json({
          success: false,
          message: validation.message,
          severity: 'WARNING'
        });
      }
    }

    thread.title = title || thread.title;
    thread.description = description || thread.description;
    thread.category = category || thread.category;
    thread.status = status || thread.status;
    if (images) thread.images = images;

    await thread.save();

    const populatedThread = await thread.populate('createdBy', 'firstName lastName email avatar');

    res.status(200).json({
      success: true,
      message: 'Thread updated successfully',
      data: populatedThread
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete thread (own only)
exports.deleteThread = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { threadId } = req.params;
    const userId = req.user._id;

    const thread = await ForumThread.findById(threadId);

    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    if (thread.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this thread' });
    }

    // Delete all posts in thread
    await ForumPost.deleteMany({ threadId });

    await ForumThread.findByIdAndDelete(threadId);

    res.status(200).json({ success: true, message: 'Thread deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Like/Unlike thread
exports.toggleLikeThread = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { threadId } = req.params;
    const userId = req.user._id;

    const thread = await ForumThread.findById(threadId);

    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    const likeIndex = thread.likes.indexOf(userId);

    if (likeIndex > -1) {
      thread.likes.splice(likeIndex, 1);
      thread.likesCount -= 1;
    } else {
      thread.likes.push(userId);
      thread.likesCount += 1;
    }

    await thread.save();

    res.status(200).json({
      success: true,
      message: likeIndex > -1 ? 'Like removed' : 'Thread liked',
      data: {
        likesCount: thread.likesCount,
        isLiked: likeIndex === -1
      }
    });
  } catch (error) {
    console.error('❌ Error liking thread:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Increment view count
exports.incrementViewCount = async (req, res) => {
  try {
    const { threadId } = req.params;

    const thread = await ForumThread.findByIdAndUpdate(
      threadId,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    res.status(200).json({
      success: true,
      message: 'View count incremented',
      data: {
        views: thread.views
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ GET ALL POSTS FROM ALL USERS (PUBLIC FEED) ============
exports.getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const pageLimit = Math.min(parseInt(limit), 50); // Max 50 per page

    // Fetch all published posts from all users and threads
    const posts = await ForumPost.find({ status: 'published' })
      .populate('createdBy', 'firstName lastName avatar email')
      .populate('threadId', 'title _id category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .lean();

    // Count total for pagination
    const total = await ForumPost.countDocuments({ status: 'published' });

    console.log(`✅ [getAllPosts] Fetched ${posts.length} posts, page ${page}`);
    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        total,
        pages: Math.ceil(total / pageLimit),
        currentPage: parseInt(page),
        limit: pageLimit
      }
    });
  } catch (error) {
    console.error('❌ [getAllPosts] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch posts: ' + error.message });
  }
};

// ============ GET ALL POSTS BY A SPECIFIC USER ============
exports.getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const pageLimit = Math.min(parseInt(limit), 50);

    // Fetch all published posts from a specific user
    const posts = await ForumPost.find({ createdBy: userId, status: 'published' })
      .populate('createdBy', 'firstName lastName avatar email')
      .populate('threadId', 'title _id category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .lean();

    const total = await ForumPost.countDocuments({ createdBy: userId, status: 'published' });

    console.log(`✅ [getPostsByUser] Fetched ${posts.length} posts for user ${userId}`);
    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        total,
        pages: Math.ceil(total / pageLimit),
        currentPage: parseInt(page),
        limit: pageLimit
      }
    });
  } catch (error) {
    console.error('❌ [getPostsByUser] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch user posts: ' + error.message });
  }
};

// ============ FORUM POSTS/COMMENTS ============

// Create post/reply on thread
exports.createPost = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { threadId } = req.params;
    const { content, status = 'published', images = [] } = req.body;
    const userId = req.user._id;

    const thread = await ForumThread.findById(threadId);

    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    if (!content) {
      return res.status(400).json({ success: false, message: 'Content is required' });
    }

    // Content moderation for posts
    const validation = validateContent(content);
    
    if (!validation.isValid) {
      if (validation.severity === 'BLOCK') {
        return res.status(400).json({
          success: false,
          message: validation.message,
          severity: 'BLOCK',
          detectedWords: validation.badWordsFound
        });
      } else if (validation.severity === 'WARNING') {
        return res.status(400).json({
          success: false,
          message: validation.message,
          severity: 'WARNING'
        });
      }
    }

    const newPost = await ForumPost.create({
      threadId,
      content,
      status,
      images,
      createdBy: userId
    });

    // Update thread's last activity and reply count if published
    if (status === 'published') {
      thread.lastActivity = new Date();
      thread.repliesCount += 1;
      await thread.save();
    }

    const populatedPost = await newPost.populate('createdBy', 'firstName lastName email avatar');

    res.status(201).json({
      success: true,
      message: status === 'draft' ? 'Reply saved as draft' : 'Reply posted successfully',
      data: populatedPost
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { postId } = req.params;
    const { content, status, images } = req.body;
    const userId = req.user._id;

    const post = await ForumPost.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this post' });
    }

    // Content moderation for post updates
    if (content) {
      const validation = validateContent(content);
      
      if (!validation.isValid) {
        if (validation.severity === 'BLOCK') {
          return res.status(400).json({
            success: false,
            message: validation.message,
            severity: 'BLOCK',
            detectedWords: validation.badWordsFound
          });
        } else if (validation.severity === 'WARNING') {
          return res.status(400).json({
            success: false,
            message: validation.message,
            severity: 'WARNING'
          });
        }
      }
    }

    post.content = content || post.content;
    post.status = status || post.status;
    if (images) post.images = images;
    post.isEdited = true;
    post.editedAt = new Date();

    await post.save();

    const populatedPost = await post.populate('createdBy', 'firstName lastName email avatar');

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: populatedPost
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { postId } = req.params;
    const userId = req.user._id;

    const post = await ForumPost.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    const threadId = post.threadId;

    await ForumPost.findByIdAndDelete(postId);

    // Update thread reply count
    const thread = await ForumThread.findById(threadId);
    if (thread && post.status === 'published') {
      thread.repliesCount -= 1;
      await thread.save();
    }

    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Like/Unlike post
exports.toggleLikePost = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { postId } = req.params;
    const userId = req.user._id;

    const post = await ForumPost.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(userId);

    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
      post.likesCount -= 1;
    } else {
      post.likes.push(userId);
      post.likesCount += 1;
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: likeIndex > -1 ? 'Like removed' : 'Post liked',
      data: {
        likesCount: post.likesCount,
        isLiked: likeIndex === -1
      }
    });
  } catch (error) {
    console.error('❌ Error liking post:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's draft posts
exports.getDraftPosts = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const userId = req.user._id;
    const drafts = await ForumPost.find({ createdBy: userId, status: 'draft' })
      .populate('threadId', 'title')
      .populate('createdBy', 'firstName lastName email avatar')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: drafts,
      count: drafts.length
    });
  } catch (error) {
    console.error('❌ Error fetching draft posts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ FAST FEED - GET ALL POSTS/THREADS ============
exports.getFastFeed = async (req, res) => {
  try {
    const { filterType = 'all' } = req.query; // 'all' or 'friends'
    const userId = req.user?._id;

    let userQuery = {};
    
    if (filterType === 'friends' && userId) {
      // Get user's friends
      const user = await User.findById(userId).select('friends');
      const friendIds = user?.friends || [];
      userQuery = { createdBy: { $in: [...friendIds, userId] } }; // Include own posts too
    }

    // Get user's uninterested thread IDs to exclude
    const PostInteraction = require('../models/PostInteraction');
    const ThreadInteraction = require('../models/ThreadInteraction');
    
    const uninterestedThreads = await ThreadInteraction.find({ 
      userId, 
      interactionType: 'uninterested' 
    }).select('threadId');
    const uninterestedIds = uninterestedThreads.map(t => t.threadId);

    // Fetch only threads (no posts) - much faster, posts load separately
    // Exclude uninterested threads for this user
    const threads = await ForumThread.find({ 
      status: 'published', 
      ...userQuery,
      _id: { $nin: uninterestedIds }
    })
      .select('_id title description createdBy createdAt lastActivity views likesCount repliesCount')
      .populate('createdBy', 'firstName lastName avatar')
      .sort({ lastActivity: -1 })
      .limit(30)
      .lean();

    console.log(`✅ [getFastFeed] Fetched ${threads.length} threads (${filterType}), excluded ${uninterestedIds.length} uninterested`);
    res.status(200).json({
      success: true,
      data: threads
    });
  } catch (error) {
    console.error('❌ [getFastFeed] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch feed: ' + error.message });
  }
};

// ============ POST INTERACTIONS (INTERESTED/UNINTERESTED) ============

// Mark post as interested
exports.markInterested = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { postId } = req.params;
    const userId = req.user._id;
    const PostInteraction = require('../models/PostInteraction');

    // Check if post exists
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Find or create interaction
    let interaction = await PostInteraction.findOne({ postId, userId });
    if (!interaction) {
      interaction = new PostInteraction({ postId, userId, interactionType: 'interested' });
    } else {
      interaction.interactionType = 'interested';
    }
    await interaction.save();

    console.log(`✅ [markInterested] User ${userId} marked post ${postId} as interested`);
    res.status(200).json({
      success: true,
      message: 'Post marked as interested',
      data: interaction
    });
  } catch (error) {
    console.error('❌ [markInterested] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark post as uninterested
exports.markUninterested = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { postId } = req.params;
    const userId = req.user._id;
    const PostInteraction = require('../models/PostInteraction');

    // Check if post exists
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Find or create interaction
    let interaction = await PostInteraction.findOne({ postId, userId });
    if (!interaction) {
      interaction = new PostInteraction({ postId, userId, interactionType: 'uninterested' });
    } else {
      interaction.interactionType = 'uninterested';
    }
    await interaction.save();

    console.log(`✅ [markUninterested] User ${userId} marked post ${postId} as uninterested`);
    res.status(200).json({
      success: true,
      message: 'Post marked as uninterested',
      data: interaction
    });
  } catch (error) {
    console.error('❌ [markUninterested] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ SAVE POSTS ============

// Save/Unsave post
exports.toggleSavePost = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { postId } = req.params;
    const userId = req.user._id;
    const SavedPost = require('../models/SavedPost');

    // Check if post exists
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if already saved
    const existingSave = await SavedPost.findOne({ postId, userId });
    
    if (existingSave) {
      // Remove save
      await SavedPost.deleteOne({ postId, userId });
      console.log(`✅ [toggleSavePost] Post ${postId} unsaved by user ${userId}`);
      res.status(200).json({
        success: true,
        message: 'Post unsaved',
        isSaved: false
      });
    } else {
      // Save post
      const savedPost = new SavedPost({ postId, userId });
      await savedPost.save();
      console.log(`✅ [toggleSavePost] Post ${postId} saved by user ${userId}`);
      res.status(200).json({
        success: true,
        message: 'Post saved',
        isSaved: true,
        data: savedPost
      });
    }
  } catch (error) {
    console.error('❌ [toggleSavePost] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's saved posts
exports.getUserSavedPosts = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;
    const SavedPost = require('../models/SavedPost');

    const skip = (page - 1) * limit;
    const pageLimit = Math.min(parseInt(limit), 50);

    // Get saved posts
    const savedPosts = await SavedPost.find({ userId })
      .populate({
        path: 'postId',
        populate: [
          { path: 'createdBy', select: 'firstName lastName avatar' },
          { path: 'threadId', select: 'title _id category' }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .lean();

    const total = await SavedPost.countDocuments({ userId });

    console.log(`✅ [getUserSavedPosts] Fetched ${savedPosts.length} saved posts for user ${userId}`);
    res.status(200).json({
      success: true,
      data: savedPosts,
      pagination: {
        total,
        pages: Math.ceil(total / pageLimit),
        currentPage: parseInt(page),
        limit: pageLimit
      }
    });
  } catch (error) {
    console.error('❌ [getUserSavedPosts] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ REPORT POSTS ============

// Report a post
exports.reportPost = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { postId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;
    const PostReport = require('../models/PostReport');

    // Validate reason
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a reason for the report' });
    }

    // Check if post exists
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // Check if already reported by this user
    const existingReport = await PostReport.findOne({ postId, reportedBy: userId, status: 'pending' });
    if (existingReport) {
      return res.status(400).json({ success: false, message: 'You have already reported this post' });
    }

    // Create report
    const report = new PostReport({
      postId,
      reportedBy: userId,
      reason: reason.trim()
    });
    await report.save();

    console.log(`✅ [reportPost] Post ${postId} reported by user ${userId}`);
    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report
    });
  } catch (error) {
    console.error('❌ [reportPost] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's interactions for a post
exports.getPostInteraction = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { postId } = req.params;
    const userId = req.user._id;
    const PostInteraction = require('../models/PostInteraction');
    const SavedPost = require('../models/SavedPost');

    const interaction = await PostInteraction.findOne({ postId, userId });
    const savedPost = await SavedPost.findOne({ postId, userId });

    res.status(200).json({
      success: true,
      data: {
        postId,
        interaction: interaction?.interactionType || 'none',
        isSaved: !!savedPost
      }
    });
  } catch (error) {
    console.error('❌ [getPostInteraction] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ THREAD INTERACTIONS (INTERESTED/UNINTERESTED) ============

// Mark thread as interested
exports.markInterestedThread = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { threadId } = req.params;
    const userId = req.user._id;
    const ThreadInteraction = require('../models/ThreadInteraction');

    // Check if thread exists
    const thread = await ForumThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    // Find or create interaction
    let interaction = await ThreadInteraction.findOne({ threadId, userId });
    if (!interaction) {
      interaction = new ThreadInteraction({ threadId, userId, interactionType: 'interested' });
    } else {
      interaction.interactionType = 'interested';
    }
    await interaction.save();

    console.log(`✅ [markInterestedThread] User ${userId} marked thread ${threadId} as interested`);
    res.status(200).json({
      success: true,
      message: 'Thread marked as interested',
      data: interaction
    });
  } catch (error) {
    console.error('❌ [markInterestedThread] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark thread as uninterested
exports.markUninterestedThread = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { threadId } = req.params;
    const userId = req.user._id;
    const ThreadInteraction = require('../models/ThreadInteraction');

    // Check if thread exists
    const thread = await ForumThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    // Find or create interaction
    let interaction = await ThreadInteraction.findOne({ threadId, userId });
    if (!interaction) {
      interaction = new ThreadInteraction({ threadId, userId, interactionType: 'uninterested' });
    } else {
      interaction.interactionType = 'uninterested';
    }
    await interaction.save();

    console.log(`✅ [markUninterestedThread] User ${userId} marked thread ${threadId} as uninterested`);
    res.status(200).json({
      success: true,
      message: 'Thread marked as uninterested',
      data: interaction
    });
  } catch (error) {
    console.error('❌ [markUninterestedThread] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ SAVE THREADS ============

// Save/Unsave thread
exports.toggleSaveThread = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { threadId } = req.params;
    const userId = req.user._id;
    const SavedThread = require('../models/SavedThread');

    // Check if thread exists
    const thread = await ForumThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    // Check if already saved
    const existingSave = await SavedThread.findOne({ threadId, userId });
    
    if (existingSave) {
      // Remove save
      await SavedThread.deleteOne({ threadId, userId });
      console.log(`✅ [toggleSaveThread] Thread ${threadId} unsaved by user ${userId}`);
      res.status(200).json({
        success: true,
        message: 'Thread unsaved',
        isSaved: false
      });
    } else {
      // Save thread
      const savedThread = new SavedThread({ threadId, userId });
      await savedThread.save();
      console.log(`✅ [toggleSaveThread] Thread ${threadId} saved by user ${userId}`);
      res.status(200).json({
        success: true,
        message: 'Thread saved',
        isSaved: true,
        data: savedThread
      });
    }
  } catch (error) {
    console.error('❌ [toggleSaveThread] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's saved threads
exports.getUserSavedThreads = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;
    const SavedThread = require('../models/SavedThread');

    const skip = (page - 1) * limit;
    const pageLimit = Math.min(parseInt(limit), 50);

    // Get saved threads
    const savedThreads = await SavedThread.find({ userId })
      .populate({
        path: 'threadId',
        populate: { path: 'createdBy', select: 'firstName lastName avatar' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .lean();

    const total = await SavedThread.countDocuments({ userId });

    console.log(`✅ [getUserSavedThreads] Fetched ${savedThreads.length} saved threads for user ${userId}`);
    res.status(200).json({
      success: true,
      data: savedThreads,
      pagination: {
        total,
        pages: Math.ceil(total / pageLimit),
        currentPage: parseInt(page),
        limit: pageLimit
      }
    });
  } catch (error) {
    console.error('❌ [getUserSavedThreads] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ REPORT THREADS ============

// Report a thread
exports.reportThread = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { threadId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;
    const ThreadReport = require('../models/ThreadReport');

    // Validate reason
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a reason for the report' });
    }

    // Check if thread exists
    const thread = await ForumThread.findById(threadId);
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    // Check if already reported by this user
    const existingReport = await ThreadReport.findOne({ threadId, reportedBy: userId, status: 'pending' });
    if (existingReport) {
      return res.status(400).json({ success: false, message: 'You have already reported this thread' });
    }

    // Create report
    const report = new ThreadReport({
      threadId,
      reportedBy: userId,
      reason: reason.trim()
    });
    await report.save();

    console.log(`✅ [reportThread] Thread ${threadId} reported by user ${userId}`);
    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report
    });
  } catch (error) {
    console.error('❌ [reportThread] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's interaction for a thread
exports.getThreadInteraction = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { threadId } = req.params;
    const userId = req.user._id;
    const ThreadInteraction = require('../models/ThreadInteraction');
    const SavedThread = require('../models/SavedThread');

    const interaction = await ThreadInteraction.findOne({ threadId, userId });
    const savedThread = await SavedThread.findOne({ threadId, userId });

    res.status(200).json({
      success: true,
      data: {
        threadId,
        interaction: interaction?.interactionType || 'none',
        isSaved: !!savedThread
      }
    });
  } catch (error) {
    console.error('❌ [getThreadInteraction] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ GET USER'S INTERESTED THREADS ============

exports.getInterestedThreads = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;
    const ThreadInteraction = require('../models/ThreadInteraction');

    const skip = (page - 1) * limit;
    const pageLimit = Math.min(parseInt(limit), 50);

    // Get interested threads
    const interestedThreads = await ThreadInteraction.find({ userId, interactionType: 'interested' })
      .populate({
        path: 'threadId',
        select: 'title description createdBy createdAt lastActivity views likesCount repliesCount',
        populate: { path: 'createdBy', select: 'firstName lastName avatar' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .lean();

    const total = await ThreadInteraction.countDocuments({ userId, interactionType: 'interested' });

    console.log(`✅ [getInterestedThreads] Fetched ${interestedThreads.length} interested threads for user ${userId}`);
    res.status(200).json({
      success: true,
      data: interestedThreads.map(t => t.threadId),
      pagination: {
        total,
        pages: Math.ceil(total / pageLimit),
        currentPage: parseInt(page),
        limit: pageLimit
      }
    });
  } catch (error) {
    console.error('❌ [getInterestedThreads] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============ GET USER'S UNINTERESTED THREADS ============

exports.getUninterestedThreads = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;
    const ThreadInteraction = require('../models/ThreadInteraction');

    const skip = (page - 1) * limit;
    const pageLimit = Math.min(parseInt(limit), 50);

    // Get uninterested threads
    const uninterestedThreads = await ThreadInteraction.find({ userId, interactionType: 'uninterested' })
      .populate({
        path: 'threadId',
        select: 'title description createdBy createdAt lastActivity views likesCount repliesCount',
        populate: { path: 'createdBy', select: 'firstName lastName avatar' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit)
      .lean();

    const total = await ThreadInteraction.countDocuments({ userId, interactionType: 'uninterested' });

    console.log(`✅ [getUninterestedThreads] Fetched ${uninterestedThreads.length} uninterested threads for user ${userId}`);
    res.status(200).json({
      success: true,
      data: uninterestedThreads.map(t => t.threadId),
      pagination: {
        total,
        pages: Math.ceil(total / pageLimit),
        currentPage: parseInt(page),
        limit: pageLimit
      }
    });
  } catch (error) {
    console.error('❌ [getUninterestedThreads] Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
