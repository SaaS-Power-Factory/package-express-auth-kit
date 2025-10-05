import { Response, NextFunction } from 'express';
import { AuthConfig, AuthRequest } from './types.js';
import { verifyToken } from './token.js';

/**
 * Creates an Express middleware that protects routes with JWT authentication
 */
export function createProtectMiddleware(config: AuthConfig) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      // Extract token from Authorization header (Bearer token)
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        res.status(401).json({ error: 'No authorization header provided' });
        return;
      }

      if (!authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Invalid authorization format. Use: Bearer <token>' });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }

      // Verify the token
      const decoded = verifyToken(token, config);

      // Attach user to request
      req.user = decoded;

      next();
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      } else {
        res.status(401).json({ error: 'Authentication failed' });
      }
    }
  };
}
