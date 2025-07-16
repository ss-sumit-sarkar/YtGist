import express from 'express';
import { getVideoSummary } from '../controllers/videoController.js';

const router = express.Router();

router.post('/', getVideoSummary);
router.post('', getVideoSummary);

export default router; 