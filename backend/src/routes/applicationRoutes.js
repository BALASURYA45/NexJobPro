const express = require('express');
const { 
  applyToJob, 
  getMyApplications, 
  getJobApplications, 
  updateApplicationStatus,
  getEmployerApplications
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/:jobId', protect, authorize('seeker'), (req, res, next) => {
  req.body.jobId = req.params.jobId;
  applyToJob(req, res, next);
});
router.get('/user/my-applications', protect, authorize('seeker'), getMyApplications);
router.get('/employer/my-applications', protect, authorize('employer', 'admin'), getEmployerApplications);
router.get('/job/:jobId', protect, authorize('employer', 'admin'), getJobApplications);
router.put('/:id/status', protect, authorize('employer', 'admin'), updateApplicationStatus);

module.exports = router;
