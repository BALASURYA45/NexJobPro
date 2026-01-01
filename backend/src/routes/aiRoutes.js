const express = require('express');
const multer = require('multer');
const { analyzeResume } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer setup for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are supported'), false);
    }
  }
});

router.post('/analyze-resume', protect, upload.single('resume'), analyzeResume);

module.exports = router;
