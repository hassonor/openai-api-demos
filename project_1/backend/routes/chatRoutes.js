import express from 'express';
import { streamChat, chat } from '../controllers/chatController.js';

const router = express.Router();

// Define routes for chat functionalities
router.post('/api/chatgpt/stream', streamChat);
router.post('/api/chatgpt', chat);

export default router;