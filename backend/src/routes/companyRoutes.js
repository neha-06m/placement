const express = require('express');
const router = express.Router();
const {
  getMyCompanyProfile,
  updateMyCompanyProfile,
  getCompanyById,
  updateCompanyVerification,
  getAllCompanies
} = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Recruiter company profile management
router.get('/profile/me', protect, authorize('company'), getMyCompanyProfile);
router.put('/profile/me', protect, authorize('company'), updateMyCompanyProfile);

// Admin-only listing of companies for verification queue
router.get('/', protect, authorize('admin'), getAllCompanies);

// Company details by ID (authenticated users)
router.get('/:id', protect, getCompanyById);

// Admin-only verification status approval/rejection
router.put('/:id/verification', protect, authorize('admin'), updateCompanyVerification);

module.exports = router;
