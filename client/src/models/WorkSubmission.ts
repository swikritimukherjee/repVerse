import mongoose from 'mongoose';

const workSubmissionSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    index: true
  },
  freelancerAddress: {
    type: String,
    required: true,
    index: true
  },
  work: {
    type: String,
    required: true,
  },
  qualityScore: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'revision_requested'],
    default: 'pending'
  },
  retryCount: {
    type: Number,
    default: 0,
    max: 2
  },
  rejectionReason: {
    type: String,
    default: null
  },
  reviewScore: {
    type: Number,
    default: null
  },
  fixableScore: {
    type: Number,
    default: null
  },
  reassignScore: {
    type: Number,
    default: null
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
workSubmissionSchema.index({ jobId: 1, freelancerAddress: 1 });

const WorkSubmission = mongoose.models.WorkSubmission || mongoose.model('WorkSubmission', workSubmissionSchema);

export default WorkSubmission;