import jwt from 'jsonwebtoken';
import { AuthConfig, JwtPayload } from './types.js';

/**
 * Signs a JWT token with the given payload
 */
export function signToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  config: AuthConfig
): string {
  const { jwtSecret, expiresIn = '7d', algorithm = 'HS256' } = config;

  return jwt.sign(payload, jwtSecret, {
    expiresIn,
    algorithm,
  } as jwt.SignOptions);
}

/**
 * Verifies and decodes a JWT token
 * @throws {Error} If token is invalid or expired
 */
export function verifyToken(token: string, config: AuthConfig): JwtPayload {
  const { jwtSecret, algorithm = 'HS256' } = config;

  try {
    const decoded = jwt.verify(token, jwtSecret, {
      algorithms: [algorithm],
    }) as JwtPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    throw error;
  }
}
