import { Request } from 'express';

/**
 * Configuration options for initializing the auth kit
 */
export interface AuthConfig {
  /**
   * Secret key used to sign and verify JWT tokens
   */
  jwtSecret: string;

  /**
   * Token expiration time (e.g., '7d', '24h', '1h')
   * @default '7d'
   */
  expiresIn?: string;

  /**
   * Algorithm used for JWT signing
   * @default 'HS256'
   */
  algorithm?: 'HS256' | 'HS384' | 'HS512';
}

/**
 * Standard JWT payload structure
 */
export interface JwtPayload {
  /**
   * User ID or subject
   */
  sub: string;

  /**
   * Issued at timestamp
   */
  iat?: number;

  /**
   * Expiration timestamp
   */
  exp?: number;

  /**
   * Any additional custom claims
   */
  [key: string]: any;
}

/**
 * Extended Express Request with authenticated user
 */
export interface AuthRequest extends Request {
  user?: JwtPayload;
}
