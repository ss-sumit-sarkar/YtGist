import VideoSummary from '../models/VideoSummary.js';
import { summarizeWithGemini } from '../services/geminiService.js';
import { fetchVideoDetails, fetchComments } from '../services/youtubeService.js';
import { extractVideoId } from '../utils/extractVideoId.js';

export async function getVideoSummary(req, res) {
  const { url } = req.body;
  const videoId = extractVideoId(url);
  if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL' });

  try {
    let cached = await VideoSummary.findOne({ videoId });
    if (cached) return res.json(cached);

    const details = await fetchVideoDetails(videoId);
    const comments = await fetchComments(videoId);
    let summary = await summarizeWithGemini(
      `Summarize this YouTube video for a general audience. Title: ${details.title}. Description: ${details.description}. Top comments: ${comments.slice(0, 5).map(c => c.text).join(' | ')}`
    );
    if (!summary || summary.toLowerCase().includes('failed to generate summary')) {
      // Fallback summary
      summary = `This video is titled "${details.title}". ${details.description ? details.description.slice(0, 300) : ''} Top comments: ${comments.slice(0, 3).map((c, i) => `${i+1}. ${c.text.slice(0, 100)}`).join(' ')}`;
    }
    const doc = new VideoSummary({
      videoId,
      title: details.title,
      duration: details.duration,
      views: details.views,
      likes: details.likes,
      summary
    });
    await doc.save();
    res.json(doc);
  } catch (err) {
    console.error('Error in getVideoSummary:', err);
    res.status(500).json({ error: 'Failed to fetch video summary' });
  }
} 