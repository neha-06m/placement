const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

const app = require('../src/app');
const User = require('../src/models/User');
const StudentProfile = require('../src/models/StudentProfile');
const CompanyProfile = require('../src/models/CompanyProfile');

let mongoServer;
let studentToken;
let companyToken;
let adminToken;
let studentUser;
let companyUser;
let adminUser;

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
  await StudentProfile.deleteMany({});
  await CompanyProfile.deleteMany({});

  // 1. Create student
  const studentRes = await request(app).post('/api/auth/register').send({
    name: 'Rohan Sharma',
    email: 'rohan@university.edu',
    password: 'password123',
    role: 'student',
    studentDetails: {
      rollNumber: 'CS2025-099',
      department: 'Computer Science',
      batchYear: 2025,
      cgpa: 8.5
    }
  });
  studentToken = studentRes.body.token;
  studentUser = studentRes.body.user;

  // 2. Create company recruiter
  const companyRes = await request(app).post('/api/auth/register').send({
    name: 'Ananya Recruiter',
    email: 'ananya@techventures.io',
    password: 'password123',
    role: 'company',
    companyDetails: {
      companyName: 'TechVentures Inc',
      website: 'https://techventures.io',
      industry: 'Software',
      location: 'Bangalore'
    }
  });
  companyToken = companyRes.body.token;
  companyUser = companyRes.body.user;

  // 3. Create admin
  const adminRes = await request(app).post('/api/auth/register').send({
    name: 'Dr. Placement Officer',
    email: 'tpo@university.edu',
    password: 'password123',
    role: 'admin'
  });
  adminToken = adminRes.body.token;
  adminUser = adminRes.body.user;
});

// --- STUDENT PROFILE TESTS ---

