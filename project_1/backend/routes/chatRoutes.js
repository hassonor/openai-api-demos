import express from 'express';
import {streamChat,  chatCompletion} from '../controllers/chatController.js';

const router = express.Router();

// Define routes for chat functionalities
router.post('/api/chatgpt/stream', streamChat);
router.post('/api/chatgpt', chatCompletion);

export default router;