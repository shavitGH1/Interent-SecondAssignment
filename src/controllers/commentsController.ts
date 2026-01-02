import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Post from '../models/Post';

export const createComment = async (req: Request, res: Response): Promise<void> => {
  const { content, post_id } = req.body;
  
  if (!content || !post_id) {
    res.status(400).json({ message: 'content and post_id are required' });
    return;
  }
  
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  
  const post = await Post.findById(post_id);
  if (!post) {
    res.status(404).json({ message: 'Post not found' });
    return;
  }

  const comment = new Comment({
    content,
    sender_id: req.user.sender_id,
    post_id
  });
  
  await comment.save();
  
  res.status(201).json({
    id: comment._id.toString(),
    content: comment.content,
    sender_id: comment.sender_id,
    post_id: comment.post_id.toString(),
    date: comment.createdAt
  });
};

export const getComment = async (req: Request, res: Response): Promise<void> => {
  const comment = await Comment.findById(req.params.comment_id);
  
  if (!comment) {
    res.status(404).json({ message: 'Comment not found' });
    return;
  }
  
  res.json({
    id: comment._id.toString(),
    content: comment.content,
    sender_id: comment.sender_id,
    post_id: comment.post_id.toString(),
    date: comment.createdAt
  });
};

export const updateComment = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const comment = await Comment.findById(req.params.comment_id);
  
  if (!comment) {
    res.status(404).json({ message: 'Comment not found' });
    return;
  }
  
  if (comment.sender_id !== req.user.sender_id) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  
  const { content } = req.body;
  if (!content) {
    res.status(400).json({ message: 'content is required' });
    return;
  }
  
  comment.content = content;
  await comment.save();
  
  res.json({
    id: comment._id.toString(),
    content: comment.content,
    sender_id: comment.sender_id,
    post_id: comment.post_id.toString(),
    date: comment.createdAt
  });
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const comment = await Comment.findById(req.params.comment_id);
  
  if (!comment) {
    res.status(404).json({ message: 'Comment not found' });
    return;
  }
  
  if (comment.sender_id !== req.user.sender_id) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  
  await Comment.deleteOne({ _id: comment._id });
  res.status(204).send();
};

export const listCommentsByPost = async (req: Request, res: Response): Promise<void> => {
  const { post } = req.query;
  const query = post ? { post_id: post } : {};
  const comments = await Comment.find(query).sort({ createdAt: -1 });
  
  res.json(comments.map((c) => ({
    id: c._id.toString(),
    content: c.content,
    sender_id: c.sender_id,
    post_id: c.post_id.toString(),
    date: c.createdAt
  })));
};
