import CommentAnalysis from '../models/CommentAnalysis.js';
import { analyzeCommentsWithGemini } from '../services/geminiService.js';
import { fetchComments } from '../services/youtubeService.js';
import { extractVideoId } from '../utils/extractVideoId.js';

export async function getCommentAnalysis(req, res) {
  const { url } = req.body;
  const videoId = extractVideoId(url);
  if (!videoId) return res.status(400).json({ error: 'Invalid YouTube URL' });

  try {
    let cached = await CommentAnalysis.findOne({ videoId });
    // Auto-fix: If cached exists, comments are empty, but summary contains stringified JSON with comments
    if (cached && (!cached.comments || cached.comments.length === 0) && typeof cached.summary === 'string' && cached.summary.includes('"comments"')) {
      try {
        const inner = JSON.parse(cached.summary.replace(/^```(json)?/i, '').replace(/```$/, '').trim());
        if (inner.comments && Array.isArray(inner.comments)) {
          cached.comments = inner.comments;
          await cached.save();
        }
        if (inner.summary && typeof inner.summary === 'string') {
          cached.summary = inner.summary;
          await cached.save();
        }
      } catch (e) {
        console.error('Auto-fix failed for cached comment analysis:', e);
      }
    }
    if (cached) {
      // Always recalculate overallSentiment from cached comments
      function calculateSentimentPercentages(comments) {
        const total = comments.length;
        let pos = 0, neu = 0, neg = 0;
        comments.forEach(c => {
          if (c.sentiment === 'positive') pos++;
          else if (c.sentiment === 'negative') neg++;
          else neu++;
        });
        let result = total > 0 ? {
          positive: Math.round((pos / total) * 100),
          neutral: Math.round((neu / total) * 100),
          negative: Math.round((neg / total) * 100)
        } : { positive: 0, neutral: 100, negative: 0 };
        // Adjust to sum to 100
        const sum = result.positive + result.neutral + result.negative;
        if (sum !== 100) {
          const diff = 100 - sum;
          result.neutral += diff;
        }
        return result;
      }
      cached.overallSentiment = calculateSentimentPercentages(cached.comments || []);
      await cached.save();
      return res.json(cached);
    }

    const comments = await fetchComments(videoId);

    const geminiAnalysis = await analyzeCommentsWithGemini(comments);

    // Fallback: If Gemini returns no comments, use keyword-based sentiment analysis
    let finalComments = [];
    if (geminiAnalysis.comments && geminiAnalysis.comments.length > 0) {
      finalComments = geminiAnalysis.comments;
    } else {
      // Gemini returned no comments, fallback to keyword-based
      finalComments = comments.map(c => {
        const text = c.text || '';
        const lower = text.toLowerCase();
        const positiveWords = [
          'good', 'great', 'love', 'amazing', 'thank', 'best', 'excellent', 'like', 'congratulations', 'helpful', 'awesome', 'nice', 'happy', 'enjoy', 'wonderful', 'perfect', 'well done', 'fantastic', 'brilliant', 'outstanding', 'superb', 'favorite', 'appreciate', 'incredible', 'positive', 'improve', 'learned', 'recommend', 'support', '😍', '😊', '😁', '😇', '❤', '❤️', '👍', '🎉', '👏', '☺', '😃', '😄', '😆', '😎', '😺', '😻', '😽', '😸', '😹', 'best', 'super', 'awesome', 'nice', 'love', 'loved', 'enjoyed', 'enjoy', 'helpful', 'useful', 'thanks', 'thank you', 'grateful', 'appreciate', 'fantastic', 'excellent', 'perfect', 'outstanding', 'brilliant', 'superb', 'favorite', 'greatest', 'legend', 'legendary', 'masterpiece', 'beautiful', 'wonderful', 'amazing', 'impressive', 'cool', 'wow', '😍', '😊', '😁', '😇', '❤', '❤️', '👍', '🎉', '👏', '☺', '😃', '😄', '😆', '😎', '😺', '😻', '😽', '😸', '😹'
        ];
        const negativeWords = [
          'bad', 'hate', 'worst', 'boring', 'dislike', 'problem', 'difficult', 'annoy', 'negative', 'sad', 'angry', 'upset', 'disappoint', 'terrible', 'awful', 'confused', 'not helpful', 'waste', 'useless', 'unhelpful', '👎', '😡', '😠', '😞', '😢', '😭', '😔', '😕', '😒', '😩', '😫', '😤', '😾', '😿', '🙀', 'flop', 'useless', 'waste', 'scam', 'fraud', 'cheat', 'cheated', 'disappointed', 'disappointing', 'horrible', 'horrific', 'awful', 'terrible', 'worst', 'hate', 'angry', 'sad', 'cry', 'cried', 'crying', 'pain', 'painful', 'problem', 'issue', 'issues', 'bug', 'bugs', 'broken', 'fail', 'failed', 'failure', 'disaster', 'trash', 'garbage', 'nonsense', 'stupid', 'dumb', 'annoy', 'annoying', '👎', '😡', '😠', '😞', '😢', '😭', '😔', '😕', '😒', '😩', '😫', '😤', '😾', '😿', '🙀'
        ];
        let sentiment = 'neutral';
        if (positiveWords.some(w => lower.includes(w))) sentiment = 'positive';
        else if (negativeWords.some(w => lower.includes(w))) sentiment = 'negative';
        return { ...c, sentiment };
      });
    }
    // Always recalculate overallSentiment from finalComments
    function calculateSentimentPercentages(comments) {
      const total = comments.length;
      let pos = 0, neu = 0, neg = 0;
      comments.forEach(c => {
        if (c.sentiment === 'positive') pos++;
        else if (c.sentiment === 'negative') neg++;
        else neu++;
      });
      let result = total > 0 ? {
        positive: Math.round((pos / total) * 100),
        neutral: Math.round((neu / total) * 100),
        negative: Math.round((neg / total) * 100)
      } : { positive: 0, neutral: 100, negative: 0 };
      // Adjust to sum to 100
      const sum = result.positive + result.neutral + result.negative;
      if (sum !== 100) {
        const diff = 100 - sum;
        result.neutral += diff;
      }
      return result;
    }
    let overallSentiment = calculateSentimentPercentages(finalComments);
    let summary = geminiAnalysis.summary || '';
    if (!summary || summary.toLowerCase().includes('gemini api error')) {
      // Fallback summary: generate a real summary instead of listing top comments
      const { generateFallbackSummary } = await import('../services/geminiService.js');
      summary = generateFallbackSummary(finalComments);
    }
    const analysisDoc = new CommentAnalysis({
      videoId,
      comments: finalComments,
      overallSentiment,
      summary
    });
    await analysisDoc.save();
    res.json(analysisDoc);
  } catch (err) {
    console.error('Error in getCommentAnalysis:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
} 