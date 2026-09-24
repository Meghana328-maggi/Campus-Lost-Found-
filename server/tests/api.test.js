const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');

describe('Campus Lost & Found Platform API Tests', () => {
  let authToken = '';
  let adminToken = '';

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_lost_found';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Health Check', () => {
    it('should return 200 and healthy status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('healthy');
    });
  });

  describe('Authentication API', () => {
    it('should login student user successfully', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'alex@campuslostfound.edu',
        password: 'UserPass123!',
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('alex@campuslostfound.edu');
      authToken = res.body.data.token;
    });

    it('should login admin user successfully', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'admin@campuslostfound.edu',
        password: 'AdminPass123!',
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('admin');
      adminToken = res.body.data.token;
    });

    it('should reject invalid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'alex@campuslostfound.edu',
        password: 'WrongPassword!',
      });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should get current logged in profile with token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.user.name).toBe('Alex Johnson');
    });
  });

  describe('Items & Matching API', () => {
    it('should retrieve items list with pagination', async () => {
      const res = await request(app).get('/api/items?page=1&limit=5');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
    });

    it('should filter items by type', async () => {
      const res = await request(app).get('/api/items?type=found');
      expect(res.statusCode).toBe(200);
      res.body.data.items.forEach((item) => {
        expect(item.type).toBe('found');
      });
    });

    it('should check for potential duplicates', async () => {
      const res = await request(app).post('/api/items/check-duplicates').send({
        title: 'Apple MacBook Air Space Gray Laptop',
        type: 'found',
        category: 'Electronics & Gadgets',
      });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.duplicates)).toBe(true);
    });
  });

  describe('Admin Authorization', () => {
    it('should deny non-admin users from admin dashboard', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(403);
    });

    it('should allow admin user to access admin dashboard metrics', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.statusCode).toBe(200);
      expect(res.body.data.metrics).toBeDefined();
      expect(res.body.data.metrics.totalUsers).toBeGreaterThan(0);
    });
  });
});
