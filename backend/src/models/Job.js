const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a job title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a job description'],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
    },
    type: {
      type: String,
      required: [true, 'Please add a job type'],
      enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'],
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
    },
    salaryRange: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD'
      }
    },
    experienceLevel: {
      type: String,
      enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'],
    },
    requirements: [String],
    benefits: [String],
    isRemote: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'closed'],
      default: 'active',
    },
    applicationCount: {
      type: Number,
      default: 0,
    },
    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for search
jobSchema.index({ title: 'text', description: 'text', requirements: 'text' });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
