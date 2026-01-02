const express = require('express');
const {
  createComment,
  getComment,
  updateComment,
  deleteComment,
  listCommentsByPost
} = require('../controllers/commentsController');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.post('/comment', authRequired, createComment);
router.get('/comment/:comment_id', getComment);
router.put('/comment/:comment_id', authRequired, updateComment);
router.delete('/comment/:comment_id', authRequired, deleteComment);
router.get('/comment', listCommentsByPost);

module.exports = router;
