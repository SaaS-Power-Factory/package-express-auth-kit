# express-auth-kit

[![npm version](https://badge.fury.io/js/@saas-power-factory%2Fexpress-auth-kit.svg)](https://www.npmjs.com/package/@saas-power-factory/express-auth-kit)
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

**Config:**
- `jwtSecret` (string, required): Secret key for JWT signing
- `expiresIn` (string, optional): Token expiration (default: '7d')
- `algorithm` (string, optional): JWT algorithm (default: 'HS256')

**Returns:**
- `signToken(payload)`: Signs a JWT token
- `verifyToken(token)`: Verifies and decodes a token
- `protect`: Express middleware for route protection

### Request Authentication

Protected routes receive the decoded JWT payload in `req.user`:

```typescript
app.get('/me', auth.protect, (req: AuthRequest, res) => {
  console.log(req.user.sub); // user ID
  console.log(req.user.email); // or any custom claims
});
```

### Token Format

Clients must send tokens in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## TypeScript

Full TypeScript support with exported types:

```typescript
import type { AuthConfig, JwtPayload, AuthRequest } from '@saas-power-factory/express-auth-kit';
```

## License

MIT
