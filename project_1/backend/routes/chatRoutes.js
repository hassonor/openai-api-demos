import express from 'express';
import {
    streamChat,
    summaryPDF,
    gptCompletion,
    getWeatherWithGptChatCompletion,
    getChatBotResponse
} from '../controllers/chatController.js';
import multer from "multer";
import cfg from "../config.js";

const upload = multer({dest: cfg.dir.pdfsummary});

const router = express.Router();

// Define routes for chat functionalities
router.post('/api/chatgpt/stream', streamChat);
router.post('/api/chatgpt/weather', getWeatherWithGptChatCompletion);
router.post('/api/chatgpt/chatbot', getChatBotResponse);
router.post('/api/chatgpt/summary-pdf', upload.single('pdf'), summaryPDF);
router.post('/api/chatgpt', gptCompletion);


export default router;