
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Youtube, Search, AlertCircle } from "lucide-react";

interface VideoInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

const VideoInput = ({ onAnalyze, isLoading }: VideoInputProps) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const validateYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)/;
    return youtubeRegex.test(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    if (!validateYouTubeUrl(url)) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setError("");
    onAnalyze(url);
  };

  return (
    <Card className="p-6 bg-card border-border shadow-sm">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl mb-4">
          <Youtube className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Analyze YouTube Video</h2>
        <p className="text-muted-foreground">
          Enter a YouTube URL to get AI-powered summaries and sentiment analysis
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError("");
            }}
            className="pl-10 pr-4 py-3 text-lg border-2 border-border focus:border-blue-500 rounded-xl bg-background text-foreground placeholder:text-muted-foreground"
            disabled={isLoading}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="w-full py-3 text-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Analyzing Video...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Analyze Video</span>
            </div>
          )}
        </Button>
      </form>
    </Card>
  );
};

export default VideoInput;
