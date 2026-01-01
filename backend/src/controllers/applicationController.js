const Application = require('../models/Application');
const Job = require('../models/Job');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private/Seeker
const applyToJob = async (req, res, next) => {
  try {
    const { jobId, resume, coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const alreadyApplied = await Application.findOne({
      job: jobId,
      candidate: req.user.id,
    });

    if (alreadyApplied) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    const application = await Application.create({
      job: jobId,
      candidate: req.user.id,
      employer: job.company,
      resume,
      coverLetter,
    });

    // Increment job application count
    job.applicationCount += 1;
    await job.save();

    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

// @desc    Get seeker's applications
// @route   GET /api/applications/my
// @access  Private/Seeker
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ candidate: req.user.id })
      .populate('job', 'title location type company')
      .populate('employer', 'name profile.company');

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Get employer's job applications
// @route   GET /api/applications/job/:jobId
// @access  Private/Employer
const getJobApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ job: req.params.jobId })
      .populate('candidate', 'name email profile');

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private/Employer
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.employer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    application.status = status;
    if (note) {
      application.notes.push({ text: note, author: req.user.id });
    }

    await application.save();
    res.json(application);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for an employer's jobs
const getEmployerApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ employer: req.user.id })
      .populate('job', 'title location type category')
      .populate('candidate', 'name email profile');

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  applyToJob, 
  getMyApplications, 
  getJobApplications, 
  updateApplicationStatus,
  getEmployerApplications 
};