test('GET /api/students/profile/me should initialize and return student profile', async () => {
  const res = await request(app)
    .get('/api/students/profile/me')
    .set('Authorization', `Bearer ${studentToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.profile.fullName, 'Rohan Sharma');
  assert.equal(res.body.profile.email, 'rohan@university.edu');
  assert.equal(res.body.profile.branch, 'Computer Science');
  assert.ok(typeof res.body.profile.profileCompletion === 'number');
});

test('PUT /api/students/profile/me should update student profile details and recalculate completion', async () => {
  const updatePayload = {
    fullName: 'Rohan Sharma Updated',
    phone: '+91 9876543210',
    collegeName: 'National Institute of Technology',
    course: 'B.Tech',
    branch: 'Computer Science & Engineering',
    graduationYear: 2025,
    cgpa: 9.1,
    skills: ['React', 'Node.js', 'MongoDB', 'Python'],
    linkedInUrl: 'https://linkedin.com/in/rohansharma',
    gitHubUrl: 'https://github.com/rohansharma',
    projects: [
      {
        title: 'PlaceMate Portal',
        description: 'Campus Placement System built with MERN stack',
        techStack: ['React', 'Express', 'MongoDB'],
        projectUrl: 'https://github.com/rohansharma/placemate'
      }
    ]
  };

  const res = await request(app)
    .put('/api/students/profile/me')
    .set('Authorization', `Bearer ${studentToken}`)
    .send(updatePayload);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.profile.fullName, 'Rohan Sharma Updated');
  assert.equal(res.body.profile.cgpa, 9.1);
  assert.equal(res.body.profile.projects.length, 1);
  assert.equal(res.body.profile.projects[0].title, 'PlaceMate Portal');
  assert.ok(res.body.profile.profileCompletion > 50);
});

test('PUT /api/students/profile/me should reject invalid CGPA (> 10 or < 0)', async () => {
  const res = await request(app)
    .put('/api/students/profile/me')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ cgpa: 11.5 });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /CGPA must be a number between 0 and 10/i);
});

test('PUT /api/students/profile/me should reject invalid graduation year', async () => {
  const res = await request(app)
    .put('/api/students/profile/me')
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ graduationYear: 1995 });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Graduation year must be between 2000 and 2100/i);
});

test('Student cannot access or update company profile', async () => {
  const res = await request(app)
    .get('/api/companies/profile/me')
    .set('Authorization', `Bearer ${studentToken}`);

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
});

// --- RESUME UPLOAD TESTS ---

test('POST /api/students/profile/resume should upload valid PDF resume and update profile completion', async () => {
  // Create a minimal valid PDF buffer (%PDF-1.4 header)
  const validPdfBuffer = Buffer.from('%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\ntrailer\n<<\n>>\n%%EOF');

  const res = await request(app)
    .post('/api/students/profile/resume')
    .set('Authorization', `Bearer ${studentToken}`)
    .attach('resume', validPdfBuffer, 'student_resume.pdf');

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.resume.originalName, 'student_resume.pdf');
  assert.equal(res.body.resume.mimeType, 'application/pdf');
  assert.ok(res.body.profileCompletion > 0);
});

test('POST /api/students/profile/resume should reject non-PDF file (e.g. .txt or .png)', async () => {
  const fakeTxtBuffer = Buffer.from('This is a text document, not a PDF');

  const res = await request(app)
    .post('/api/students/profile/resume')
    .set('Authorization', `Bearer ${studentToken}`)
    .attach('resume', fakeTxtBuffer, 'document.txt');

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Only PDF/i);
});

// --- COMPANY PROFILE TESTS ---

test('GET /api/companies/profile/me should initialize company profile with pending status', async () => {
  const res = await request(app)
    .get('/api/companies/profile/me')
    .set('Authorization', `Bearer ${companyToken}`);

  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.profile.companyName, 'TechVentures Inc');
  assert.equal(res.body.profile.officialEmail, 'ananya@techventures.io');
  assert.equal(res.body.profile.verificationStatus, 'pending');
});

test('PUT /api/companies/profile/me should update company details but NOT verification status', async () => {
  const res = await request(app)
    .put('/api/companies/profile/me')
    .set('Authorization', `Bearer ${companyToken}`)
    .send({
      companyName: 'TechVentures Global Ltd',
      website: 'https://techventures.com',
      industry: 'Artificial Intelligence & Cloud',
      companySize: '201-500',
      location: 'Hyderabad, India',
      description: 'Leading provider of enterprise AI platforms and infrastructure.',
      recruiterContact: {
        name: 'Ananya Recruiter',
        designation: 'Director of Talent Acquisition',
        phone: '+91 9123456789',
        email: 'talent@techventures.com'
      },
      // Attacker tries to self-verify:
      verificationStatus: 'verified'
    });

  assert.equal(res.status, 200);
  assert.equal(res.body.profile.companyName, 'TechVentures Global Ltd');
  assert.equal(res.body.profile.companySize, '201-500');
  assert.equal(res.body.profile.recruiterContact.designation, 'Director of Talent Acquisition');
  // Security verification: status must REMAIN pending!
  assert.equal(res.body.profile.verificationStatus, 'pending');
});

test('Company recruiter cannot update student profile', async () => {
  const res = await request(app)
    .put('/api/students/profile/me')
    .set('Authorization', `Bearer ${companyToken}`)
    .send({ fullName: 'Malicious Change' });

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
});

// --- ADMIN VERIFICATION TESTS ---

test('PUT /api/companies/:id/verification should allow Admin to verify company', async () => {
  // First ensure company profile exists
  const compProfileRes = await request(app)
    .get('/api/companies/profile/me')
    .set('Authorization', `Bearer ${companyToken}`);
  const profileId = compProfileRes.body.profile._id;

  // Admin approves company
  const verifyRes = await request(app)
    .put(`/api/companies/${profileId}/verification`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      verificationStatus: 'verified',
      adminFeedback: 'Company incorporation credentials and domain verified.'
    });

  assert.equal(verifyRes.status, 200);
  assert.equal(verifyRes.body.profile.verificationStatus, 'verified');
  assert.equal(verifyRes.body.profile.adminFeedback, 'Company incorporation credentials and domain verified.');
});

test('Non-admin user cannot verify company profile', async () => {
  const compProfileRes = await request(app)
    .get('/api/companies/profile/me')
    .set('Authorization', `Bearer ${companyToken}`);
  const profileId = compProfileRes.body.profile._id;

  const res = await request(app)
    .put(`/api/companies/${profileId}/verification`)
    .set('Authorization', `Bearer ${studentToken}`)
    .send({ verificationStatus: 'verified' });

  assert.equal(res.status, 403);
  assert.equal(res.body.success, false);
});
