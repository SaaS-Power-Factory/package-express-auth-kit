import { describe, it, expect } from 'vitest';
import { initAuth } from '../src/index.js';

describe('initAuth', () => {
  it('should initialize with valid config', () => {
    const auth = initAuth({
      jwtSecret: 'test-secret-key-at-least-32-chars-long',
      expiresIn: '1h',
    });

    expect(auth).toBeDefined();
    expect(auth.signToken).toBeInstanceOf(Function);
    expect(auth.verifyToken).toBeInstanceOf(Function);
    expect(auth.protect).toBeInstanceOf(Function);
  });

  it('should throw error if jwtSecret is missing', () => {
    expect(() => {
      // @ts-expect-error Testing invalid config
      initAuth({});
    }).toThrow('jwtSecret is required');
  });

  it('should sign and verify tokens', () => {
    const auth = initAuth({
      jwtSecret: 'test-secret-key-at-least-32-chars-long',
    });

    const payload = { sub: 'user-123', email: 'test@example.com' };
    const token = auth.signToken(payload);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');

    const decoded = auth.verifyToken(token);
    expect(decoded.sub).toBe('user-123');
    expect(decoded.email).toBe('test@example.com');
  });

  it('should throw error for invalid token', () => {
    const auth = initAuth({
      jwtSecret: 'test-secret-key-at-least-32-chars-long',
    });

    expect(() => {
      auth.verifyToken('invalid.token.here');
    }).toThrow();
  });
});
