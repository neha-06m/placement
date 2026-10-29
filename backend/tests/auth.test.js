const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../src/app');
const User = require('../src/models/User');

let mongoServer;

before(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

after(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
});

test('GET /api/health should return ok status', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.ok(res.body.timestamp);
});

test('POST /api/auth/register should register a student successfully', async () => {
  const payload = {
    name: 'Aarav Sharma',
    email: 'aarav@university.edu',
    password: 'password123',
    role: 'student',
    studentDetails: {
      rollNumber: 'CS2025-01',
      department: 'Computer Science',
      batchYear: 2025,
      cgpa: 8.9
    }
  };

  const res = await request(app).post('/api/auth/register').send(payload);

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.ok(res.body.token);
  assert.equal(res.body.user.email, 'aarav@university.edu');
  assert.equal(res.body.user.role, 'student');
  assert.equal(res.body.user.password, undefined); // Password must not be exposed
  assert.equal(res.body.user.studentProfile.department, 'Computer Science');
});

test('POST /api/auth/register should reject duplicate email', async () => {
  const payload = {
    name: 'Aarav Sharma',
    email: 'duplicate@university.edu',
    password: 'password123',
    role: 'student'
  };

  const firstRes = await request(app).post('/api/auth/register').send(payload);
  assert.equal(firstRes.status, 201);

  const secondRes = await request(app).post('/api/auth/register').send(payload);
  assert.equal(secondRes.status, 400);
  assert.equal(secondRes.body.success, false);
  assert.match(secondRes.body.message, /already exists/i);
});

test('POST /api/auth/register should reject short password (< 6 chars)', async () => {
  const payload = {
    name: 'Short Pass',
    email: 'short@university.edu',
    password: '123',
    role: 'student'
  };

  const res = await request(app).post('/api/auth/register').send(payload);
  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /at least 6 characters/i);
});

test('POST /api/auth/register should register a company with isVerified=false', async () => {
  const payload = {
    name: 'TechCorp Recruiter',
    email: 'recruiter@techcorp.com',
    password: 'securePassword99',
    role: 'company',
    companyDetails: {
      companyName: 'TechCorp Solutions',
      website: 'https://techcorp.com',
      industry: 'Software & Cloud',
      location: 'Bangalore'
    }
  };

  const res = await request(app).post('/api/auth/register').send(payload);
  assert.equal(res.status, 201);
  assert.equal(res.body.user.role, 'company');
  assert.equal(res.body.user.companyProfile.companyName, 'TechCorp Solutions');
  assert.equal(res.body.user.companyProfile.isVerified, false);
});

test('POST /api/auth/login should authenticate valid user', async () => {
  await request(app).post('/api/auth/register').send({
    name: 'Priya Verma',
    email: 'priya@university.edu',
    password: 'password123',
    role: 'student'
  });

  const res = await request(app).post('/api/auth/login').send({
    email: 'priya@university.edu',
    password: 'password123'
  });

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.token);
  assert.equal(res.body.user.email, 'priya@university.edu');
});

test('POST /api/auth/login should reject incorrect password', async () => {
  await request(app).post('/api/auth/register').send({
    name: 'Priya Verma',
    email: 'priya2@university.edu',
    password: 'correctPassword',
    role: 'student'
  });

  const res = await request(app).post('/api/auth/login').send({
    email: 'priya2@university.edu',
    password: 'wrongPassword'
  });

  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Invalid credentials/i);
});

test('GET /api/auth/me should return user details for authenticated user', async () => {
  const regRes = await request(app).post('/api/auth/register').send({
    name: 'Admin Officer',
    email: 'admin@placemate.edu',
    password: 'adminPassword123',
    role: 'admin'
  });

  const token = regRes.body.token;

  const res = await request(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${token}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.user.email, 'admin@placemate.edu');
  assert.equal(res.body.user.role, 'admin');
});

test('GET /api/auth/me should reject request without token', async () => {
  const res = await request(app).get('/api/auth/me');
  assert.equal(res.status, 401);
  assert.equal(res.body.success, false);
});

test('Role-based route authorization: student vs admin route', async () => {
  const studentRes = await request(app).post('/api/auth/register').send({
    name: 'Student User',
    email: 'student@placemate.edu',
    password: 'studentPassword123',
    role: 'student'
  });
  const studentToken = studentRes.body.token;

  // Student accessing student dashboard endpoint -> Allowed (200)
  const allowedRes = await request(app)
    .get('/api/auth/student/overview')
    .set('Authorization', `Bearer ${studentToken}`);
  assert.equal(allowedRes.status, 200);
  assert.equal(allowedRes.body.role, 'student');

  // Student accessing admin dashboard endpoint -> Forbidden (403)
  const forbiddenRes = await request(app)
    .get('/api/auth/admin/overview')
    .set('Authorization', `Bearer ${studentToken}`);
  assert.equal(forbiddenRes.status, 403);
  assert.equal(forbiddenRes.body.success, false);
  assert.match(forbiddenRes.body.message, /Access denied for role/i);
});

test('Role-based route authorization: company vs student route', async () => {
  const companyRes = await request(app).post('/api/auth/register').send({
    name: 'Recruiter User',
    email: 'recruiter@hiring.com',
    password: 'recruiterPassword123',
    role: 'company'
  });
  const companyToken = companyRes.body.token;

  // Company accessing company dashboard -> Allowed (200)
  const allowedRes = await request(app)
    .get('/api/auth/company/overview')
    .set('Authorization', `Bearer ${companyToken}`);
  assert.equal(allowedRes.status, 200);
  assert.equal(allowedRes.body.role, 'company');

  // Company accessing student dashboard -> Forbidden (403)
  const forbiddenRes = await request(app)
    .get('/api/auth/student/overview')
    .set('Authorization', `Bearer ${companyToken}`);
  assert.equal(forbiddenRes.status, 403);
  assert.equal(forbiddenRes.body.success, false);
});
