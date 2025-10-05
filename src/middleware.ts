import { Response, NextFunction } from 'express';
import { AuthConfig, AuthRequest } from './types.js';
import { verifyToken } from './token.js';

/**
 * Creates an Express middleware that protects routes with JWT authentication
 */
export function createProtectMiddleware(config: AuthConfig) {
  const {
    headerName = 'authorization',
    tokenPrefix = 'Bearer',
    allowQueryToken = false,
    queryTokenName = 'token',
    errorMessages = {},
    onTokenDecoded,
  } = config;

  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      let token: string | undefined;

      // Try to get token from header
      const authHeader = req.headers[headerName.toLowerCase()];
      
      if (authHeader) {
        const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
        
        if (!headerValue.startsWith(`${tokenPrefix} `)) {
          res.status(401).json({ 
            error: errorMessages.invalidFormat || `Invalid authorization format. Use: ${tokenPrefix} <token>` 
          });
          return;
        }

        token = headerValue.substring(tokenPrefix.length + 1); // Remove prefix + space
      }

      // Try to get token from query string if allowed and not found in header
      if (!token && allowQueryToken && req.query[queryTokenName]) {
        token = req.query[queryTokenName] as string;
      }

      if (!token) {
        res.status(401).json({ 
          error: errorMessages.noToken || errorMessages.noAuthHeader || 'No authorization token provided' 
        });
        return;
      }

      // Verify the token
      let decoded = verifyToken(token, config);

      // Call custom hook if provided
      if (onTokenDecoded) {
        const result = await Promise.resolve(onTokenDecoded(decoded));
        if (!result) {
          res.status(401).json({ 
            error: errorMessages.invalidToken || 'Authentication failed' 
          });
          return;
        }
        decoded = result;
      }

      // Attach user to request
      req.user = decoded;

      next();
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({ error: error.message });
      } else {
        res.status(401).json({ error: errorMessages.invalidToken || 'Authentication failed' });
      }
    }
  };
}
