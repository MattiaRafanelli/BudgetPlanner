import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        isAdmin: boolean;
      };
      token?: string;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  req.user = decoded;
  req.token = token;
  next();
}

export function adminMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.user?.isAdmin) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
}
