import express from 'express';
import { createPost, listPosts, getPost, updatePost } from '../controllers/postsController';
import { authRequired } from '../middleware/auth';

const router = express.Router();

router.post('/post', authRequired, createPost);
router.get('/post', listPosts);
router.get('/post/:post_id', getPost);
router.put('/post/:post_id', authRequired, updatePost);

export default router;
