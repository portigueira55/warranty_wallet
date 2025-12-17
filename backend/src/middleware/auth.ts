import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { verifyAccessToken } from '../utils/jwt';
import { sendError } from '../utils/response';

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    sendError(res, 'Access token required', 401);
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      type: decoded.type,
    };
    next();
  } catch (error) {
    sendError(res, 'Invalid or expired token', 401);
  }
};

// Middleware para verificar que el usuario es del tipo correcto
export const requireUserType = (...allowedTypes: Array<'user' | 'manufacturer' | 'admin'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    if (!allowedTypes.includes(req.user.type)) {
      sendError(res, 'Insufficient permissions', 403);
      return;
    }

    next();
  };
};
