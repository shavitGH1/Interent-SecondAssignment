const Post = require('../models/Post');

const createPost = async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'content is required' });
  
  const post = new Post({
    content,
    sender_id: req.user.sender_id
  });
  
  await post.save();
  res.status(201).json({
    id: post._id,
    content: post.content,
    sender_id: post.sender_id,
    date: post.createdAt
  });
};

const listPosts = async (req, res) => {
  const { sender } = req.query;
  const query = sender ? { sender_id: Number(sender) } : {};
  const posts = await Post.find(query).sort({ createdAt: -1 });
  
  res.json(posts.map((post) => ({
    id: post._id,
    content: post.content,
    sender_id: post.sender_id,
    date: post.createdAt
  })));
};

const getPost = async (req, res) => {
  const post = await Post.findById(req.params.post_id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  
  res.json({
    id: post._id,
    content: post.content,
    sender_id: post.sender_id,
    date: post.createdAt
  });
};

const updatePost = async (req, res) => {
  const post = await Post.findById(req.params.post_id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  if (post.sender_id !== req.user.sender_id) return res.status(403).json({ message: 'Forbidden' });
  
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'content is required' });
  
  post.content = content;
  await post.save();
  
  res.json({
    id: post._id,
    content: post.content,
    sender_id: post.sender_id,
    date: post.createdAt
  });
};

module.exports = { createPost, listPosts, getPost, updatePost };
