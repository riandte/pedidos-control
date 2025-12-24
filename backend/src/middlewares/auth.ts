import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const [, token] = authorization.split(' ');

  try {
    const secret = process.env.JWT_SECRET || 'default_secret';
    const decoded = jwt.verify(token, secret);
    
    const { id, role } = decoded as TokenPayload;

    (req as any).userId = id;
    (req as any).userRole = role;

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next();
  }

  const [, token] = authorization.split(' ');

  try {
    const secret = process.env.JWT_SECRET || 'default_secret';
    const decoded = jwt.verify(token, secret);
    
    const { id, role } = decoded as TokenPayload;

    (req as any).userId = id;
    (req as any).userRole = role;

    return next();
  } catch (error) {
    // If token is invalid, we treat as guest or return error?
    // Usually if token is provided but invalid, we should reject.
    return res.status(401).json({ message: 'Token inválido' });
  }
};
