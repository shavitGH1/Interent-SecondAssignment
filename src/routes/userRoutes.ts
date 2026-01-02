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

router.post('/user/register', register);
router.post('/user/login', login);
router.post('/user/logout', authRequired, logout);
router.post('/user/refresh', refresh);
router.get('/user/profile', authRequired, profile);
router.put('/user/profile', authRequired, updateProfile);
router.delete('/user/profile', authRequired, deleteProfile);
router.get('/user/:sender_id', getBySenderId);

export default router;
