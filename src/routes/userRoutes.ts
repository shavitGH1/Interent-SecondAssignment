import express from 'express';
import {
  register,
  login,
  logout,
  refresh,
  profile,
  updateProfile,
  deleteProfile,
  getBySenderId
} from '../controllers/usersController';
import { authRequired } from '../middleware/auth';

const router = express.Router();

/**
 * @openapi
 * /api/user/register:
 *   post:
 *     tags:
 *       - Users
 *     summary: Register a new user
 *     description: Create a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input or user already exists
 * /api/user/login:
 *   post:
 *     tags:
 *       - Users
 *     summary: Login user
 *     description: Authenticate and login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 * /api/user/logout:
 *   post:
 *     tags:
 *       - Users
 *     summary: Logout user
 *     description: Logout the current authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         description: Unauthorized
 * /api/user/refresh:
 *   post:
 *     tags:
 *       - Users
 *     summary: Refresh session
 *     description: Refresh user session token
 *     responses:
 *       200:
 *         description: Session refreshed
 *       401:
 *         description: Invalid session
 * /api/user/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user profile
 *     description: Retrieve the current user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags:
 *       - Users
 *     summary: Update user profile
 *     description: Update the current user's profile
 *     security:
 *       - bearerAuth: []
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
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete user profile
 *     description: Delete the current user's account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted successfully
 *       401:
 *         description: Unauthorized
 * /api/user/{sender_id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by ID
 *     description: Retrieve a user's profile by their sender ID
 *     parameters:
 *       - in: path
 *         name: sender_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.post('/user/register', register);
router.post('/user/login', login);
router.post('/user/logout', authRequired, logout);
router.post('/user/refresh', refresh);
router.get('/user/profile', authRequired, profile);
router.put('/user/profile', authRequired, updateProfile);
router.delete('/user/profile', authRequired, deleteProfile);
router.get('/user/:sender_id', getBySenderId);

export default router;
