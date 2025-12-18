import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = (err as any).statusCode || 500;
  const message = err.message || 'Internal server error';

  sendError(res, message, statusCode);
};

export const notFoundHandler = (
  req: Request,
  res: Response
): void => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
};
