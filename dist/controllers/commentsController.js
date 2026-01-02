"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCommentsByPost = exports.deleteComment = exports.updateComment = exports.getComment = exports.createComment = void 0;
const Comment_1 = __importDefault(require("../models/Comment"));
const Post_1 = __importDefault(require("../models/Post"));
const createComment = async (req, res) => {
    const { content, post_id } = req.body;
    if (!content || !post_id) {
        res.status(400).json({ message: 'content and post_id are required' });
        return;
    }
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const post = await Post_1.default.findById(post_id);
    if (!post) {
        res.status(404).json({ message: 'Post not found' });
        return;
    }
    const comment = new Comment_1.default({
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
exports.createComment = createComment;
const getComment = async (req, res) => {
    const comment = await Comment_1.default.findById(req.params.comment_id);
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
exports.getComment = getComment;
const updateComment = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const comment = await Comment_1.default.findById(req.params.comment_id);
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
exports.updateComment = updateComment;
const deleteComment = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const comment = await Comment_1.default.findById(req.params.comment_id);
    if (!comment) {
        res.status(404).json({ message: 'Comment not found' });
        return;
    }
    if (comment.sender_id !== req.user.sender_id) {
        res.status(403).json({ message: 'Forbidden' });
        return;
    }
    await Comment_1.default.deleteOne({ _id: comment._id });
    res.status(204).send();
};
exports.deleteComment = deleteComment;
const listCommentsByPost = async (req, res) => {
    const { post } = req.query;
    const query = post ? { post_id: post } : {};
    const comments = await Comment_1.default.find(query).sort({ createdAt: -1 });
    res.json(comments.map((c) => ({
        id: c._id.toString(),
        content: c.content,
        sender_id: c.sender_id,
        post_id: c.post_id.toString(),
        date: c.createdAt
    })));
};
exports.listCommentsByPost = listCommentsByPost;
