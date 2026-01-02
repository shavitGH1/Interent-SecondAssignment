const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../src/app');
const User = require('../src/models/User');
const Post = require('../src/models/Post');
const Comment = require('../src/models/Comment');
const Item = require('../src/models/Item');
const Session = require('../src/models/Session');

const registerAndLogin = async (email = 'user@example.com', password = 'password123', content = 'bio') => {
  await request(app).post('/api/user/register').send({ email, password, content });
  const loginRes = await request(app).post('/api/user/login').send({ email, password });
  expect(loginRes.status).toBe(200);
  const { accessToken, refreshToken, user } = loginRes.body;
  return { accessToken, refreshToken, user };
};

describe('REST API', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/second_assignment';
    await mongoose.connect(mongoUri);
  }, 30000);

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    await Item.deleteMany({});
    await Session.deleteMany({});
  });

  it('returns health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  }, 10000);

  it('supports basic item CRUD', async () => {
    const create = await request(app).post('/api/items').send({ name: 'Item', price: 5 });
    expect(create.status).toBe(201);

    const list = await request(app).get('/api/items');
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);

    const { id } = create.body;
    const read = await request(app).get(`/api/items/${id}`);
    expect(read.status).toBe(200);

    const update = await request(app).put(`/api/items/${id}`).send({ name: 'New', price: 6 });
    expect(update.status).toBe(200);

    const del = await request(app).delete(`/api/items/${id}`);
    expect(del.status).toBe(204);
  }, 15000);

  it('handles user auth lifecycle', async () => {
    const { accessToken, refreshToken } = await registerAndLogin('auth@test.com', 'secret');

    const profile = await request(app).get('/api/user/profile').set('Authorization', `Bearer ${accessToken}`);
    expect(profile.status).toBe(200);
    expect(profile.body.email).toBe('auth@test.com');

    const refreshed = await request(app).post('/api/user/refresh').send({ refreshToken });
    expect(refreshed.status).toBe(200);
    const newAccessToken = refreshed.body.accessToken;
    expect(newAccessToken).toBeDefined();

    const logout = await request(app)
      .post('/api/user/logout')
      .set('Authorization', `Bearer ${newAccessToken}`);
    expect(logout.status).toBe(204);

    const afterLogout = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${newAccessToken}`);
    expect(afterLogout.status).toBe(401);
  }, 15000);

  it('creates, reads, filters, and updates posts', async () => {
    const { accessToken, user } = await registerAndLogin('post@test.com', 'secret');

    const created = await request(app)
      .post('/api/post')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Hello world' });
    expect(created.status).toBe(201);
    expect(created.body.sender_id).toBe(user.sender_id);

    const list = await request(app).get('/api/post');
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);

    const filtered = await request(app).get(`/api/post?sender=${user.sender_id}`);
    expect(filtered.body).toHaveLength(1);

    const fetched = await request(app).get(`/api/post/${created.body.id}`);
    expect(fetched.status).toBe(200);

    const updated = await request(app)
      .put(`/api/post/${created.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Updated content' });
    expect(updated.status).toBe(200);
    expect(updated.body.content).toBe('Updated content');
  }, 15000);

  it('enforces ownership on post updates', async () => {
    const owner = await registerAndLogin('owner@test.com', 'secret');
    const other = await registerAndLogin('other@test.com', 'secret');

    const created = await request(app)
      .post('/api/post')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({ content: 'Owner post' });

    const forbidden = await request(app)
      .put(`/api/post/${created.body.id}`)
      .set('Authorization', `Bearer ${other.accessToken}`)
      .send({ content: 'Hacked' });
    expect(forbidden.status).toBe(403);
  }, 15000);

  it('manages comments tied to posts', async () => {
    const { accessToken } = await registerAndLogin('comment@test.com', 'secret');
    const post = await request(app)
      .post('/api/post')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Post for comments' });

    const createdComment = await request(app)
      .post('/api/comment')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'First comment', post_id: post.body.id });
    expect(createdComment.status).toBe(201);

    const byId = await request(app).get(`/api/comment/${createdComment.body.id}`);
    expect(byId.status).toBe(200);

    const byPost = await request(app).get(`/api/comment?post=${post.body.id}`);
    expect(byPost.status).toBe(200);
    expect(byPost.body).toHaveLength(1);

    const updated = await request(app)
      .put(`/api/comment/${createdComment.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Edited' });
    expect(updated.status).toBe(200);
    expect(updated.body.content).toBe('Edited');

    const deleted = await request(app)
      .delete(`/api/comment/${createdComment.body.id}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(deleted.status).toBe(204);

    const missing = await request(app).get(`/api/comment/${createdComment.body.id}`);
    expect(missing.status).toBe(404);
  }, 15000);
});
