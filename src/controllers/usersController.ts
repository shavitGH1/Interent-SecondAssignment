import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User, { IUser } from '../models/User';
import Session from '../models/Session';

interface SanitizedUser {
  id: string;
  username: string;
  date: Date;
  email: string;
}

export const sanitizeUser = (user: IUser): SanitizedUser => ({
  id: user._id.toString(),
  username: user.username,
  date: user.createdAt,
  email: user.email
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username } = req.body;
    
    if (!email || !password || !username) {
      res.status(400).json({ message: 'email, password and username are required' });
      return;
    }
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        res.status(409).json({ message: 'email already registered' });
      } else {
        res.status(409).json({ message: 'username already taken' });
      }
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = new User({
      username,
      email,
      passwordHash
    });
    
    await user.save();
    res.status(201).json(sanitizeUser(user));
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.session) {
      await Session.deleteOne({ accessToken: req.session.accessToken });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error in logout:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
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
  } catch (error) {
    console.error('Error in refresh:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const profile = (req: Request, res: Response): void => {
  if (req.user) {
    res.json(sanitizeUser(req.user));
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { email, password, username } = req.body;
    
    if (email && req.user.email !== email) {
      const existing = await User.findOne({ email });
      if (existing) {
        res.status(409).json({ message: 'email already registered' });
        return;
      }
    }

    if (username && req.user.username !== username) {
      const existing = await User.findOne({ username });
      if (existing) {
        res.status(409).json({ message: 'username already taken' });
        return;
      }
    }
    
    if (email) req.user.email = email;
    if (typeof username === 'string') req.user.username = username;
    if (password) req.user.passwordHash = await bcrypt.hash(password, 10);
    
    await req.user.save();
    res.json(sanitizeUser(req.user));
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    await User.deleteOne({ _id: req.user._id });
    await Session.deleteMany({ userId: req.user._id });
    res.status(204).send();
  } catch (error) {
    console.error('Error in deleteProfile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json(sanitizeUser(user));
  } catch (error) {
    console.error('Error in getById:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
