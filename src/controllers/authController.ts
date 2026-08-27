import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { ApiError } from '../utils/apiError.js';
import { signToken } from '../utils/jwt.js';
import { env } from '../config/env.js';
import { AuthRequest } from '../middleware/auth.js';
import { LoginInput, RegisterInput } from '../validators/auth.js';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/'
};

function setAuthCookie(res: Response, token: string) {
  res.cookie('access_token', token, cookieOptions);
}

export async function register(req: Request<unknown, unknown, RegisterInput>, res: Response) {
  const { name, email, password } = req.body;
  const normalizedEmail = email.toLowerCase();

  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) throw new ApiError(409, 'An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email: normalizedEmail, passwordHash });

  setAuthCookie(res, signToken({ sub: user.id, email: user.email }));
  return res.status(201).json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
}

export async function login(req: Request<unknown, unknown, LoginInput>, res: Response) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  setAuthCookie(res, signToken({ sub: user.id, email: user.email }));
  return res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
}

export async function me(req: AuthRequest, res: Response) {
  const user = await User.findById(req.userId).select('name email');
  if (!user) throw new ApiError(401, 'User no longer exists');
  return res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('access_token', { httpOnly: true, sameSite: 'lax', secure: env.NODE_ENV === 'production', path: '/' });
  return res.json({ success: true });
}
