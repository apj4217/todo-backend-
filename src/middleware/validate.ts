import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';

// Parses req.body against the given schema and replaces it with the
// parsed result. Zod errors are forwarded to the error handler.
export function validate(schema: ZodType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}
