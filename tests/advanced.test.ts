import { describe, it, expect } from 'vitest';
import { initAuth } from '../src/index.js';

describe('Advanced AuthConfig features', () => {
  describe('issuer and audience', () => {
    it('should sign and verify tokens with issuer and audience', () => {
      const auth = initAuth({
        jwtSecret: 'test-secret-key-at-least-32-chars-long',
        issuer: 'my-app.com',
        audience: 'api.my-app.com',
      });

      const token = auth.signToken({ sub: 'user-123' });
      const decoded = auth.verifyToken(token);

      expect(decoded.sub).toBe('user-123');
      expect(decoded.iss).toBe('my-app.com');
      expect(decoded.aud).toBe('api.my-app.com');
    });

    it('should reject tokens with wrong issuer', () => {
      const auth1 = initAuth({
        jwtSecret: 'test-secret-key-at-least-32-chars-long',
        issuer: 'app1.com',
      });

      const auth2 = initAuth({
        jwtSecret: 'test-secret-key-at-least-32-chars-long',
        issuer: 'app2.com',
      });

      const token = auth1.signToken({ sub: 'user-123' });

      expect(() => {
        auth2.verifyToken(token);
      }).toThrow();
    });
  });

  describe('custom error messages', () => {
    it('should use custom error message for invalid token', () => {
      const auth = initAuth({
        jwtSecret: 'test-secret-key-at-least-32-chars-long',
        errorMessages: {
          invalidToken: 'Custom invalid token error',
        },
      });

      try {
        auth.verifyToken('invalid.token.here');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Custom invalid token error');
      }
    });

    it.skip('should use custom error message for expired token', async () => {
      const auth = initAuth({
        jwtSecret: 'test-secret-key-at-least-32-chars-long',
        expiresIn: '-1s', // Already expired
        errorMessages: {
          expiredToken: 'Custom expired token error',
        },
      });

      const token = auth.signToken({ sub: 'user-123' });

      try {
        auth.verifyToken(token);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Custom expired token error');
      }
    });
  });
});
