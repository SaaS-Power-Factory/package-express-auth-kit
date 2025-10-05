import { describe, it, expect, vi } from 'vitest';
import { createProtectMiddleware } from '../src/middleware.js';
import type { AuthRequest } from '../src/types.js';
import { signToken } from '../src/token.js';

describe('Advanced middleware features', () => {
  describe('query token support', () => {
    it('should accept token from query string when allowQueryToken is true', async () => {
      const config = {
        jwtSecret: 'test-secret-key-at-least-32-chars-long',
        allowQueryToken: true,
      };

      const middleware = createProtectMiddleware(config);

      const token = signToken({ sub: 'user-123' }, config);

      const req = {
        headers: {},
        query: { token },
      } as unknown as AuthRequest;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;

      const next = vi.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user?.sub).toBe('user-123');
    });

    it('should use custom query token name', async () => {
      const config = {
        jwtSecret: 'test-secret-key-at-least-32-chars-long',
        allowQueryToken: true,
        queryTokenName: 'access_token',
      };

      const middleware = createProtectMiddleware(config);

      const token = signToken({ sub: 'user-123' }, config);

      const req = {
        headers: {},
        query: { access_token: token },
      } as unknown as AuthRequest;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;

      const next = vi.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user?.sub).toBe('user-123');
    });
  });

  describe('custom header and prefix', () => {
    it('should use custom header name', async () => {
      const config = {
        jwtSecret: 'test-secret-key-at-least-32-chars-long',
        headerName: 'x-auth-token',
      };

      const middleware = createProtectMiddleware(config);

      const token = signToken({ sub: 'user-123' }, config);

      const req = {
        headers: {
          'x-auth-token': `Bearer ${token}`,
        },
        query: {},
      } as unknown as AuthRequest;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;

      const next = vi.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user?.sub).toBe('user-123');
    });

    it('should use custom token prefix', async () => {
      const config = {
        jwtSecret: 'test-secret-key-at-least-32-chars-long',
        tokenPrefix: 'JWT',
      };

      const middleware = createProtectMiddleware(config);

      const token = signToken({ sub: 'user-123' }, config);

      const req = {
        headers: {
          authorization: `JWT ${token}`,
        },
        query: {},
      } as unknown as AuthRequest;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;

      const next = vi.fn();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user?.sub).toBe('user-123');
    });
  });

  describe('onTokenDecoded hook', () => {
    it('should call onTokenDecoded and use modified payload', async () => {
      const config = {
        jwtSecret: 'test-secret-key-at-least-32-chars-long',
        onTokenDecoded: vi.fn(async (payload) => {
          return { ...payload, role: 'admin' };
        }),
      };

      const middleware = createProtectMiddleware(config);

      const token = signToken({ sub: 'user-123' }, config);

      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
        query: {},
      } as unknown as AuthRequest;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;

      const next = vi.fn();

      await middleware(req, res, next);

      expect(config.onTokenDecoded).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
      expect(req.user?.sub).toBe('user-123');
      expect((req.user as any)?.role).toBe('admin');
    });

    it('should reject if onTokenDecoded returns null', async () => {
      const config = {
        jwtSecret: 'test-secret-key-at-least-32-chars-long',
        onTokenDecoded: vi.fn(async () => null),
      };

      const middleware = createProtectMiddleware(config);

      const token = signToken({ sub: 'user-123' }, config);

      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
        query: {},
      } as unknown as AuthRequest;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;

      const next = vi.fn();

      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('custom error messages in middleware', () => {
    it('should use custom error message for missing token', async () => {
      const config = {
        jwtSecret: 'test-secret-key-at-least-32-chars-long',
        errorMessages: {
          noToken: 'Please provide an authentication token',
        },
      };

      const middleware = createProtectMiddleware(config);

      const req = {
        headers: {},
        query: {},
      } as unknown as AuthRequest;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;

      const next = vi.fn();

      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Please provide an authentication token',
      });
    });
  });
});
