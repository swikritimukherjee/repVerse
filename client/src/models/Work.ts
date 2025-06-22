import mongoose from 'mongoose';

const workSchema = new mongoose.Schema({
    jobId: {
        type: String,
        required: true,
        index: true
    },
  work: {
    type: String,
    required: true,
  },
});

const Work = mongoose.models.Work || mongoose.model('Work', workSchema);

export default Work;