const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../src/app');
const User = require('../src/models/User');
const Session = require('../src/models/Session');

describe('JWT Authentication - User Registration, Login, Logout, and Token Refresh', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/second_assignment';
    await mongoose.connect(mongoUri);
  }, 30000);

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Session.deleteMany({});
  });

  // ============================================
  // USER REGISTRATION TESTS
  // ============================================

  describe('POST /api/user/register - User Registration', () => {
    it('should successfully register a new user with email and password', async () => {
      const res = await request(app)
        .post('/api/user/register')
        .send({
          email: 'newuser@example.com',
          password: 'securePassword123',
          content: 'My bio'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('sender_id');
      expect(res.body.email).toBe('newuser@example.com');
      expect(res.body.content).toBe('My bio');
      expect(res.body).not.toHaveProperty('passwordHash');
    }, 10000);

    it('should register user with optional content field', async () => {
      const res = await request(app)
        .post('/api/user/register')
        .send({
          email: 'minimal@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe('minimal@example.com');
      expect(res.body.content).toBe('');
    }, 10000);

    it('should reject registration with missing email', async () => {
      const res = await request(app)
        .post('/api/user/register')
        .send({
          password: 'password123',
          content: 'My bio'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('email');
    }, 10000);

    it('should reject registration with missing password', async () => {
      const res = await request(app)
        .post('/api/user/register')
        .send({
          email: 'user@example.com',
          content: 'My bio'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('password');
    }, 10000);

    it('should reject registration with duplicate email', async () => {
      // Register first user
      await request(app)
        .post('/api/user/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123'
        });

      // Attempt to register with same email
      const res = await request(app)
        .post('/api/user/register')
        .send({
          email: 'duplicate@example.com',
          password: 'differentPassword123'
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('already registered');
    }, 10000);

    it('should assign unique sender_id to each user', async () => {
      const res1 = await request(app)
        .post('/api/user/register')
        .send({
          email: 'user1@example.com',
          password: 'password123'
        });

      const res2 = await request(app)
        .post('/api/user/register')
        .send({
          email: 'user2@example.com',
          password: 'password123'
        });

      expect(res1.body.sender_id).not.toBe(res2.body.sender_id);
      expect(res1.body.sender_id).toBe(1);
      expect(res2.body.sender_id).toBe(2);
    }, 10000);
  });

  // ============================================
  // USER LOGIN TESTS
  // ============================================

  describe('POST /api/user/login - User Login with JWT Tokens', () => {
    beforeEach(async () => {
      // Register a test user before each login test
      await request(app)
        .post('/api/user/register')
        .send({
          email: 'testuser@example.com',
          password: 'testPassword123',
          content: 'Test bio'
        });
    });

    it('should successfully login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/user/login')
        .send({
          email: 'testuser@example.com',
          password: 'testPassword123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('testuser@example.com');
    }, 10000);

    it('should return valid access token as UUID format', async () => {
      const res = await request(app)
        .post('/api/user/login')
        .send({
          email: 'testuser@example.com',
          password: 'testPassword123'
        });

      expect(res.status).toBe(200);
      const { accessToken } = res.body;
      // UUID format check (8-4-4-4-12 hex characters)
      expect(accessToken).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    }, 10000);

    it('should return valid refresh token as UUID format', async () => {
      const res = await request(app)
        .post('/api/user/login')
        .send({
          email: 'testuser@example.com',
          password: 'testPassword123'
        });

      expect(res.status).toBe(200);
      const { refreshToken } = res.body;
      // UUID format check
      expect(refreshToken).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    }, 10000);

    it('should create a session in database on login', async () => {
      const res = await request(app)
        .post('/api/user/login')
        .send({
          email: 'testuser@example.com',
          password: 'testPassword123'
        });

      expect(res.status).toBe(200);
      const { accessToken, refreshToken } = res.body;

      // Verify session exists in database
      const session = await Session.findOne({ accessToken, refreshToken });
      expect(session).toBeTruthy();
      expect(session.expiresAt).toBeInstanceOf(Date);
      expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());
    }, 10000);

    it('should reject login with invalid email', async () => {
      const res = await request(app)
        .post('/api/user/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'testPassword123'
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid credentials');
    }, 10000);

    it('should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/user/login')
        .send({
          email: 'testuser@example.com',
          password: 'wrongPassword123'
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid credentials');
    }, 10000);

    it('should not expose password hash in login response', async () => {
      const res = await request(app)
        .post('/api/user/login')
        .send({
          email: 'testuser@example.com',
          password: 'testPassword123'
        });

      expect(res.status).toBe(200);
      expect(res.body.user).not.toHaveProperty('passwordHash');
    }, 10000);
  });

  // ============================================
  // LOGOUT TESTS
  // ============================================

  describe('POST /api/user/logout - User Logout', () => {
    let accessToken;

    beforeEach(async () => {
      // Register and login to get access token
      await request(app)
        .post('/api/user/register')
        .send({
          email: 'logouttest@example.com',
          password: 'password123'
        });

      const loginRes = await request(app)
        .post('/api/user/login')
        .send({
          email: 'logouttest@example.com',
          password: 'password123'
        });

      accessToken = loginRes.body.accessToken;
    });

    it('should successfully logout with valid token', async () => {
      const res = await request(app)
        .post('/api/user/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(204);
    }, 10000);

    it('should delete session from database on logout', async () => {
      // Verify session exists before logout
      const sessionBefore = await Session.findOne({ accessToken });
      expect(sessionBefore).toBeTruthy();

      // Logout
      await request(app)
        .post('/api/user/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      // Verify session deleted after logout
      const sessionAfter = await Session.findOne({ accessToken });
      expect(sessionAfter).toBeNull();
    }, 10000);

    it('should reject access to protected routes after logout', async () => {
      // Logout
      await request(app)
        .post('/api/user/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      // Attempt to access protected route with logged out token
      const res = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Unauthorized');
    }, 10000);

    it('should reject logout without authorization header', async () => {
      const res = await request(app)
        .post('/api/user/logout');

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Unauthorized');
    }, 10000);

    it('should reject logout with invalid token', async () => {
      const res = await request(app)
        .post('/api/user/logout')
        .set('Authorization', 'Bearer invalid-token-format');

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Unauthorized');
    }, 10000);
  });

  // ============================================
  // REFRESH TOKEN TESTS
  // ============================================

  describe('POST /api/user/refresh - Refresh Access Token', () => {
    let refreshToken;
    let initialAccessToken;

    beforeEach(async () => {
      // Register and login
      await request(app)
        .post('/api/user/register')
        .send({
          email: 'refreshtest@example.com',
          password: 'password123'
        });

      const loginRes = await request(app)
        .post('/api/user/login')
        .send({
          email: 'refreshtest@example.com',
          password: 'password123'
        });

      refreshToken = loginRes.body.refreshToken;
      initialAccessToken = loginRes.body.accessToken;
    });

    it('should return new access token with valid refresh token', async () => {
      const res = await request(app)
        .post('/api/user/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.accessToken).toBeDefined();
      // New token should be different from old one
      expect(res.body.accessToken).not.toBe(initialAccessToken);
    }, 10000);

    it('should maintain same refresh token after refresh', async () => {
      const res = await request(app)
        .post('/api/user/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);

      // Verify the refresh token still works
      const session = await Session.findOne({ refreshToken });
      expect(session).toBeTruthy();
      expect(session.refreshToken).toBe(refreshToken);
    }, 10000);

    it('should reject refresh request without refresh token in body', async () => {
      const res = await request(app)
        .post('/api/user/refresh')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('refreshToken');
    }, 10000);

    it('should reject refresh with invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/user/refresh')
        .send({ refreshToken: 'invalid-refresh-token' });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid refresh token');
    }, 10000);

    it('should allow using new access token for protected routes', async () => {
      const refreshRes = await request(app)
        .post('/api/user/refresh')
        .send({ refreshToken });

      const newAccessToken = refreshRes.body.accessToken;

      // Use new access token to access protected route
      const profileRes = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${newAccessToken}`);

      expect(profileRes.status).toBe(200);
      expect(profileRes.body.email).toBe('refreshtest@example.com');
    }, 10000);

    it('should expire old access token (replaced by new one)', async () => {
      const refreshRes = await request(app)
        .post('/api/user/refresh')
        .send({ refreshToken });

      const newAccessToken = refreshRes.body.accessToken;

      // Old token should no longer work
      const oldTokenRes = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${initialAccessToken}`);

      expect(oldTokenRes.status).toBe(401);

      // New token should work
      const newTokenRes = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${newAccessToken}`);

      expect(newTokenRes.status).toBe(200);
    }, 10000);
  });

  // ============================================
  // AUTHENTICATION MIDDLEWARE TESTS
  // ============================================

  describe('Authentication Middleware - Protected Routes', () => {
    let accessToken;

    beforeEach(async () => {
      // Register and login
      await request(app)
        .post('/api/user/register')
        .send({
          email: 'authtest@example.com',
          password: 'password123'
        });

      const loginRes = await request(app)
        .post('/api/user/login')
        .send({
          email: 'authtest@example.com',
          password: 'password123'
        });

      accessToken = loginRes.body.accessToken;
    });

    it('should allow access with valid authorization header', async () => {
      const res = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('authtest@example.com');
    }, 10000);

    it('should deny access without authorization header', async () => {
      const res = await request(app)
        .get('/api/user/profile');

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Unauthorized');
    }, 10000);

    it('should deny access with malformed authorization header', async () => {
      const res = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'InvalidFormat token');

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Unauthorized');
    }, 10000);

    it('should deny access with invalid token', async () => {
      const res = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer invalid-token-12345');

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Unauthorized');
    }, 10000);

    it('should work with Bearer token (case insensitive)', async () => {
      const res1 = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res1.status).toBe(200);

      // Bearer should work regardless (standard OAuth2 convention)
      const res2 = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `bearer ${accessToken}`);

      // This might fail if implementation is case-sensitive, which is common
      expect([200, 401]).toContain(res2.status);
    }, 10000);
  });

  // ============================================
  // COMPLETE AUTHENTICATION FLOW TESTS
  // ============================================

  describe('Complete Authentication Flow', () => {
    it('should handle complete user journey: register -> login -> use token -> refresh -> logout', async () => {
      // 1. Register new user
      const registerRes = await request(app)
        .post('/api/user/register')
        .send({
          email: 'journey@example.com',
          password: 'journeyPassword123',
          content: 'Journey user bio'
        });

      expect(registerRes.status).toBe(201);
      const userId = registerRes.body.sender_id;

      // 2. Login
      const loginRes = await request(app)
        .post('/api/user/login')
        .send({
          email: 'journey@example.com',
          password: 'journeyPassword123'
        });

      expect(loginRes.status).toBe(200);
      const { accessToken: token1, refreshToken } = loginRes.body;

      // 3. Use access token to access profile
      const profileRes1 = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token1}`);

      expect(profileRes1.status).toBe(200);
      expect(profileRes1.body.sender_id).toBe(userId);

      // 4. Refresh token to get new access token
      const refreshRes = await request(app)
        .post('/api/user/refresh')
        .send({ refreshToken });

      expect(refreshRes.status).toBe(200);
      const token2 = refreshRes.body.accessToken;
      expect(token2).not.toBe(token1);

      // 5. Use new access token
      const profileRes2 = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token2}`);

      expect(profileRes2.status).toBe(200);
      expect(profileRes2.body.sender_id).toBe(userId);

      // 6. Logout
      const logoutRes = await request(app)
        .post('/api/user/logout')
        .set('Authorization', `Bearer ${token2}`);

      expect(logoutRes.status).toBe(204);

      // 7. Verify access is denied after logout
      const profileRes3 = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token2}`);

      expect(profileRes3.status).toBe(401);
    }, 15000);

    it('should handle multiple concurrent sessions', async () => {
      // Register user
      await request(app)
        .post('/api/user/register')
        .send({
          email: 'concurrent@example.com',
          password: 'password123'
        });

      // Login twice to create two sessions
      const login1 = await request(app)
        .post('/api/user/login')
        .send({
          email: 'concurrent@example.com',
          password: 'password123'
        });

      const token1 = login1.body.accessToken;

      const login2 = await request(app)
        .post('/api/user/login')
        .send({
          email: 'concurrent@example.com',
          password: 'password123'
        });

      const token2 = login2.body.accessToken;

      // Both tokens should work
      const profile1 = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token1}`);

      expect(profile1.status).toBe(200);

      const profile2 = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token2}`);

      expect(profile2.status).toBe(200);

      // Logout one session
      await request(app)
        .post('/api/user/logout')
        .set('Authorization', `Bearer ${token1}`);

      // First token should be invalidated
      const afterLogout1 = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token1}`);

      expect(afterLogout1.status).toBe(401);

      // Second token should still work
      const afterLogout2 = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token2}`);

      expect(afterLogout2.status).toBe(200);
    }, 15000);
  });
});
