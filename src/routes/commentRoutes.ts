import express from 'express';
import {
  createComment,
  getComment,
  updateComment,
  deleteComment,
  listCommentsByPost
} from '../controllers/commentsController';
import { authRequired } from '../middleware/auth';

const router = express.Router();

router.post('/comment', authRequired, createComment);
router.get('/comment/:comment_id', getComment);
router.put('/comment/:comment_id', authRequired, updateComment);
router.delete('/comment/:comment_id', authRequired, deleteComment);
router.get('/comment', listCommentsByPost);

export default router;
