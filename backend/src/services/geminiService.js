import axios from 'axios';

export async function summarizeWithGemini(prompt) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY
        }
      }
    );
    return response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No summary generated.';
  } catch (err) {
    console.error('Gemini API error:', err?.response?.data || err.message);
    return 'Failed to generate summary.';
  }
}

export async function analyzeCommentsWithGemini(commentsArr) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
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
    console.log('Calculated overallSentiment from comments:', result);
    return result;
  }

  function autoLabelSentiment(text) {
    const positiveWords = [
      'good', 'great', 'love', 'amazing', 'thank', 'best', 'excellent', 'like', 'congratulations', 'helpful', 'awesome', 'nice', 'happy', 'enjoy', 'wonderful', 'perfect', 'well done', 'fantastic', 'brilliant', 'outstanding', 'superb', 'favorite', 'appreciate', 'incredible', 'positive', 'improve', 'learned', 'recommend', 'support', '😍', '😊', '😁', '😇', '❤', '❤️', '👍', '🎉', '👏', '☺', '😃', '😄', '😆', '😎', '😺', '😻', '😽', '😸', '😹'
    ];
    const negativeWords = [
      'bad', 'hate', 'worst', 'boring', 'dislike', 'problem', 'difficult', 'annoy', 'negative', 'sad', 'angry', 'upset', 'disappoint', 'terrible', 'awful', 'confused', 'not helpful', 'waste', 'useless', 'unhelpful', '👎', '😡', '😠', '😞', '😢', '😭', '😔', '😕', '😒', '😩', '😫', '😤', '😾', '😿', '🙀'
    ];
    const lower = text.toLowerCase();
    if (positiveWords.some(w => lower.includes(w))) return 'positive';
    if (negativeWords.some(w => lower.includes(w))) return 'negative';
    if (lower.includes('how') || lower.includes('what') || lower.includes('why') || lower.includes('when') || lower.includes('where') || lower.includes('can you') || lower.includes('could you') || lower.includes('is it') || lower.includes('are you')) return 'neutral';
    if (text.length < 10) return 'neutral';
    return 'neutral';
  }

  function generateFallbackSummary(comments) {
    if (!comments || comments.length === 0) return 'No comments available.';
    // Extract main themes (keywords)
    const allText = comments.map(c => c.text).join(' ');
    const keywords = Array.from(new Set(allText.match(/\b\w{5,}\b/g) || []))
      .filter(w => !['https', 'video', 'comment', 'about', 'which', 'their', 'there', 'would', 'could', 'should', 'because', 'these', 'those', 'where', 'after', 'before', 'other', 'being', 'while', 'again', 'never', 'always', 'people', 'thanks', 'thank', 'great', 'amazing', 'video', 'watch', 'watching', 'channel', 'subscribe', 'liked', 'likes', 'views', 'first', 'second', 'third', 'please', 'share', 'link', 'below', 'above', 'found', 'find', 'info', 'visit', 'click', 'here', 'more', 'from', 'with', 'this', 'that', 'have', 'just', 'like', 'good', 'best', 'love', 'super', 'awesome', 'nice', 'helpful', 'useful', 'perfect', 'excellent', 'outstanding', 'brilliant', 'superb', 'favorite', 'legend', 'legendary', 'masterpiece', 'beautiful', 'wonderful', 'impressive', 'cool', 'wow', 'amazing', 'fantastic', 'appreciate', 'support', 'recommend', 'learned', 'improve', 'positive', 'incredible', 'enjoy', 'enjoyed', 'happy', 'congratulations', 'well', 'done', 'greatest', 'grateful', 'appreciate', 'support', 'recommend', 'learned', 'improve', 'positive', 'incredible', 'enjoy', 'enjoyed', 'happy', 'congratulations', 'well', 'done', 'greatest', 'grateful'])
      .slice(0, 8);
    // Compose a summary
    let summary = `The discussion in the comments centers around `;
    if (keywords.length > 0) {
      summary += `topics such as ${keywords.join(', ')}. `;
    } else {
      summary += `various aspects of the video. `;
    }
    summary += `Viewers shared their thoughts, questions, and feedback, highlighting different perspectives and experiences.`;
    // Add a sample comment if available
    if (comments.length > 0) {
      const sample = comments[Math.floor(Math.random() * comments.length)];
      summary += ` For example, one viewer commented: "${sample.text.replace(/<[^>]+>/g, '').slice(0, 120)}"`;
    }
    return summary;
  }

  try {
    const prompt = `Given the following YouTube comments, respond ONLY with a JSON object with:
- "comments": an array of objects with "author", "text", "likes", and BOTH "sentiment" ("positive", "neutral", or "negative") AND "sentimentScore" (a percentage from 0 to 100) for each comment. YOU MUST assign a sentiment and a percentage score to EVERY comment based on the text. Sentiment is REQUIRED for every comment and must be one of: "positive", "neutral", or "negative" (no other values). SentimentScore is REQUIRED and must be a number between 0 and 100 representing the confidence or strength of the sentiment for that comment. Do NOT skip or leave any comment without a sentiment and sentimentScore. If unsure, label as neutral and set sentimentScore to 50.
- "overallSentiment": an object with percentage values for "positive", "neutral", and "negative" (as numbers, must sum to 100, and must be present). You MUST calculate these percentages from the actual sentiment labels in the comments array, not estimate or guess. Do not just set all to neutral. If you cannot determine a sentiment, label as neutral.
- "summary": a longer summary (4-5 sentences) of the overall sentiment and discussion, including key themes, common questions, and notable positive or negative feedback. Do not use markdown or code blocks.

You MUST always include the overallSentiment object with exact percentage numbers for positive, neutral, and negative, and they MUST sum to 100. Calculate the percentages from the comments array. Respond ONLY with a valid JSON object. Example:
{
  "comments": [
    { "author": "...", "text": "...", "likes": 0, "sentiment": "positive", "sentimentScore": 95 },
    { "author": "...", "text": "...", "likes": 0, "sentiment": "neutral", "sentimentScore": 50 }
  ],
  "overallSentiment": { "positive": 60, "neutral": 30, "negative": 10 },
  "summary": "..."
}

Comments:\n${JSON.stringify(commentsArr)}\n`;
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        contents: [
          {
              role: "user",
            parts: [
              { text: prompt }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': GEMINI_API_KEY
        }
      }
    );
    let text = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    text = text.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim();
    let jsonMatch = text.match(/\{[\s\S]*\}/);
    let parsed;
    try {
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(text);
      }
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      if (parsed.comments && typeof parsed.comments === 'string') {
        try {
          parsed.comments = JSON.parse(parsed.comments);
        } catch {}
      }
      if (parsed.summary && typeof parsed.summary === 'string' && parsed.summary.trim().startsWith('{')) {
        try {
          const inner = JSON.parse(parsed.summary);
          if (inner.summary) parsed.summary = inner.summary;
          if (inner.comments) parsed.comments = inner.comments;
        } catch {}
      }
      if ((!parsed.comments || !Array.isArray(parsed.comments) || parsed.comments.length === 0) && typeof parsed.summary === 'string' && parsed.summary.includes('"comments"')) {
        try {
          const inner = JSON.parse(parsed.summary);
          if (inner.comments && Array.isArray(inner.comments)) {
            parsed.comments = inner.comments;
          }
          if (inner.summary && typeof inner.summary === 'string') {
            parsed.summary = inner.summary;
          }
        } catch {}
      }
      if (!Array.isArray(parsed.comments)) {
        const commentsArrMatch = text.match(/"comments"\s*:\s*(\[[^\]]*\])/);
        if (commentsArrMatch) {
          try {
            parsed.comments = JSON.parse(commentsArrMatch[1]);
          } catch { parsed.comments = []; }
        } else {
          parsed.comments = [];
        }
      }
    } catch (e) {
      console.error('Gemini raw response (parsing failed):', text);
      return {
        comments: [],
        overallSentiment: { positive: 0, neutral: 100, negative: 0 },
        summary: generateFallbackSummary(commentsArr)
      };
    }
    if (!Array.isArray(parsed.comments)) parsed.comments = [];
    // Fallback: If any comment is missing or has invalid sentiment, auto-label it
    parsed.comments = parsed.comments.map(c => {
      let sentiment = c.sentiment;
      if (!sentiment || !['positive', 'neutral', 'negative'].includes(sentiment)) {
        sentiment = autoLabelSentiment(c.text || '');
      }
      // Ensure sentimentScore is present and valid
      let sentimentScore = (typeof c.sentimentScore === 'number' && !isNaN(c.sentimentScore))
        ? c.sentimentScore
        : (sentiment === 'positive' ? 90 : sentiment === 'negative' ? 10 : 50);
      return { ...c, sentiment, sentimentScore };
    });
    // Always calculate overallSentiment from comments, never use Gemini's value
    parsed.overallSentiment = calculateSentimentPercentages(parsed.comments);
    if (typeof parsed.summary !== 'string' || parsed.summary.length < 40) {
      parsed.summary = generateFallbackSummary(parsed.comments);
    }
    parsed.summary = parsed.summary.replace(/^```(json)?/i, '').replace(/```$/, '').replace(/[*_`#-]/g, '').trim();
    parsed.summary = parsed.summary.split(/[.!?]\s/).slice(0,5).join('. ') + '.';
    return {
      summary: parsed.summary,
      comments: parsed.comments,
      overallSentiment: parsed.overallSentiment
    };
  } catch (err) {
    console.error('[DEBUG] Gemini API error:', err?.response?.data || err.message, err?.config || '');
    return {
      comments: [],
      overallSentiment: { positive: 0, neutral: 100, negative: 0 },
      summary: 'Gemini API error: ' + (err?.response?.data?.error?.message || err.message)
    };
  }
} 
