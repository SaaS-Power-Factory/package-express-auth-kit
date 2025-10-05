import jwt from 'jsonwebtoken';
import { AuthConfig, JwtPayload } from './types.js';

/**
 * Signs a JWT token with the given payload
 */
export function signToken(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  config: AuthConfig
): string {
  const { 
    jwtSecret, 
    expiresIn = '7d', 
    algorithm = 'HS256',
    issuer,
    audience 
  } = config;

  const options: any = {
    algorithm,
  };

  if (expiresIn) {
    options.expiresIn = expiresIn;
  }

  if (issuer) {
    options.issuer = issuer;
  }

  if (audience) {
    options.audience = audience;
  }

  return jwt.sign(payload, jwtSecret, options);
}

/**
 * Verifies and decodes a JWT token
 * @throws {Error} If token is invalid or expired
 */
export function verifyToken(token: string, config: AuthConfig): JwtPayload {
  const { 
    jwtSecret, 
    algorithm = 'HS256',
    issuer,
    audience,
    errorMessages = {}
  } = config;

  try {
    const options: any = {
      algorithms: [algorithm],
    };

    if (issuer) {
      options.issuer = issuer;
    }

    if (audience) {
      options.audience = audience;
    }

    const decoded = jwt.verify(token, jwtSecret, options);

    return decoded as unknown as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error(errorMessages.invalidToken || 'Invalid token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error(errorMessages.expiredToken || 'Token expired');
    }
    throw error;
  }
}
