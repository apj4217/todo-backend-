import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.access_token;
    if (!token) throw new ApiError(401, 'Authentication required');

    const payload = verifyToken(token);
    req.userId = payload.sub;
    req.userEmail = payload.email;
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired session'));
  }
}
