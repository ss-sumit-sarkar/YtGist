import express from 'express';
import { getCommentAnalysis } from '../controllers/commentController.js';

const router = express.Router();

router.post('/', getCommentAnalysis);
router.post('', getCommentAnalysis);

export default router; 