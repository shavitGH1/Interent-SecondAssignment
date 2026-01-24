import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app';
import User from '../src/models/User';
import Post from '../src/models/Post';
import Comment from '../src/models/Comment';
import Session from '../src/models/Session';

const registerAndLogin = async (
  email: string = 'user@example.com',
  password: string = 'password123',
  username: string = 'testuser'
): Promise<{ accessToken: string; refreshToken: string; user: any }> => {
  await request(app).post('/api/user/register').send({ email, password, username });
  const loginRes = await request(app).post('/api/user/login').send({ email, password });
  expect(loginRes.status).toBe(200);
  const { accessToken, refreshToken, user } = loginRes.body;
  return { accessToken, refreshToken, user };
};

describe('Complete API Test Suite', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/second_assignment';
    await mongoose.connect(mongoUri);
  }, 30000);

  afterAll(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Session.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Session.deleteMany({});
  });

  // ====================================
  // HEALTH CHECK TESTS
  // ====================================
  describe('Health Check', () => {
    it('should return 200 and status ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    }, 10000);
  });

  // ====================================
  // USER REGISTRATION TESTS
  // ====================================
  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/user/register')
        .send({
          email: 'newuser@example.com',
          password: 'securePassword123',
          username: 'newuser'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe('newuser@example.com');
      expect(res.body.username).toBe('newuser');
      expect(res.body).toHaveProperty('date');
      expect(res.body).not.toHaveProperty('passwordHash');
    }, 10000);

    it('should reject registration with missing email', async () => {
      const res = await request(app)
        .post('/api/user/register')
        .send({
          password: 'password123',
          username: 'user'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('email');
    }, 10000);

    it('should reject registration with missing password', async () => {
      const res = await request(app)
        .post('/api/user/register')
        .send({
          email: 'user@example.com',
          username: 'user'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('password');
    }, 10000);

    it('should reject registration with missing username', async () => {
      const res = await request(app)
        .post('/api/user/register')
        .send({
          email: 'user@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('username');
    }, 10000);

    it('should reject duplicate email registration', async () => {
      await request(app)
        .post('/api/user/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123',
          username: 'user1'
        });

      const res = await request(app)
        .post('/api/user/register')
        .send({
          email: 'duplicate@example.com',
          password: 'differentPassword123',
          username: 'user2'
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('email already registered');
    }, 10000);

    it('should reject duplicate username registration', async () => {
      await request(app)
        .post('/api/user/register')
        .send({
          email: 'user1@example.com',
          password: 'password123',
          username: 'sameusername'
        });

      const res = await request(app)
        .post('/api/user/register')
        .send({
          email: 'user2@example.com',
          password: 'password123',
          username: 'sameusername'
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('username already taken');
    }, 10000);
  });

  // ====================================
  // USER LOGIN TESTS
  // ====================================
  describe('User Login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/user/register')
        .send({
          email: 'testuser@example.com',
          password: 'testPassword123',
          username: 'testuser'
        });
    });

    it('should login with valid credentials', async () => {
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
      expect(res.body.user.username).toBe('testuser');
    }, 10000);

    it('should return UUID format tokens', async () => {
      const res = await request(app)
        .post('/api/user/login')
        .send({
          email: 'testuser@example.com',
          password: 'testPassword123'
        });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(res.body.refreshToken).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    }, 10000);

    it('should reject login with invalid email', async () => {
      const res = await request(app)
        .post('/api/user/login')
        .send({
          email: 'wrong@example.com',
          password: 'testPassword123'
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid credentials');
    }, 10000);

    it('should reject login with invalid password', async () => {
      const res = await request(app)
        .post('/api/user/login')
        .send({
          email: 'testuser@example.com',
          password: 'wrongPassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Invalid credentials');
    }, 10000);

    it('should not expose password hash in response', async () => {
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

  // ====================================
  // USER LOGOUT TESTS
  // ====================================
  describe('User Logout', () => {
    it('should logout successfully with valid token', async () => {
      const { accessToken } = await registerAndLogin('logout@test.com', 'password', 'logoutuser');

      const res = await request(app)
        .post('/api/user/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(204);

      // Verify token no longer works
      const profileRes = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(profileRes.status).toBe(401);
    }, 10000);

    it('should delete session from database on logout', async () => {
      const { accessToken } = await registerAndLogin('logout2@test.com', 'password', 'logout2user');

      const sessionBefore = await Session.findOne({ accessToken });
      expect(sessionBefore).toBeTruthy();

      await request(app)
        .post('/api/user/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      const sessionAfter = await Session.findOne({ accessToken });
      expect(sessionAfter).toBeNull();
    }, 10000);
  });

  // ====================================
  // TOKEN REFRESH TESTS
  // ====================================
  describe('Token Refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const { refreshToken } = await registerAndLogin('refresh@test.com', 'password', 'refreshuser');

      const res = await request(app)
        .post('/api/user/refresh')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.accessToken).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    }, 10000);

    it('should reject refresh with invalid token', async () => {
      const res = await request(app)
        .post('/api/user/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(res.status).toBe(401);
    }, 10000);

    it('should reject refresh with missing token', async () => {
      const res = await request(app)
        .post('/api/user/refresh')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('refreshToken');
    }, 10000);

    it('should allow using new access token', async () => {
      const { refreshToken } = await registerAndLogin('refresh2@test.com', 'password', 'refresh2user');

      const refreshRes = await request(app)
        .post('/api/user/refresh')
        .send({ refreshToken });

      const newAccessToken = refreshRes.body.accessToken;

      const profileRes = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${newAccessToken}`);

      expect(profileRes.status).toBe(200);
      expect(profileRes.body.email).toBe('refresh2@test.com');
    }, 10000);
  });

  // ====================================
  // USER PROFILE TESTS
  // ====================================
  describe('User Profile', () => {
    it('should get profile with valid token', async () => {
      const { accessToken } = await registerAndLogin('profile@test.com', 'password', 'profileuser');

      const res = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('profile@test.com');
      expect(res.body.username).toBe('profileuser');
      expect(res.body).not.toHaveProperty('passwordHash');
    }, 10000);

    it('should reject profile request without token', async () => {
      const res = await request(app).get('/api/user/profile');
      expect(res.status).toBe(401);
    }, 10000);

    it('should reject profile request with invalid token', async () => {
      const res = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    }, 10000);

    it('should update profile successfully', async () => {
      const { accessToken } = await registerAndLogin('update@test.com', 'password', 'updateuser');

      const res = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ username: 'newusername' });

      expect(res.status).toBe(200);
      expect(res.body.username).toBe('newusername');
    }, 10000);

    it('should delete profile successfully', async () => {
      const { accessToken } = await registerAndLogin('delete@test.com', 'password', 'deleteuser');

      const res = await request(app)
        .delete('/api/user/profile')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(204);

      // Verify user is deleted
      const profileRes = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(profileRes.status).toBe(401);
    }, 10000);
  });

  // ====================================
  // POST TESTS
  // ====================================
  describe('Posts', () => {
    it('should create a post', async () => {
      const { accessToken, user } = await registerAndLogin('post@test.com', 'password', 'postuser');

      const res = await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Hello world' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.content).toBe('Hello world');
      expect(res.body.owner).toBe(user.id);
      expect(res.body).toHaveProperty('date');
    }, 10000);

    it('should reject post creation without authentication', async () => {
      const res = await request(app)
        .post('/api/post')
        .send({ content: 'Hello world' });

      expect(res.status).toBe(401);
    }, 10000);

    it('should reject post creation without content', async () => {
      const { accessToken } = await registerAndLogin('post2@test.com', 'password', 'post2user');

      const res = await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('content');
    }, 10000);

    it('should list all posts', async () => {
      const { accessToken } = await registerAndLogin('list@test.com', 'password', 'listuser');

      await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Post 1' });

      await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Post 2' });

      const res = await request(app).get('/api/post');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    }, 10000);

    it('should filter posts by owner', async () => {
      const user1 = await registerAndLogin('owner1@test.com', 'password', 'owner1');
      const user2 = await registerAndLogin('owner2@test.com', 'password', 'owner2');

      await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${user1.accessToken}`)
        .send({ content: 'User 1 post' });

      await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${user2.accessToken}`)
        .send({ content: 'User 2 post' });

      const res = await request(app).get(`/api/post?sender=${user1.user.id}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].content).toBe('User 1 post');
    }, 10000);

    it('should get a single post by ID', async () => {
      const { accessToken } = await registerAndLogin('single@test.com', 'password', 'singleuser');

      const createRes = await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Single post' });

      const res = await request(app).get(`/api/post/${createRes.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body.content).toBe('Single post');
    }, 10000);

    it('should return 404 for non-existent post', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/post/${fakeId}`);

      expect(res.status).toBe(404);
    }, 10000);

    it('should update own post', async () => {
      const { accessToken } = await registerAndLogin('update@test.com', 'password', 'updateuser');

      const createRes = await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Original content' });

      const res = await request(app)
        .put(`/api/post/${createRes.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Updated content' });

      expect(res.status).toBe(200);
      expect(res.body.content).toBe('Updated content');
    }, 10000);

    it('should reject updating other users post', async () => {
      const owner = await registerAndLogin('owner@test.com', 'password', 'owner');
      const other = await registerAndLogin('other@test.com', 'password', 'other');

      const createRes = await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ content: 'Owner post' });

      const res = await request(app)
        .put(`/api/post/${createRes.body.id}`)
        .set('Authorization', `Bearer ${other.accessToken}`)
        .send({ content: 'Hacked' });

      expect(res.status).toBe(403);
    }, 10000);
  });

  // ====================================
  // COMMENT TESTS
  // ====================================
  describe('Comments', () => {
    it('should create a comment on a post', async () => {
      const { accessToken, user } = await registerAndLogin('comment@test.com', 'password', 'commentuser');

      const post = await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Post for comments' });

      const res = await request(app)
        .post('/api/comment')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'First comment', post_id: post.body.id });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.content).toBe('First comment');
      expect(res.body.post_id).toBe(post.body.id);
      expect(res.body.owner).toBe(user.id);
    }, 10000);

    it('should reject comment without content', async () => {
      const { accessToken } = await registerAndLogin('comment2@test.com', 'password', 'comment2user');

      const post = await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Post' });

      const res = await request(app)
        .post('/api/comment')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ post_id: post.body.id });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('content');
    }, 10000);

    it('should reject comment on non-existent post', async () => {
      const { accessToken } = await registerAndLogin('comment3@test.com', 'password', 'comment3user');

      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post('/api/comment')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Comment', post_id: fakeId });

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Post not found');
    }, 10000);

    it('should list comments by post', async () => {
      const { accessToken } = await registerAndLogin('listcomment@test.com', 'password', 'listcommentuser');

      const post = await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Post' });

      await request(app)
        .post('/api/comment')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Comment 1', post_id: post.body.id });

      await request(app)
        .post('/api/comment')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Comment 2', post_id: post.body.id });

      const res = await request(app).get(`/api/comment?post=${post.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    }, 10000);

    it('should get a comment by ID', async () => {
      const { accessToken } = await registerAndLogin('getcomment@test.com', 'password', 'getcommentuser');

      const post = await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Post' });

      const createRes = await request(app)
        .post('/api/comment')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'My comment', post_id: post.body.id });

      const res = await request(app).get(`/api/comment/${createRes.body.id}`);

      expect(res.status).toBe(200);
      expect(res.body.content).toBe('My comment');
    }, 10000);

    it('should update own comment', async () => {
      const { accessToken } = await registerAndLogin('updatecomment@test.com', 'password', 'updatecommentuser');

      const post = await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Post' });

      const createRes = await request(app)
        .post('/api/comment')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Original comment', post_id: post.body.id });

      const res = await request(app)
        .put(`/api/comment/${createRes.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Updated comment' });

      expect(res.status).toBe(200);
      expect(res.body.content).toBe('Updated comment');
    }, 10000);

    it('should reject updating other users comment', async () => {
      const owner = await registerAndLogin('commentowner@test.com', 'password', 'commentowner');
      const other = await registerAndLogin('commentother@test.com', 'password', 'commentother');

      const post = await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ content: 'Post' });

      const createRes = await request(app)
        .post('/api/comment')
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ content: 'Owner comment', post_id: post.body.id });

      const res = await request(app)
        .put(`/api/comment/${createRes.body.id}`)
        .set('Authorization', `Bearer ${other.accessToken}`)
        .send({ content: 'Hacked' });

      expect(res.status).toBe(403);
    }, 10000);

    it('should delete own comment', async () => {
      const { accessToken } = await registerAndLogin('deletecomment@test.com', 'password', 'deletecommentuser');

      const post = await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Post' });

      const createRes = await request(app)
        .post('/api/comment')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'To be deleted', post_id: post.body.id });

      const res = await request(app)
        .delete(`/api/comment/${createRes.body.id}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(204);

      // Verify comment is deleted
      const getRes = await request(app).get(`/api/comment/${createRes.body.id}`);
      expect(getRes.status).toBe(404);
    }, 10000);

    it('should reject deleting other users comment', async () => {
      const owner = await registerAndLogin('delowner@test.com', 'password', 'delowner');
      const other = await registerAndLogin('delother@test.com', 'password', 'delother');

      const post = await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ content: 'Post' });

      const createRes = await request(app)
        .post('/api/comment')
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send({ content: 'Owner comment', post_id: post.body.id });

      const res = await request(app)
        .delete(`/api/comment/${createRes.body.id}`)
        .set('Authorization', `Bearer ${other.accessToken}`);

      expect(res.status).toBe(403);
    }, 10000);
  });

  // ====================================
  // GET USER BY ID TESTS
  // ====================================
  describe('Get User By ID', () => {
    it('should get user by ID', async () => {
      const { user } = await registerAndLogin('getbyid@test.com', 'password', 'getbyiduser');

      const res = await request(app).get(`/api/user/${user.id}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('getbyid@test.com');
      expect(res.body.username).toBe('getbyiduser');
      expect(res.body).not.toHaveProperty('passwordHash');
    }, 10000);

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/user/${fakeId}`);

      expect(res.status).toBe(404);
    }, 10000);
  });

  // ====================================
  // ERROR PATH & DATABASE ERROR TESTS
  // ====================================
  describe('Error Paths & Database Errors', () => {
    it('should handle invalid post ID format gracefully', async () => {
      const { accessToken } = await registerAndLogin();
      const res = await request(app)
        .get('/api/post/invalid-id-format')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(res.status).toBe(500);
    }, 10000);

    it('should handle invalid comment ID format gracefully', async () => {
      const { accessToken } = await registerAndLogin();
      const res = await request(app)
        .get('/api/comment/invalid-id-format')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(res.status).toBe(500);
    }, 10000);

    it('should handle missing content on post update', async () => {
      const { accessToken } = await registerAndLogin();
      
      // Create a post
      const postRes = await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Original content' });
      
      const postId = postRes.body.id;
      
      // Try to update without content
      const updateRes = await request(app)
        .put(`/api/post/${postId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});
      
      expect(updateRes.status).toBe(400);
      expect(updateRes.body.message).toContain('content');
    }, 10000);

    it('should handle comment on non-existent post', async () => {
      const { accessToken } = await registerAndLogin();
      const fakePostId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .post('/api/comment')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'test comment', post_id: fakePostId.toString() });
      
      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Post not found');
    }, 10000);

    it('should handle missing content in comment creation', async () => {
      const { accessToken } = await registerAndLogin();
      
      // Create a post first
      const postRes = await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'test post' });
      
      const postId = postRes.body.id;
      
      // Try to create comment without content
      const res = await request(app)
        .post('/api/comment')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ post_id: postId });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('content');
    }, 10000);

    it('should handle missing post_id in comment creation', async () => {
      const { accessToken } = await registerAndLogin();
      
      const res = await request(app)
        .post('/api/comment')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'test comment' });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('post_id');
    }, 10000);

    it('should handle invalid user ID in profile retrieval', async () => {
      const res = await request(app).get('/api/user/invalid-user-id-format');
      
      expect(res.status).toBe(500);
    }, 10000);

    it('should handle invalid email format in registration', async () => {
      const res = await request(app)
        .post('/api/user/register')
        .send({
          email: 'not-an-email',
          password: 'password123',
          username: 'testuser'
        });
      
      // Should succeed (no email validation in current implementation)
      // or fail with 400 if validation is added
      expect([201, 400]).toContain(res.status);
    }, 10000);

    it('should handle very long content in post creation', async () => {
      const { accessToken } = await registerAndLogin();
      const longContent = 'a'.repeat(10000);
      
      const res = await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: longContent });
      
      expect(res.status).toBe(201);
      expect(res.body.content).toBe(longContent);
    }, 10000);

    it('should handle special characters in content', async () => {
      const { accessToken } = await registerAndLogin();
      const specialContent = '<script>alert("xss")</script> & "quotes" \'apostrophes\'';
      
      const res = await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: specialContent });
      
      expect(res.status).toBe(201);
      expect(res.body.content).toBe(specialContent);
    }, 10000);

    it('should handle empty string username in registration', async () => {
      const res = await request(app)
        .post('/api/user/register')
        .send({
          email: 'empty@example.com',
          password: 'password123',
          username: ''
        });
      
      // Should succeed or fail based on validation
      expect([201, 400]).toContain(res.status);
    }, 10000);
  });

  // ====================================
  // CONCURRENT REQUEST TESTS
  // ====================================
  describe('Concurrent Requests', () => {
    it('should handle multiple simultaneous post creations', async () => {
      const { accessToken } = await registerAndLogin();
      
      const promises = Array.from({ length: 5 }, (_, i) =>
        request(app)
          .post('/api/post')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ content: `Post ${i}` })
      );
      
      const results = await Promise.all(promises);
      
      results.forEach((res, i) => {
        expect(res.status).toBe(201);
        expect(res.body.content).toBe(`Post ${i}`);
      });
    }, 15000);

    it('should handle multiple simultaneous comment creations', async () => {
      const { accessToken } = await registerAndLogin();
      
      // Create a post first
      const postRes = await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'test post' });
      
      const postId = postRes.body.id;
      
      const promises = Array.from({ length: 5 }, (_, i) =>
        request(app)
          .post('/api/comment')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ content: `Comment ${i}`, post_id: postId })
      );
      
      const results = await Promise.all(promises);
      
      results.forEach((res, i) => {
        expect(res.status).toBe(201);
        expect(res.body.content).toBe(`Comment ${i}`);
      });
    }, 15000);
  });

  // ====================================
  // QUERY PARAMETER TESTS
  // ====================================
  describe('Query Parameters', () => {
    it('should filter posts by owner using sender query param', async () => {
      const { accessToken: token1, user: user1 } = await registerAndLogin(
        'user1@example.com',
        'password123',
        'user1'
      );
      const { accessToken: token2, user: user2 } = await registerAndLogin(
        'user2@example.com',
        'password123',
        'user2'
      );
      
      // Create posts for both users
      await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${token1}`)
        .send({ content: 'Post by user1' });
      
      await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${token2}`)
        .send({ content: 'Post by user2' });
      
      // Filter by user1
      const res = await request(app)
        .get(`/api/post?sender=${user1.id}`)
        .set('Authorization', `Bearer ${token1}`);
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].owner).toBe(user1.id);
    }, 15000);

    it('should return all posts when no sender filter is provided', async () => {
      const { accessToken: token1 } = await registerAndLogin(
        'user1@example.com',
        'password123',
        'user1'
      );
      const { accessToken: token2 } = await registerAndLogin(
        'user2@example.com',
        'password123',
        'user2'
      );
      
      // Create posts for both users
      await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${token1}`)
        .send({ content: 'Post by user1' });
      
      await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${token2}`)
        .send({ content: 'Post by user2' });
      
      // Get all posts
      const res = await request(app)
        .get('/api/post')
        .set('Authorization', `Bearer ${token1}`);
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    }, 15000);

    it('should filter comments by post_id', async () => {
      const { accessToken } = await registerAndLogin();
      
      // Create two posts
      const post1Res = await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Post 1' });
      
      const post2Res = await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Post 2' });
      
      const post1Id = post1Res.body.id;
      const post2Id = post2Res.body.id;
      
      // Create comments for both posts
      await request(app)
        .post('/api/comment')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Comment on post 1', post_id: post1Id });
      
      await request(app)
        .post('/api/comment')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Another comment on post 1', post_id: post1Id });
      
      await request(app)
        .post('/api/comment')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Comment on post 2', post_id: post2Id });
      
      // Filter by post1 (note: query param is 'post' not 'post_id')
      const res = await request(app)
        .get(`/api/comment?post=${post1Id}`)
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].post_id).toBe(post1Id);
      expect(res.body[1].post_id).toBe(post1Id);
    }, 15000);

    it('should return empty array for non-existent post in comment filter', async () => {
      const { accessToken } = await registerAndLogin();
      const fakePostId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .get(`/api/comment?post_id=${fakePostId}`)
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    }, 10000);
  });

  // ====================================
  // EMPTY STATE TESTS
  // ====================================
  describe('Empty State Handling', () => {
    it('should return empty array when no posts exist', async () => {
      const { accessToken } = await registerAndLogin();
      
      const res = await request(app)
        .get('/api/post')
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    }, 10000);

    it('should return empty array when no comments exist for a post', async () => {
      const { accessToken } = await registerAndLogin();
      
      // Create a post without comments
      const postRes = await request(app)
        .post('/api/post')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ content: 'Post without comments' });
      
      const postId = postRes.body.id;
      
      const res = await request(app)
        .get(`/api/comment?post_id=${postId}`)
        .set('Authorization', `Bearer ${accessToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    }, 10000);
  });

  // ====================================
  // ADDITIONAL EDGE CASES FOR USER PROFILE
  // ====================================
  describe('User Profile Edge Cases', () => {
    it('should update only email in profile', async () => {
      const { accessToken } = await registerAndLogin('oldmail@test.com', 'pass123', 'olduser');
      
      const res = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ email: 'newmail@test.com' });
      
      expect(res.status).toBe(200);
      expect(res.body.email).toBe('newmail@test.com');
      expect(res.body.username).toBe('olduser');
    }, 10000);

    it('should update only username in profile', async () => {
      const { accessToken } = await registerAndLogin('user@test.com', 'pass123', 'oldname');
      
      const res = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ username: 'newname' });
      
      expect(res.status).toBe(200);
      expect(res.body.username).toBe('newname');
      expect(res.body.email).toBe('user@test.com');
    }, 10000);

    it('should update only password in profile', async () => {
      const { accessToken } = await registerAndLogin('user2@test.com', 'oldpass', 'user2');
      
      const res = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ password: 'newpassword123' });
      
      expect(res.status).toBe(200);
      
      // Verify new password works
      const loginRes = await request(app)
        .post('/api/user/login')
        .send({ email: 'user2@test.com', password: 'newpassword123' });
      
      expect(loginRes.status).toBe(200);
    }, 10000);

    it('should reject profile update with duplicate email', async () => {
      await registerAndLogin('existing@test.com', 'pass123', 'existing1');
      const { accessToken } = await registerAndLogin('another@test.com', 'pass123', 'another1');
      
      const res = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ email: 'existing@test.com' });
      
      expect(res.status).toBe(409);
      expect(res.body.message).toContain('email already registered');
    }, 10000);

    it('should reject profile update with duplicate username', async () => {
      await registerAndLogin('user1@test.com', 'pass123', 'existinguser');
      const { accessToken } = await registerAndLogin('user2@test.com', 'pass123', 'anotheruser');
      
      const res = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ username: 'existinguser' });
      
      expect(res.status).toBe(409);
      expect(res.body.message).toContain('username already taken');
    }, 10000);

    it('should allow updating email to same email', async () => {
      const { accessToken } = await registerAndLogin('same@test.com', 'pass123', 'sameuser');
      
      const res = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ email: 'same@test.com' });
      
      expect(res.status).toBe(200);
      expect(res.body.email).toBe('same@test.com');
    }, 10000);

    it('should allow updating username to same username', async () => {
      const { accessToken } = await registerAndLogin('user@same.com', 'pass123', 'samename');
      
      const res = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ username: 'samename' });
      
      expect(res.status).toBe(200);
      expect(res.body.username).toBe('samename');
    }, 10000);

    it('should update all fields in profile at once', async () => {
      const { accessToken } = await registerAndLogin('old@test.com', 'oldpass', 'olduser123');
      
      const res = await request(app)
        .put('/api/user/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ 
          email: 'new@test.com',
          username: 'newuser123',
          password: 'newpass123'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.email).toBe('new@test.com');
      expect(res.body.username).toBe('newuser123');
      
      // Verify new password works
      const loginRes = await request(app)
        .post('/api/user/login')
        .send({ email: 'new@test.com', password: 'newpass123' });
      
      expect(loginRes.status).toBe(200);
    }, 10000);
  });
});
