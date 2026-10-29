const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure destination directory exists
const uploadDir = path.resolve(__dirname, '../../uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration with controlled file naming
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .slice(0, 30);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `resume-${req.user?._id || 'anon'}-${sanitizedBase}-${uniqueSuffix}${ext}`);
  }
});

// Strict PDF file filter
const fileFilter = (req, file, cb) => {
  const isPdfMime = file.mimetype === 'application/pdf';
  const isPdfExt = path.extname(file.originalname).toLowerCase() === '.pdf';

  if (isPdfMime && isPdfExt) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type: Only PDF (.pdf) documents are accepted.');
    error.status = 400;
    cb(error, false);
  }
};

// 2 MB max file size limit
const uploadResume = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2 Megabytes
  },
  fileFilter
});

module.exports = {
  uploadResume,
  uploadDir
};
