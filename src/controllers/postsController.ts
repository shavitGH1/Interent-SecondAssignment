import { Request, Response } from 'express';
import Post from '../models/Post';

export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
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
      owner: req.user._id
    });
    
    await post.save();
    res.status(201).json({
      id: post._id.toString(),
      content: post.content,
      owner: post.owner.toString(),
      date: post.createdAt
    });
  } catch (error) {
    console.error('Error in createPost:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const listPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sender } = req.query;
    const query = sender ? { owner: sender } : {};
    const posts = await Post.find(query).sort({ createdAt: -1 });
    
    res.json(posts.map((post) => ({
      id: post._id.toString(),
      content: post.content,
      owner: post.owner.toString(),
      date: post.createdAt
    })));
  } catch (error) {
    console.error('Error in listPosts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await Post.findById(req.params.post_id);
    
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    
    res.json({
      id: post._id.toString(),
      content: post.content,
      owner: post.owner.toString(),
      date: post.createdAt
    });
  } catch (error) {
    console.error('Error in getPost:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const post = await Post.findById(req.params.post_id);
    
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }
    
    if (post.owner.toString() !== req.user._id.toString()) {
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
      owner: post.owner.toString(),
      date: post.createdAt
    });
  } catch (error) {
    console.error('Error in updatePost:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
