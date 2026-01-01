const Job = require('../models/Job');
const { fetchWithFallback, translateText } = require('../services/externalJobService');

// @desc    Translate text to English
// @route   POST /api/jobs/translate
// @access  Public
const translateContent = async (req, res, next) => {
  try {
    let { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'No text provided for translation' });
    }

    // Clean text: remove HTML tags and normalize whitespace
    const cleanText = text.replace(/<[^>]+>/g, ' ')
                          .replace(/&nbsp;/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim();

    // Truncate to 1000 chars to avoid API limits and stay responsive
    const textToTranslate = cleanText.length > 1000 ? cleanText.substring(0, 1000) : cleanText;

    const { default: translate } = await import('translate');
    
    // Set engine and specify 'from' as 'auto' to help the library detect language
    translate.engine = 'google'; 
    
    const translated = await translate(textToTranslate, { to: 'en' });
    
    if (!translated || translated === textToTranslate) {
      // Try 'libre' as fallback if google returned identical text
      translate.engine = 'libre';
      const fallbackTranslated = await translate(textToTranslate, { to: 'en' });
      return res.json({ translated: fallbackTranslated });
    }
    
    res.json({ translated });
  } catch (error) {
    console.error('Translation controller error:', error.message);
    res.status(500).json({ message: 'Translation failed', error: error.message });
  }
};

// @desc    Get all jobs (internal + external)
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
  try {
    const { keyword, location, type, category, minSalary, maxSalary, sort, source } = req.query;

    let query = { status: 'active' };

    if (keyword) {
      query.$text = { $search: keyword };
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (type) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (minSalary || maxSalary) {
      query['salaryRange.min'] = { $gte: Number(minSalary) || 0 };
      if (maxSalary) {
        query['salaryRange.max'] = { $lte: Number(maxSalary) };
      }
    }

    let apiQuery = Job.find(query).populate('company', 'name profile.company');

    if (sort === 'newest') {
      apiQuery = apiQuery.sort('-createdAt');
    } else if (sort === 'salary') {
      apiQuery = apiQuery.sort('-salaryRange.max');
    }

    const internalJobs = await apiQuery;

    let allJobs = internalJobs;

    if (!source || source === 'all' || source === 'external') {
      try {
        const externalJobs = await fetchWithFallback(keyword, location, type);
        
        if (externalJobs && externalJobs.length > 0) {
          let filteredExternal = externalJobs;

          if (type) {
            filteredExternal = filteredExternal.filter(job => job.type === type);
          }

          if (minSalary || maxSalary) {
            filteredExternal = filteredExternal.filter(job => {
              if (minSalary && job.salaryRange?.min && job.salaryRange.min < minSalary) return false;
              if (maxSalary && job.salaryRange?.max && job.salaryRange.max > maxSalary) return false;
              return true;
            });
          }

          if (!source || source === 'all') {
            allJobs = [...internalJobs, ...filteredExternal];
          } else {
            allJobs = filteredExternal;
          }
        }
      } catch (error) {
        console.error('Error fetching external jobs:', error.message);
      }
    }

    if (sort === 'newest') {
      allJobs.sort((a, b) => new Date(b.postedDate || b.createdAt) - new Date(a.postedDate || a.createdAt));
    }

    res.json(allJobs);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if it's an external job ID
    if (id.startsWith('ext_')) {
      const externalJobs = await fetchWithFallback();
      const job = externalJobs.find(j => j._id === id);
      
      if (job) {
        return res.json(job);
      } else {
        return res.status(404).json({ message: 'External job not found' });
      }
    }

    const job = await Job.findById(id).populate('company', 'name profile.company');

    if (job) {
      res.json(job);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private/Employer
const createJob = async (req, res, next) => {
  try {
    const { title, description, location, type, category, salaryRange, experienceLevel, requirements, benefits, isRemote } = req.body;

    const job = await Job.create({
      title,
      description,
      location,
      type,
      category,
      salaryRange,
      experienceLevel,
      requirements,
      benefits,
      isRemote,
      company: req.user.id,
    });

    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private/Employer
const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (job) {
      if (job.company.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to update this job' });
      }

      const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updatedJob);
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private/Employer
const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (job) {
      if (job.company.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to delete this job' });
      }

      await job.deleteOne();
      res.json({ message: 'Job removed' });
    } else {
      res.status(404).json({ message: 'Job not found' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getJobs, getJobById, createJob, updateJob, deleteJob, translateContent };
