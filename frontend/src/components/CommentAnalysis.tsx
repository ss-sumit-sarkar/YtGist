import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MessageSquare, TrendingUp, TrendingDown, Minus } from "lucide-react";
import React from "react";

interface Comment {
  author: string;
  text: string;
  likes: number;
  sentiment: "positive" | "negative" | "neutral";
  sentimentScore?: number;
}

interface CommentAnalysisProps {
  comments: Comment[];
  overallSentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  summary: string;
}

const CommentAnalysis = ({ comments, overallSentiment, summary }: CommentAnalysisProps) => {
  // Defensive: fallback to empty array/object if undefined
  const safeComments = Array.isArray(comments)
    ? comments.map(comment => ({
        ...comment,
        sentimentScore: comment.sentimentScore !== undefined && comment.sentimentScore !== null ? Number(comment.sentimentScore) : undefined
      }))
    : [];
  const safeSentiment = overallSentiment && typeof overallSentiment === 'object'
    ? overallSentiment
    : { positive: 0, neutral: 0, negative: 0 };

  if (!comments || !overallSentiment) {
    return (
      <Card className="p-6 bg-card border-border shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="font-bold text-xl text-foreground mb-1">Comment Analysis</div>
        <div className="text-red-500 text-base">Error: Could not load comment analysis data.</div>
      </Card>
    );
  }

  // Debugger and detailed log for development
  debugger;
  console.log('CommentAnalysis debug:', {
    comments,
    overallSentiment,
    summary,
    commentsCount: comments.length,
    positive: overallSentiment?.positive,
    neutral: overallSentiment?.neutral,
    negative: overallSentiment?.negative
  });

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case "negative":
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-400 bg-green-500/10";
      case "negative":
        return "text-red-400 bg-red-500/10";
      default:
        return "text-yellow-400 bg-yellow-500/10";
    }
  };

  const cleanSummary = (summary: string) => {
    if (!summary) return '';
    let s = summary.replace(/^```(json)?/i, '').replace(/```$/, '').replace(/[*_`#-]/g, '').trim();
    s = s.split(/[.!?]\s/).slice(0,3).join('. ') + '.';
    return s;
  };

  return (
    <Card className="p-6 bg-card border-border shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Main Title */}
      <div className="font-bold text-xl text-foreground mb-1">Comment Analysis</div>
      <div className="text-muted-foreground text-sm mb-6">Sentiment analysis of top comments</div>

      {/* Overall Sentiment */}
      <div className="mb-6">
        <div className="font-semibold text-base text-foreground mb-3">Overall Sentiment</div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-foreground">Positive</span>
            </div>
            <span className="text-sm text-muted-foreground">{typeof safeSentiment.positive === 'number' && !isNaN(safeSentiment.positive) ? safeSentiment.positive : 0}%</span>
          </div>
          <Progress value={typeof safeSentiment.positive === 'number' && !isNaN(safeSentiment.positive) ? safeSentiment.positive : 0} className="h-2 bg-muted" />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Minus className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-foreground">Neutral</span>
            </div>
            <span className="text-sm text-muted-foreground">{typeof safeSentiment.neutral === 'number' && !isNaN(safeSentiment.neutral) ? safeSentiment.neutral : 0}%</span>
          </div>
          <Progress value={typeof safeSentiment.neutral === 'number' && !isNaN(safeSentiment.neutral) ? safeSentiment.neutral : 0} className="h-2 bg-muted" />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-red-400" />
              <span className="text-sm font-medium text-foreground">Negative</span>
            </div>
            <span className="text-sm text-muted-foreground">{typeof safeSentiment.negative === 'number' && !isNaN(safeSentiment.negative) ? safeSentiment.negative : 0}%</span>
          </div>
          <Progress value={typeof safeSentiment.negative === 'number' && !isNaN(safeSentiment.negative) ? safeSentiment.negative : 0} className="h-2 bg-muted" />
        </div>
      </div>

      {/* Comment Summary */}
      <div className="mb-6">
        <div className="font-semibold text-base text-foreground mb-3">Comment Summary</div>
        <div className="modern-gradient-border bg-muted rounded-2xl p-8 text-muted-foreground leading-relaxed text-lg font-medium min-h-[120px]">
          {cleanSummary(summary)}
        </div>
      </div>

      {/* Comments */}
      <div>
        <div className="font-semibold text-base text-foreground mb-3">Comments</div>
        {safeComments.length === 0 ? (
          <div className="text-muted-foreground text-sm">No comments found.</div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {safeComments.slice(0, 100).map((comment, index) => (
              <div key={index} className="p-3 border border-border rounded-lg bg-background">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-foreground text-sm">{comment.author}</span>
                  <div className="flex items-center space-x-2">
                    <Badge className={`px-2 py-1 ${getSentimentColor(comment.sentiment)}`}>
                      {getSentimentIcon(comment.sentiment)}
                      <span className="ml-1 capitalize">{comment.sentiment}
                        {typeof comment.sentimentScore === 'number' && !isNaN(Number(comment.sentimentScore)) && (
                          <span className="font-bold"> {Number(comment.sentimentScore)}%</span>
                        )}
                      </span>
                    </Badge>
                    <span className="text-xs text-muted-foreground">{comment.likes} likes</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{
                  renderFormattedComment(comment.text)
                }</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

function renderFormattedComment(text: string) {
  if (!text) return null;
  // Decode HTML entities
  const txt = document.createElement('textarea');
  txt.innerHTML = text;
  let decoded = txt.value;
  // Replace <br> and <br/> with line breaks
  decoded = decoded.replace(/<br\s*\/?>(\r?\n)?/gi, '\n');
  // Split by line breaks
  const lines = decoded.split(/\n+/);
  // Regex for URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  // Regex for <a href="...">label</a>
  const anchorRegex = /<a href=\"([^\"]+)\"[^>]*>([^<]*)<\/a>/g;
  // Render each line, parsing links
  return lines.map((line, i) => {
    // If the line contains an <a> tag, parse it
    if (anchorRegex.test(line)) {
      const parts = [];
      let lastIndex = 0;
      anchorRegex.lastIndex = 0;
      let match;
      while ((match = anchorRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.slice(lastIndex, match.index));
        }
        parts.push(
          <a key={match[1] + i} href={match[1]} target="_blank" rel="noopener noreferrer">{match[2] || match[1]}</a>
        );
        lastIndex = anchorRegex.lastIndex;
      }
      if (lastIndex < line.length) {
        parts.push(line.slice(lastIndex));
      }
      return <span key={i}>{parts}</span>;
    }
    // Otherwise, auto-link plain URLs
    const urlParts = [];
    let lastIdx = 0;
    let urlMatch;
    urlRegex.lastIndex = 0;
    while ((urlMatch = urlRegex.exec(line)) !== null) {
      if (urlMatch.index > lastIdx) {
        urlParts.push(line.slice(lastIdx, urlMatch.index));
      }
      urlParts.push(
        <a key={urlMatch[1] + i} href={urlMatch[1]} target="_blank" rel="noopener noreferrer">{urlMatch[1]}</a>
      );
      lastIdx = urlRegex.lastIndex;
    }
    if (lastIdx < line.length) {
      urlParts.push(line.slice(lastIdx));
    }
    return <span key={i}>{urlParts}</span>;
  });
}

export default CommentAnalysis;

/* Add this to your global CSS (e.g., index.css or App.css) for invisible/modern scrollbar */
/*
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: transparent;
  border-radius: 4px;
  transition: background 0.2s;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: #60a5fa;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
*/

/* Add this to your global CSS (e.g., index.css or App.css) for a modern blue gradient border */
/*
.modern-gradient-border {
  position: relative;
  z-index: 0;
}
.modern-gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 1rem;
  padding: 2px;
  background: linear-gradient(90deg, #2563eb, #60a5fa, #a5b4fc);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 1;
}
.modern-gradient-border > * {
  position: relative;
  z-index: 2;
}
*/
