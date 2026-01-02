import { Request, Response, NextFunction } from 'express';
import Session from '../models/Session';
import { IUser } from '../models/User';
import { ISession } from '../models/Session';

// Extend Express Request type to include user and session
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      session?: ISession;
    }
  }
}

export const authRequired = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');
  
  if (!token) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const session = await Session.findOne({
    accessToken: token,
    expiresAt: { $gt: new Date() }
  }).populate('userId');

  if (!session) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  req.user = session.userId as any;
  req.session = session;
  next();
};
