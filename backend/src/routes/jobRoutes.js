const express = require('express');
const { getJobs, getJobById, createJob, updateJob, deleteJob, translateContent } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getJobs);
router.post('/translate', translateContent);
router.get('/:id', getJobById);
router.post('/', protect, authorize('employer', 'admin'), createJob);
router.put('/:id', protect, authorize('employer', 'admin'), updateJob);
router.delete('/:id', protect, authorize('employer', 'admin'), deleteJob);

module.exports = router;
