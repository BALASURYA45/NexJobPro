const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resume: {
      type: String, // URL to resume
      required: true,
    },
    coverLetter: String,
    status: {
      type: String,
      enum: ['applied', 'reviewed', 'shortlisted', 'rejected', 'withdrawn'],
      default: 'applied',
    },
    notes: [
      {
        text: String,
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
