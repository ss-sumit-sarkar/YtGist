import axios from 'axios';

export async function fetchVideoDetails(videoId) {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  const ytRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
    params: {
      part: 'snippet,contentDetails,statistics',
      id: videoId,
      key: YOUTUBE_API_KEY
    }
  });
  const video = ytRes.data.items[0];
  if (!video) return null;
  return {
    title: video.snippet.title,
    description: video.snippet.description,
    duration: video.contentDetails.duration,
    views: video.statistics.viewCount,
    likes: video.statistics.likeCount
  };
}

export async function fetchComments(videoId) {
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
  let comments = [];
  let nextPageToken = null;
  let fetched = 0;
  const maxComments = 100;
  do {
    const ytRes = await axios.get('https://www.googleapis.com/youtube/v3/commentThreads', {
      params: {
        part: 'snippet',
        videoId,
        key: YOUTUBE_API_KEY,
        maxResults: 50,
        pageToken: nextPageToken || undefined
      }
    });
    const batch = ytRes.data.items.map(item => {
      const c = item.snippet.topLevelComment.snippet;
      return {
        author: c.authorDisplayName,
        text: c.textDisplay,
        likes: c.likeCount
      };
    });
    comments = comments.concat(batch);
    fetched += batch.length;
    nextPageToken = ytRes.data.nextPageToken;
  } while (nextPageToken && comments.length < maxComments);
  return comments.slice(0, maxComments);
} 