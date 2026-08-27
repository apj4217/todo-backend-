import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { ApiError } from '../utils/apiError.js';

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: error.flatten().fieldErrors });
  }
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ success: false, message: 'Invalid data' });
  }
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({ success: false, message: error.message, details: error.details });
  }
  if ((error as { code?: number })?.code === 11000) {
    return res.status(409).json({ success: false, message: 'An account with this email already exists' });
  }
  console.error(error);
  return res.status(500).json({ success: false, message: 'Something went wrong on the server' });
}
