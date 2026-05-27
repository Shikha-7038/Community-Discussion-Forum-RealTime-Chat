const Discussion = require('../models/Discussion');
const Comment = require('../models/Comment');

// @desc    Get all discussions
// @route   GET /api/discussions
// @access  Public
const getDiscussions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const sort = req.query.sort || '-createdAt';

    // Build filter object
    let filter = {};
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Get discussions
    const discussions = await Discussion.find(filter)
      .populate('author', 'name email avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Discussion.countDocuments(filter);

    res.json({
      success: true,
      discussions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single discussion
// @route   GET /api/discussions/:id
// @access  Public
const getDiscussionById = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'name email avatar');

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Increment view count
    discussion.viewCount += 1;
    await discussion.save();

    // Get comments for this discussion
    const comments = await Comment.find({ discussion: req.params.id, parentComment: null })
      .populate('author', 'name email avatar')
      .sort('-createdAt');

    res.json({
      success: true,
      discussion,
      comments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a discussion
// @route   POST /api/discussions
// @access  Private
const createDiscussion = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    const discussion = await Discussion.create({
      title,
      content,
      author: req.user.id,
      category: category || 'General',
      tags: tags || []
    });

    const populatedDiscussion = await Discussion.findById(discussion._id)
      .populate('author', 'name email avatar');

    res.status(201).json({
      success: true,
      discussion: populatedDiscussion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a discussion
// @route   PUT /api/discussions/:id
// @access  Private
const updateDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is author
    if (discussion.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to edit this discussion' });
    }

    const { title, content, category, tags } = req.body;
    
    discussion.title = title || discussion.title;
    discussion.content = content || discussion.content;
    discussion.category = category || discussion.category;
    discussion.tags = tags || discussion.tags;
    discussion.updatedAt = Date.now();

    await discussion.save();

    const updatedDiscussion = await Discussion.findById(discussion._id)
      .populate('author', 'name email avatar');

    res.json({
      success: true,
      discussion: updatedDiscussion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a discussion
// @route   DELETE /api/discussions/:id
// @access  Private
const deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Check if user is author
    if (discussion.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this discussion' });
    }

    // Delete all comments associated with this discussion
    await Comment.deleteMany({ discussion: req.params.id });
    
    // Delete the discussion
    await discussion.deleteOne();

    res.json({
      success: true,
      message: 'Discussion deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Vote on a discussion
// @route   POST /api/discussions/:id/vote
// @access  Private
const voteDiscussion = async (req, res) => {
  try {
    const { voteType } = req.body;
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const alreadyUpvoted = discussion.upvotes.includes(req.user.id);
    const alreadyDownvoted = discussion.downvotes.includes(req.user.id);

    if (voteType === 'up') {
      if (alreadyUpvoted) {
        discussion.upvotes = discussion.upvotes.filter(id => id.toString() !== req.user.id);
      } else {
        discussion.upvotes.push(req.user.id);
        if (alreadyDownvoted) {
          discussion.downvotes = discussion.downvotes.filter(id => id.toString() !== req.user.id);
        }
      }
    } else if (voteType === 'down') {
      if (alreadyDownvoted) {
        discussion.downvotes = discussion.downvotes.filter(id => id.toString() !== req.user.id);
      } else {
        discussion.downvotes.push(req.user.id);
        if (alreadyUpvoted) {
          discussion.upvotes = discussion.upvotes.filter(id => id.toString() !== req.user.id);
        }
      }
    }

    await discussion.save();

    res.json({
      success: true,
      upvotes: discussion.upvotes.length,
      downvotes: discussion.downvotes.length,
      score: discussion.upvotes.length - discussion.downvotes.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDiscussions,
  getDiscussionById,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  voteDiscussion
};