import mongoose from 'mongoose';

const videoSummarySchema = new mongoose.Schema({
  videoId: { type: String, unique: true },
  title: String,
  duration: String,
  views: String,
  likes: String,
  summary: String
});

export default mongoose.model('VideoSummary', videoSummarySchema); 