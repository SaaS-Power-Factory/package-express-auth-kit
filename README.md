# express-auth-kit

[![npm version](https://img.shields.io/npm/v/@saas-power-factory/express-auth-kit.svg)](https://www.npmjs.com/package/@saas-power-factory/express-auth-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

🔐 Lightweight toolkit to add JWT-based authentication and route guards to Express APIs.

## Installation

```bash
npm install @saas-power-factory/express-auth-kit
```

## Quick Start

```typescript
import express from 'express';
import { initAuth } from '@saas-power-factory/express-auth-kit';

const app = express();

// Initialize auth with your JWT secret
const auth = initAuth({
  jwtSecret: process.env.JWT_SECRET!,
  expiresIn: '7d', // optional, defaults to '7d'
});

// Sign tokens (e.g., during login)
app.post('/login', (req, res) => {
  // ... validate credentials ...
  
  const token = auth.signToken({
    sub: user.id,
    email: user.email,
  });
  
  res.json({ token });
});

// Protect routes with middleware
app.get('/protected', auth.protect, (req, res) => {
  // req.user is populated with decoded JWT payload
  res.json({ user: req.user });
});

app.listen(3000);
```

## API

### `initAuth(config: AuthConfig)`

Initializes the auth kit with configuration and returns utilities.

**Basic Config:**
- `jwtSecret` (string, required): Secret key for JWT signing (min 32 chars recommended)
- `expiresIn` (string, optional): Token expiration (default: '7d')
- `algorithm` (string, optional): JWT algorithm (default: 'HS256')

**Advanced Config:**
- `issuer` (string, optional): Token issuer identifier
- `audience` (string, optional): Token audience identifier
- `headerName` (string, optional): Custom auth header name (default: 'authorization')
- `tokenPrefix` (string, optional): Custom token prefix (default: 'Bearer')
- `allowQueryToken` (boolean, optional): Allow tokens in query string (default: false)
- `queryTokenName` (string, optional): Query param name for token (default: 'token')
- `errorMessages` (object, optional): Custom error messages
  - `noToken`: Message when no token provided
  - `invalidToken`: Message for invalid tokens
  - `expiredToken`: Message for expired tokens
  - `noAuthHeader`: Message when header missing
  - `invalidFormat`: Message for wrong token format
- `onTokenDecoded` (function, optional): Hook to modify/validate decoded token

**Returns:**
- `signToken(payload)`: Signs a JWT token
- `verifyToken(token)`: Verifies and decodes a token
- `protect`: Express middleware for route protection

## Advanced Examples

### With Issuer & Audience

```typescript
const auth = initAuth({
  jwtSecret: process.env.JWT_SECRET!,
  issuer: 'my-app.com',
  audience: 'api.my-app.com',
});
```

### Custom Error Messages

```typescript
const auth = initAuth({
  jwtSecret: process.env.JWT_SECRET!,
  errorMessages: {
    noToken: 'Authentication required',
    invalidToken: 'Invalid credentials',
    expiredToken: 'Session expired, please login again',
  },
});
```

### Custom Header & Prefix

```typescript
const auth = initAuth({
  jwtSecret: process.env.JWT_SECRET!,
  headerName: 'x-auth-token',
  tokenPrefix: 'JWT',
});

// Client sends: x-auth-token: JWT <token>
```

### Query Token Support (WebSocket/Downloads)

```typescript
const auth = initAuth({
  jwtSecret: process.env.JWT_SECRET!,
  allowQueryToken: true,
  queryTokenName: 'access_token',
});

// Now works with: GET /download?access_token=<token>
```

### Token Validation Hook

```typescript
const auth = initAuth({
  jwtSecret: process.env.JWT_SECRET!,
  onTokenDecoded: async (payload) => {
    // Fetch user from database
    const user = await db.users.findById(payload.sub);
    
    if (!user || user.banned) {
      return null; // Reject authentication
    }
    
    // Add additional data to request
    return {
      ...payload,
      role: user.role,
      permissions: user.permissions,
    };
  },
});

app.get('/admin', auth.protect, (req, res) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json({ message: 'Admin access granted' });
});
```

## Request Authentication

Protected routes receive the decoded JWT payload in `req.user`:

```typescript
app.get('/me', auth.protect, (req: AuthRequest, res) => {
  console.log(req.user.sub); // user ID
  console.log(req.user.email); // or any custom claims
});
```

## Token Format

Clients must send tokens in the `Authorization` header (or query string if enabled):

```
Authorization: Bearer <your-jwt-token>
```

Or with query token:
```
GET /api/download?token=<your-jwt-token>
```

## TypeScript

Full TypeScript support with exported types:

```typescript
import type { AuthConfig, JwtPayload, AuthRequest } from '@saas-power-factory/express-auth-kit';
```

## License

MIT
