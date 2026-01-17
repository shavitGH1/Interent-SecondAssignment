import express from 'express';
import {
  createComment,
  getComment,
  updateComment,
  deleteComment,
  listCommentsByPost
} from '../controllers/commentsController';
import { authRequired } from '../middleware/auth';

const router = express.Router();

/**
 * @openapi
 * /api/comment:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Create a new comment
 *     description: Create a new comment on a post (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - post_id
 *             properties:
 *               content:
 *                 type: string
 *               post_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       401:
 *         description: Unauthorized
 *   get:
 *     tags:
 *       - Comments
 *     summary: List comments by post
 *     description: Retrieve comments for a specific post
 *     parameters:
 *       - in: query
 *         name: post_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Array of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 * /api/comment/{comment_id}:
 *   get:
 *     tags:
 *       - Comments
 *     summary: Get comment by ID
 *     description: Retrieve a specific comment by its ID
 *     parameters:
 *       - in: path
 *         name: comment_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 *   put:
 *     tags:
 *       - Comments
 *     summary: Update comment
 *     description: Update an existing comment (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comment_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Delete comment
 *     description: Delete a comment (requires authentication)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: comment_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Comment not found
 */
router.post('/comment', authRequired, createComment);
router.get('/comment/:comment_id', getComment);
router.put('/comment/:comment_id', authRequired, updateComment);
router.delete('/comment/:comment_id', authRequired, deleteComment);
router.get('/comment', listCommentsByPost);

export default router;
