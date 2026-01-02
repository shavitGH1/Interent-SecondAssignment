const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const Session = require('../models/Session');

const sanitizeUser = (user) => ({
  id: user._id,
  sender_id: user.sender_id,
  content: user.content,
  date: user.createdAt,
  email: user.email
});

const register = async (req, res) => {
  const { email, password, content = '' } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'email and password are required' });
  
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(409).json({ message: 'email already registered' });

  const passwordHash = await bcrypt.hash(password, 10);
  const senderIdCounter = await User.countDocuments() + 1;
  
  const user = new User({
    sender_id: senderIdCounter,
    content,
    email,
    passwordHash
  });
  
  await user.save();
  res.status(201).json(sanitizeUser(user));
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const accessToken = crypto.randomUUID();
  const refreshToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
  
  const session = new Session({
    userId: user._id,
    accessToken,
    refreshToken,
    expiresAt
  });
  await session.save();

  res.json({ accessToken, refreshToken, user: sanitizeUser(user) });
};

const logout = async (req, res) => {
  await Session.deleteOne({ accessToken: req.session.accessToken });
  res.status(204).send();
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'refreshToken is required' });
  
  const session = await Session.findOne({ refreshToken });
  if (!session) return res.status(401).json({ message: 'Invalid refresh token' });

  session.accessToken = crypto.randomUUID();
  session.expiresAt = new Date(Date.now() + 1000 * 60 * 60);
  await session.save();
  
  res.json({ accessToken: session.accessToken });
};

const profile = (req, res) => {
  res.json(sanitizeUser(req.user));
};

const updateProfile = async (req, res) => {
  const { email, password, content } = req.body;
  
  if (email && req.user.email !== email) {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'email already registered' });
  }
  
  if (email) req.user.email = email;
  if (typeof content === 'string') req.user.content = content;
  if (password) req.user.passwordHash = await bcrypt.hash(password, 10);
  
  await req.user.save();
  res.json(sanitizeUser(req.user));
};

const deleteProfile = async (req, res) => {
  await User.deleteOne({ _id: req.user._id });
  await Session.deleteMany({ userId: req.user._id });
  res.status(204).send();
};

const getBySenderId = async (req, res) => {
  const senderId = Number(req.params.sender_id);
  const user = await User.findOne({ sender_id: senderId });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(sanitizeUser(user));
};

module.exports = {
  register,
  login,
  logout,
  refresh,
  profile,
  updateProfile,
  deleteProfile,
  getBySenderId,
  sanitizeUser
};
