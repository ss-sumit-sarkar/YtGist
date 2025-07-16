import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

// Always load .env from the backend directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import videoRoutes from './routes/videoRoutes.js';
import commentRoutes from './routes/commentRoutes.js';

const app = express();
// CORS setup: allow only the deployed frontend URL
app.use(cors({
  origin: 'https://ytgist-frontend.onrender.com', // TODO: Replace with your actual frontend Render URL if different
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// Handle preflight requests for all routes
app.options('*', cors({
  origin: 'https://ytgist-frontend.onrender.com',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// Universal OPTIONS handler for all routes
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', 'https://ytgist-frontend.onrender.com');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    return res.sendStatus(204);
  }
  next();
});

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// Root route for Render health check or friendly message
app.get('/', (req, res) => {
  res.send('YtGist API is running!');
});

// MongoDB connection
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  throw new Error('MONGO_URI is not set in your .env file. Please add it to the project root');
}

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Register routes
app.use('/api/video-summary', videoRoutes);
app.use('/api/comment-analysis', commentRoutes);

export default app; 