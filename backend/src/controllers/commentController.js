const Comment = require('../models/Comment');
const Discussion = require('../models/Discussion');

// @desc    Create a comment
// @route   POST /api/comments
// @access  Private
const createComment = async (req, res) => {
  try {
    const { content, discussionId, parentCommentId } = req.body;

    // Check if discussion exists
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    // Create comment
    const comment = await Comment.create({
      content,
      author: req.user.id,
      discussion: discussionId,
      parentComment: parentCommentId || null
    });

    // Increment comment count on discussion
    discussion.commentCount += 1;
    await discussion.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'name email avatar');

    // Emit socket event for new comment
    const io = req.app.get('io');
    io.to(`discussion-${discussionId}`).emit('newComment', {
      comment: populatedComment,
      discussionId
    });

    res.status(201).json({
      success: true,
      comment: populatedComment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is author
    if (comment.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to edit this comment' });
    }

    comment.content = req.body.content;
    await comment.save();

    const updatedComment = await Comment.findById(comment._id)
      .populate('author', 'name email avatar');

    res.json({
      success: true,
      comment: updatedComment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is author
    if (comment.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this comment' });
    }

    // Decrement comment count on discussion
    const discussion = await Discussion.findById(comment.discussion);
    if (discussion) {
      discussion.commentCount -= 1;
      await discussion.save();
    }

    await comment.deleteOne();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Vote on a comment
// @route   POST /api/comments/:id/vote
// @access  Private
const voteComment = async (req, res) => {
  try {
    const { voteType } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const alreadyUpvoted = comment.upvotes.includes(req.user.id);
    const alreadyDownvoted = comment.downvotes.includes(req.user.id);

    if (voteType === 'up') {
      if (alreadyUpvoted) {
        comment.upvotes = comment.upvotes.filter(id => id.toString() !== req.user.id);
      } else {
        comment.upvotes.push(req.user.id);
        if (alreadyDownvoted) {
          comment.downvotes = comment.downvotes.filter(id => id.toString() !== req.user.id);
        }
      }
    } else if (voteType === 'down') {
      if (alreadyDownvoted) {
        comment.downvotes = comment.downvotes.filter(id => id.toString() !== req.user.id);
      } else {
        comment.downvotes.push(req.user.id);
        if (alreadyUpvoted) {
          comment.upvotes = comment.upvotes.filter(id => id.toString() !== req.user.id);
        }
      }
    }

    await comment.save();

    res.json({
      success: true,
      upvotes: comment.upvotes.length,
      downvotes: comment.downvotes.length,
      score: comment.upvotes.length - comment.downvotes.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createComment,
  updateComment,
  deleteComment,
  voteComment
};