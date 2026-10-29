# PlaceMate - Campus Placement Management System

PlaceMate is a full-stack campus placement and recruitment platform built with **React + Vite**, **Node.js**, **Express**, and **MongoDB + Mongoose**.

---

## 🏗️ Architecture & Three-Role Hierarchy

1. **Student / Applicant**: Complete academic & skills profile, manage projects, securely upload/download PDF resume, track profile completion %, and view drive eligibility.
2. **Company / Recruiter**: Manage organization identity, company size, headquarters, recruiter point-of-contact, and track placement cell accreditation status (Pending, Verified, Rejected).
3. **Admin / Placement Officer**: Oversee recruitment compliance, review registered employers in real-time, approve or reject company verification requests with feedback.

---

## 📁 Project Structure (Phase 1 & Phase 2)

```text
PlaceMate/
├── backend/
│   ├── .env.example              # Backend environment template
│   ├── .env                      # Local environment configuration (PORT=5001, JWT_SECRET, MONGODB_URI)
│   ├── package.json              # Express, Mongoose, bcryptjs, jsonwebtoken, multer, supertest
│   ├── uploads/
│   │   └── resumes/              # Secure access-controlled PDF resume storage
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js             # Mongoose connection with embedded MongoDB v8.2.6 fallback
│   │   ├── controllers/
│   │   │   ├── authController.js    # Register, login, JWT issuance, profile retrieval
│   │   │   ├── studentController.js # Student profile CRUD, dynamic completion %, resume upload & stream
│   │   │   └── companyController.js # Recruiter profile CRUD, admin verification controls
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js    # JWT verification and role authorization (RBAC)
│   │   │   ├── uploadMiddleware.js  # Multer PDF filter and 2 MB file limit
│   │   │   └── errorMiddleware.js   # Mongoose, JWT, and Multer centralized error handling
│   │   ├── models/
│   │   │   ├── User.js              # Multi-role User schema with bcrypt hashing
│   │   │   ├── StudentProfile.js    # Academic details, skills, projects, resume subdocs
│   │   │   └── CompanyProfile.js    # Organization overview, recruiter contact, verification status
│   │   ├── routes/
│   │   │   ├── authRoutes.js        # /api/auth routes
│   │   │   ├── studentRoutes.js     # /api/students routes (protected by student role)
│   │   │   └── companyRoutes.js     # /api/companies routes (recruiter self-service + admin queue)
│   │   ├── app.js                   # Express app setup and middleware
│   │   └── server.js                # Server entry point (port 5001)
│   └── tests/
│       ├── auth.test.js             # 11 Phase 1 automated integration tests
│       └── profiles.test.js         # 12 Phase 2 profile, resume, and RBAC integration tests
│
├── frontend/
│   ├── .env.example              # Frontend environment template
│   ├── .env                      # VITE_API_BASE_URL=http://localhost:5001/api
│   ├── index.html                # Single page app template
│   ├── vite.config.js            # Vite configuration with /api proxy to port 5001
│   ├── package.json              # Frontend dependencies (React, Vite, react-router-dom, lucide-react)
│   └── src/
│       ├── api/
│       │   ├── client.js            # HTTP client with Bearer token injection and FormData support
│       │   ├── authApi.js           # Auth, session, and role overview API methods
│       │   └── profileApi.js        # Student/Company profile, PDF resume upload/download, Admin verify
│       ├── components/
│       │   ├── Navbar.jsx           # Responsive navbar with role badges and Profile quicklinks
│       │   ├── ProtectedRoute.jsx   # Role-based route guard
│       │   └── Alert.jsx            # Accessible feedback banners
│       ├── context/
│       │   └── AuthContext.jsx      # Global session state & localStorage auto-restoration
│       ├── pages/
│       │   ├── Home.jsx             # Public landing portal with live backend ping
│       │   ├── Login.jsx            # Sign in page with quick demo pre-fills
│       │   ├── Register.jsx         # Dynamic registration form tailored to each role
│       │   ├── student/
│       │   │   ├── StudentDashboard.jsx   # Student portal with live completion % & resume status
│       │   │   └── StudentProfilePage.jsx # Full profile editor: academics, skills, projects, PDF resume
│       │   ├── company/
│       │   │   ├── CompanyDashboard.jsx   # Recruiter portal with live verification status banner
│       │   │   └── CompanyProfilePage.jsx # Company editor: details, size, recruiter contact
│       │   └── admin/
│       │       └── AdminDashboard.jsx     # Placement Officer portal with live Verification Queue
│       ├── App.jsx                  # Application routing
│       ├── main.jsx                 # React DOM mounting
│       └── index.css                # Responsive light-theme design system
│
└── package.json                  # Root runner scripts
```

---

## 🔒 Resume Upload Security & Storage Setup

- **Format Constraint**: Only `.pdf` files (`application/pdf`) are accepted.
- **Size Limit**: Enforced at **2 MB** maximum on both client and server via Multer.
- **Secure Access Control**: Resume files are saved to `backend/uploads/resumes/` with unique non-guessable timestamps and IDs. They are **never** exposed as unauthenticated public static URLs. Access is granted exclusively through the authenticated `GET /api/students/profile/resume` endpoint with JWT verification.

---

## 🚀 How to Run the Application

### 1. Running Backend Server
```bash
cd backend
npm run dev
# Server starts on http://localhost:5001
# Health check available at http://localhost:5001/api/health
```

### 2. Running Frontend Client
```bash
cd frontend
npm run dev
# Frontend dev server starts on http://localhost:5173
```

### 3. Running Automated Test Suite
The backend test suite runs 23 integration tests against real MongoDB persistence:
```bash
cd backend
npm test
```
All 23 tests execute against the embedded official MongoDB v8.2.6 engine validating:
- Authentication & bcrypt hashing (Phase 1)
- Role-based authorization & security (Phase 1)
- Student profile CRUD & dynamic completion % calculation (Phase 2)
- Company profile CRUD & recruiter data preservation (Phase 2)
- Recruiter self-verification rejection (Phase 2)
- Admin verification and rejection with remarks (Phase 2)
- Resume upload validation (rejects non-PDFs, rejects files > 2 MB, accepts valid PDFs) (Phase 2)
- Cross-role route access denials (Phase 2)
