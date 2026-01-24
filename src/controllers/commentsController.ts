import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Post from '../models/Post';

export const createComment = async (req: Request, res: Response): Promise<void> => {
  try {
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
      owner: req.user._id,
      post_id
    });
    
    await comment.save();
    
    res.status(201).json({
      id: comment._id.toString(),
      content: comment.content,
      owner: comment.owner.toString(),
      post_id: comment.post_id.toString(),
      date: comment.createdAt
    });
  } catch (error) {
    console.error('Error in createComment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const comment = await Comment.findById(req.params.comment_id);
    
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }
    
    res.json({
      id: comment._id.toString(),
      content: comment.content,
      owner: comment.owner.toString(),
      post_id: comment.post_id.toString(),
      date: comment.createdAt
    });
  } catch (error) {
    console.error('Error in getComment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateComment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const comment = await Comment.findById(req.params.comment_id);
    
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }
    
    if (comment.owner.toString() !== req.user._id.toString()) {
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
      owner: comment.owner.toString(),
      post_id: comment.post_id.toString(),
      date: comment.createdAt
    });
  } catch (error) {
    console.error('Error in updateComment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const comment = await Comment.findById(req.params.comment_id);
    
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }
    
    if (comment.owner.toString() !== req.user._id.toString()) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    
    await Comment.deleteOne({ _id: comment._id });
    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteComment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const listCommentsByPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { post } = req.query;
    const query = post ? { post_id: post } : {};
    const comments = await Comment.find(query).sort({ createdAt: -1 });
    
    res.json(comments.map((c) => ({
      id: c._id.toString(),
      content: c.content,
      owner: c.owner.toString(),
      post_id: c.post_id.toString(),
      date: c.createdAt
    })));
  } catch (error) {
    console.error('Error in listCommentsByPost:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
