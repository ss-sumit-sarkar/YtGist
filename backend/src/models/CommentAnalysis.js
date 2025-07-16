import mongoose from 'mongoose';

const commentAnalysisSchema = new mongoose.Schema({
  videoId: { type: String, unique: true },
  comments: Array,
  overallSentiment: Object,
  summary: String
});

export default mongoose.model('CommentAnalysis', commentAnalysisSchema); 