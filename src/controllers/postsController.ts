import { Request, Response } from 'express';
import Post from '../models/Post';

export const createPost = async (req: Request, res: Response): Promise<void> => {
  const { content } = req.body;
  
  if (!content) {
    res.status(400).json({ message: 'content is required' });
    return;
  }
  
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  
  const post = new Post({
    content,
    sender_id: req.user.sender_id
  });
  
  await post.save();
  res.status(201).json({
    id: post._id.toString(),
    content: post.content,
    sender_id: post.sender_id,
    date: post.createdAt
  });
};

export const listPosts = async (req: Request, res: Response): Promise<void> => {
  const { sender } = req.query;
  const query = sender ? { sender_id: Number(sender) } : {};
  const posts = await Post.find(query).sort({ createdAt: -1 });
  
  res.json(posts.map((post) => ({
    id: post._id.toString(),
    content: post.content,
    sender_id: post.sender_id,
    date: post.createdAt
  })));
};

export const getPost = async (req: Request, res: Response): Promise<void> => {
  const post = await Post.findById(req.params.post_id);
  
  if (!post) {
    res.status(404).json({ message: 'Post not found' });
    return;
  }
  
  res.json({
    id: post._id.toString(),
    content: post.content,
    sender_id: post.sender_id,
    date: post.createdAt
  });
};

export const updatePost = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const post = await Post.findById(req.params.post_id);
  
  if (!post) {
    res.status(404).json({ message: 'Post not found' });
    return;
  }
  
  if (post.sender_id !== req.user.sender_id) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }
  
  const { content } = req.body;
  if (!content) {
    res.status(400).json({ message: 'content is required' });
    return;
  }
  
  post.content = content;
  await post.save();
  
  res.json({
    id: post._id.toString(),
    content: post.content,
    sender_id: post.sender_id,
    date: post.createdAt
  });
};
