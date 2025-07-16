import { useState } from "react";
import { FileText, MessageSquare, TrendingUp, Youtube } from "lucide-react";
import Header from "@/components/Header";
import VideoInput from "@/components/VideoInput";
import VideoSummary from "@/components/VideoSummary";
import CommentAnalysis from "@/components/CommentAnalysis";
import { API_BASE_URL } from "@/lib/utils";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [commentsData, setCommentsData] = useState(null);

  const handleAnalyze = async (url: string) => {
    setIsLoading(true);
    setVideoData(null);
    setCommentsData(null);

    try {
      // Call backend for video summary
      const videoRes = await fetch(`${API_BASE_URL}/api/video-summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const videoJson = await videoRes.json();
      setVideoData(videoJson);

      // Call backend for comment analysis
      const commentRes = await fetch(`${API_BASE_URL}/api/comment-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const commentJson = await commentRes.json();
      setCommentsData(commentJson);
    } catch (err) {
      // Optionally handle error
      setVideoData(null);
      setCommentsData(null);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl mb-8">
              <Youtube className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-6xl font-bold text-foreground mb-6 leading-tight">
              Unlock YouTube Video Insights with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">YtGist</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform any YouTube video into actionable insights with YtGist's powerful AI analysis engine
            </p>
          </div>
        </section>

        {/* Video Input Section */}
        <section className="pb-20">
          <div className="max-w-2xl mx-auto">
            <VideoInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          </div>
        </section>

        {/* Results Section */}
        {(videoData || commentsData) && (
          <section className="pb-20">
            <div className="grid gap-8 lg:grid-cols-2">
              {videoData && (
                <div className="animate-fade-in">
                  <VideoSummary videoData={videoData} />
                </div>
              )}
              
              {commentsData && (
                <div className="animate-fade-in">
                  <CommentAnalysis
                    comments={commentsData.comments}
                    overallSentiment={commentsData.overallSentiment}
                    summary={commentsData.summary}
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Everything You Need to Understand YouTube Content
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our AI-powered platform provides comprehensive analysis to help you make data-driven decisions
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="group p-8 bg-card rounded-2xl border border-border hover:border-blue-500/50 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-6 group-hover:scale-105 transition-transform duration-300">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Video Summary</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Get AI-powered summaries that capture key points, main topics, and crucial insights from any YouTube video in seconds.
                </p>
                <div className="flex items-center text-blue-500 font-medium group-hover:text-blue-400 transition-colors">
                  <span>Learn more</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              <div className="group p-8 bg-card rounded-2xl border border-border hover:border-purple-500/50 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mb-6 group-hover:scale-105 transition-transform duration-300">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Comment Analysis</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Comprehensive analysis of comments with intelligent summarization, trend detection, and audience engagement insights.
                </p>
                <div className="flex items-center text-purple-500 font-medium group-hover:text-purple-400 transition-colors">
                  <span>Learn more</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              <div className="group p-8 bg-card rounded-2xl border border-border hover:border-green-500/50 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mb-6 group-hover:scale-105 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Sentiment Detection</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Advanced sentiment analysis to understand audience reactions, emotional responses, and overall engagement patterns.
                </p>
                <div className="flex items-center text-green-500 font-medium group-hover:text-green-400 transition-colors">
                  <span>Learn more</span>
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Ready to Transform Your YouTube Analysis?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start analyzing YouTube videos with AI-powered insights
            </p>
            <button 
              onClick={() => document.querySelector('input')?.focus()}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 transform hover:scale-105"
            >
              <Youtube className="h-5 w-5 mr-2" />
              Get Started Now
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
