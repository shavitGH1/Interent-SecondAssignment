"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePost = exports.getPost = exports.listPosts = exports.createPost = void 0;
const Post_1 = __importDefault(require("../models/Post"));
const createPost = async (req, res) => {
    const { content } = req.body;
    if (!content) {
        res.status(400).json({ message: 'content is required' });
        return;
    }
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const post = new Post_1.default({
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
exports.createPost = createPost;
const listPosts = async (req, res) => {
    const { sender } = req.query;
    const query = sender ? { sender_id: Number(sender) } : {};
    const posts = await Post_1.default.find(query).sort({ createdAt: -1 });
    res.json(posts.map((post) => ({
        id: post._id.toString(),
        content: post.content,
        sender_id: post.sender_id,
        date: post.createdAt
    })));
};
exports.listPosts = listPosts;
const getPost = async (req, res) => {
    const post = await Post_1.default.findById(req.params.post_id);
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
exports.getPost = getPost;
const updatePost = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const post = await Post_1.default.findById(req.params.post_id);
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
exports.updatePost = updatePost;
