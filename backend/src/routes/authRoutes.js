const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (any authenticated role)
router.get('/me', protect, getMe);

// Role-protected dashboard verification endpoints
router.get('/student/overview', protect, authorize('student'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Student Dashboard',
    role: req.user.role,
    user: req.user.toSafeObject(),
    data: {
      enrolledBatches: ['2025', '2026'],
      activeDrives: 0,
      applicationsCount: 0
    }
  });
});

router.get('/company/overview', protect, authorize('company'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Company Recruiter Dashboard',
    role: req.user.role,
    user: req.user.toSafeObject(),
    data: {
      isVerified: req.user.companyProfile?.isVerified || false,
      activeJobPosts: 0,
      applicantsCount: 0
    }
  });
});

router.get('/admin/overview', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Admin Placement Officer Dashboard',
    role: req.user.role,
    user: req.user.toSafeObject(),
    data: {
      systemStatus: 'healthy',
      pendingApprovals: 0,
      totalUsers: 1
    }
  });
});

module.exports = router;
