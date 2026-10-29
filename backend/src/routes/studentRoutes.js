const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  uploadResumeHandler,
  downloadResumeHandler
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadResume } = require('../middleware/uploadMiddleware');

// Student profile management (student role only)
router.get('/profile/me', protect, authorize('student'), getMyProfile);
router.put('/profile/me', protect, authorize('student'), updateMyProfile);

// Resume upload (student role only, PDF <= 2MB)
router.post(
  '/profile/resume',
  protect,
  authorize('student'),
  uploadResume.single('resume'),
  uploadResumeHandler
);

// Resume access control: student downloads own resume, or recruiter/admin with permission
router.get('/profile/resume', protect, downloadResumeHandler);
router.get('/:studentId/resume', protect, downloadResumeHandler);

module.exports = router;
