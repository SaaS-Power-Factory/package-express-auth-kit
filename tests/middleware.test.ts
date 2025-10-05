import { describe, it, expect, vi } from 'vitest';
import { createProtectMiddleware } from '../src/middleware.js';
import type { AuthRequest } from '../src/types.js';

describe('protect middleware', () => {
  it('should reject requests without Authorization header', () => {
    const middleware = createProtectMiddleware({
      jwtSecret: 'test-secret-key-at-least-32-chars-long',
    });

    const req = {
      headers: {},
    } as AuthRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    const next = vi.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'No authorization header provided',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject invalid authorization format', () => {
    const middleware = createProtectMiddleware({
      jwtSecret: 'test-secret-key-at-least-32-chars-long',
    });

    const req = {
      headers: {
        authorization: 'InvalidFormat token',
      },
    } as AuthRequest;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    const next = vi.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid authorization format. Use: Bearer <token>',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
