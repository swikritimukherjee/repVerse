import mongoose from 'mongoose';

const qualityCheckSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    index: true
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const QualityCheck = mongoose.models.QualityCheck || mongoose.model('QualityCheck', qualityCheckSchema);

export default QualityCheck; 