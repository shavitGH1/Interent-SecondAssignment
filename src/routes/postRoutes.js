const express = require('express');
const { createPost, listPosts, getPost, updatePost } = require('../controllers/postsController');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.post('/post', authRequired, createPost);
router.get('/post', listPosts);
router.get('/post/:post_id', getPost);
router.put('/post/:post_id', authRequired, updatePost);

module.exports = router;
