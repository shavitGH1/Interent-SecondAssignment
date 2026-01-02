const express = require('express');
const {
  register,
  login,
  logout,
  refresh,
  profile,
  updateProfile,
  deleteProfile,
  getBySenderId
} = require('../controllers/usersController');
const { authRequired } = require('../middleware/auth');

const router = express.Router();

router.post('/user/register', register);
router.post('/user/login', login);
router.post('/user/logout', authRequired, logout);
router.post('/user/refresh', refresh);
router.get('/user/profile', authRequired, profile);
router.put('/user/profile', authRequired, updateProfile);
router.delete('/user/profile', authRequired, deleteProfile);
router.get('/user/:sender_id', getBySenderId);

module.exports = router;
