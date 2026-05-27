const express = require('express');
const router = express.Router();
const {
  createComment,
  updateComment,
  deleteComment,
  voteComment
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.post('/:id/vote', protect, voteComment);

module.exports = router;