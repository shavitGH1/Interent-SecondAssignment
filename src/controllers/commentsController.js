const Comment = require('../models/Comment');
const Post = require('../models/Post');

const createComment = async (req, res) => {
  const { content, post_id } = req.body;
  if (!content || !post_id) return res.status(400).json({ message: 'content and post_id are required' });
  
  const post = await Post.findById(post_id);
  if (!post) return res.status(404).json({ message: 'Post not found' });

  const comment = new Comment({
    content,
    sender_id: req.user.sender_id,
    post_id
  });
  
  await comment.save();
  
  res.status(201).json({
    id: comment._id,
    content: comment.content,
    sender_id: comment.sender_id,
    post_id: comment.post_id,
    date: comment.createdAt
  });
};

const getComment = async (req, res) => {
  const comment = await Comment.findById(req.params.comment_id);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  
  res.json({
    id: comment._id,
    content: comment.content,
    sender_id: comment.sender_id,
    post_id: comment.post_id,
    date: comment.createdAt
  });
};

const updateComment = async (req, res) => {
  const comment = await Comment.findById(req.params.comment_id);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  if (comment.sender_id !== req.user.sender_id) return res.status(403).json({ message: 'Forbidden' });
  
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'content is required' });
  
  comment.content = content;
  await comment.save();
  
  res.json({
    id: comment._id,
    content: comment.content,
    sender_id: comment.sender_id,
    post_id: comment.post_id,
    date: comment.createdAt
  });
};

const deleteComment = async (req, res) => {
  const comment = await Comment.findById(req.params.comment_id);
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  if (comment.sender_id !== req.user.sender_id) return res.status(403).json({ message: 'Forbidden' });
  
  await Comment.deleteOne({ _id: comment._id });
  res.status(204).send();
};

const listCommentsByPost = async (req, res) => {
  const { post } = req.query;
  const query = post ? { post_id: post } : {};
  const comments = await Comment.find(query).sort({ createdAt: -1 });
  
  res.json(comments.map((c) => ({
    id: c._id,
    content: c.content,
    sender_id: c.sender_id,
    post_id: c.post_id,
    date: c.createdAt
  })));
};

module.exports = {
  createComment,
  getComment,
  updateComment,
  deleteComment,
  listCommentsByPost
};
