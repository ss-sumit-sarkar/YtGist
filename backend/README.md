# Backend

This is the backend for the YouTube Summarization app.

## Setup

```bash
cd backend
npm install
```

## Development

```bash
npx nodemon server.js
```

## Environment Variables

Create a `.env` file in the `backend/` directory with the following:

```
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
YOUTUBE_API_KEY=your_youtube_api_key
PORT=5000
```

---

- All backend code is in `src/`.
- Uses Express, Mongoose, and Gemini API. 