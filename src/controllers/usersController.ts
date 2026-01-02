import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User, { IUser } from '../models/User';
import Session from '../models/Session';

interface SanitizedUser {
  id: string;
  sender_id: number;
  content: string;
  date: Date;
  email: string;
}

export const sanitizeUser = (user: IUser): SanitizedUser => ({
  id: user._id.toString(),
  sender_id: user.sender_id,
  content: user.content,
  date: user.createdAt,
  email: user.email
});

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, content = '' } = req.body;
  
  if (!email || !password) {
    res.status(400).json({ message: 'email and password are required' });
    return;
  }
  
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409).json({ message: 'email already registered' });
    return;
  }

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

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  
  if (!user) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }
  
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

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

export const logout = async (req: Request, res: Response): Promise<void> => {
  if (req.session) {
    await Session.deleteOne({ accessToken: req.session.accessToken });
  }
  res.status(204).send();
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    res.status(400).json({ message: 'refreshToken is required' });
    return;
  }
  
  const session = await Session.findOne({ refreshToken });
  if (!session) {
    res.status(401).json({ message: 'Invalid refresh token' });
    return;
  }

  session.accessToken = crypto.randomUUID();
  session.expiresAt = new Date(Date.now() + 1000 * 60 * 60);
  await session.save();
  
  res.json({ accessToken: session.accessToken });
};

export const profile = (req: Request, res: Response): void => {
  if (req.user) {
    res.json(sanitizeUser(req.user));
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { email, password, content } = req.body;
  
  if (email && req.user.email !== email) {
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ message: 'email already registered' });
      return;
    }
  }
  
  if (email) req.user.email = email;
  if (typeof content === 'string') req.user.content = content;
  if (password) req.user.passwordHash = await bcrypt.hash(password, 10);
  
  await req.user.save();
  res.json(sanitizeUser(req.user));
};

export const deleteProfile = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  await User.deleteOne({ _id: req.user._id });
  await Session.deleteMany({ userId: req.user._id });
  res.status(204).send();
};

export const getBySenderId = async (req: Request, res: Response): Promise<void> => {
  const senderId = Number(req.params.sender_id);
  const user = await User.findOne({ sender_id: senderId });
  
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  
  res.json(sanitizeUser(user));
};
