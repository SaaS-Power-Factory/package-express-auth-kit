import express from 'express';
import { initAuth, AuthRequest } from '../src/index.js';

const app = express();
app.use(express.json());

// Initialize auth
const auth = initAuth({
  jwtSecret: 'super-secret-key-at-least-32-characters-long-for-testing',
  expiresIn: '1h',
});

// Public login endpoint
app.post('/login', (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }

  // In real app, validate credentials here
  const token = auth.signToken({
    sub: `user-${Date.now()}`,
    username,
    email: `${username}@example.com`,
  });

  res.json({ token, message: 'Login successful' });
});

// Protected endpoint
app.get('/protected', auth.protect, (req: AuthRequest, res) => {
  res.json({
    message: 'You accessed a protected route!',
    user: req.user,
  });
});

// Another protected endpoint
app.get('/profile', auth.protect, (req: AuthRequest, res) => {
  res.json({
    profile: {
      id: req.user?.sub,
      username: req.user?.username,
      email: req.user?.email,
    },
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Test server running on http://localhost:${PORT}`);
  console.log('\n📝 Test it with:');
  console.log('1. Login: POST http://localhost:3000/login');
  console.log('   Body: { "username": "testuser" }');
  console.log('\n2. Protected: GET http://localhost:3000/protected');
  console.log('   Header: Authorization: Bearer <token>');
  console.log('\n3. Profile: GET http://localhost:3000/profile');
  console.log('   Header: Authorization: Bearer <token>\n');
});
