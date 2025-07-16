import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, Eye, ThumbsUp } from "lucide-react";

interface VideoData {
  title: string;
  duration: string;
  views: string;
  likes: string;
  summary: string;
}

interface VideoSummaryProps {
  videoData: VideoData;
}

const VideoSummary = ({ videoData }: VideoSummaryProps) => {
  return (
    <Card className="p-6 bg-card border-border shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start space-x-4 mb-4">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-500/20 rounded-lg">
          <FileText className="h-5 w-5 text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">Video Summary</h3>
          <h4 className="text-md font-medium text-muted-foreground mb-3 line-clamp-2">{videoData.title}</h4>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{videoData.duration}</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Eye className="h-3 w-3" />
              <span>{videoData.views}</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <ThumbsUp className="h-3 w-3" />
              <span>{videoData.likes}</span>
            </Badge>
          </div>
        </div>
      </div>

      <div className="modern-gradient-border bg-muted rounded-2xl p-8 mb-2">
        <h5 className="font-medium text-foreground mb-3 text-lg">AI Summary</h5>
        <div className="text-muted-foreground leading-relaxed text-lg font-medium min-h-[120px]">
          {renderMarkdown(videoData.summary)}
        </div>
      </div>
    </Card>
  );
};

function renderMarkdown(text: string) {
  if (!text) return null;
  // Basic markdown: bold, lists, line breaks
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
    .replace(/\* (.+)/g, '<li>$1</li>');
  // Wrap <li> in <ul> if any
  if (/<li>/.test(html)) {
    html = '<ul style="margin-left:1.5em;list-style:disc;">' + html + '</ul>';
  }
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export default VideoSummary;
