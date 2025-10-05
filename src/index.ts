import { AuthConfig } from './types.js';
import { signToken, verifyToken } from './token.js';
import { createProtectMiddleware } from './middleware.js';

/**
 * Initialize the auth kit with configuration
 * Returns an object with all authentication utilities
 * 
 * @example
 * ```typescript
 * import { initAuth } from '@saas-power-factory/express-auth-kit';
 * 
 * const auth = initAuth({
 *   jwtSecret: process.env.JWT_SECRET!,
 *   expiresIn: '7d'
 * });
 * 
 * // Sign a token
 * const token = auth.signToken({ sub: 'user-123', email: 'user@example.com' });
 * 
 * // Protect routes
 * app.get('/protected', auth.protect, (req, res) => {
 *   res.json({ user: req.user });
 * });
 * ```
 */
export function initAuth(config: AuthConfig) {
  // Validate config
  if (!config.jwtSecret) {
    throw new Error('jwtSecret is required in AuthConfig');
  }

  if (config.jwtSecret.length < 32) {
    console.warn('Warning: jwtSecret should be at least 32 characters for security');
  }

  return {
    /**
     * Sign a JWT token with the given payload
     */
    signToken: (payload: Parameters<typeof signToken>[0]) =>
      signToken(payload, config),

    /**
     * Verify and decode a JWT token
     */
    verifyToken: (token: string) => verifyToken(token, config),

    /**
     * Express middleware to protect routes
     */
    protect: createProtectMiddleware(config),
  };
}

// Re-export types for convenience
export type { AuthConfig, JwtPayload, AuthRequest } from './types.js';
