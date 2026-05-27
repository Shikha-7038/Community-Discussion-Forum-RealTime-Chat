const express = require('express');
const router = express.Router();
const {
  getDiscussions,
  getDiscussionById,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  voteDiscussion
} = require('../controllers/discussionController');
const { protect } = require('../middleware/auth');

router.get('/', getDiscussions);
router.get('/:id', getDiscussionById);
router.post('/', protect, createDiscussion);
router.put('/:id', protect, updateDiscussion);
router.delete('/:id', protect, deleteDiscussion);
router.post('/:id/vote', protect, voteDiscussion);

module.exports = router;