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

  /**
   * Token issuer (who created and signed this token)
   * @example 'my-app.com'
   */
  issuer?: string;

  /**
   * Token audience (who or what the token is intended for)
   * @example 'api.my-app.com'
   */
  audience?: string;

  /**
   * Custom error messages for authentication failures
   */
  errorMessages?: {
    noToken?: string;
    invalidToken?: string;
    expiredToken?: string;
    noAuthHeader?: string;
    invalidFormat?: string;
  };

  /**
   * Custom header name for the authorization token
   * @default 'authorization'
   */
  headerName?: string;

  /**
   * Custom token prefix (e.g., 'Bearer', 'JWT', 'Token')
   * @default 'Bearer'
   */
  tokenPrefix?: string;

  /**
   * Allow tokens from query string (e.g., ?token=xyz)
   * Useful for WebSocket connections or download links
   * @default false
   */
  allowQueryToken?: boolean;

  /**
   * Query parameter name when allowQueryToken is true
   * @default 'token'
   */
  queryTokenName?: string;

  /**
   * Custom function to extract user info from decoded token
   * Useful for adding role checks, permission checks, etc.
   */
  onTokenDecoded?: (payload: JwtPayload) => Promise<JwtPayload | null> | JwtPayload | null;
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
