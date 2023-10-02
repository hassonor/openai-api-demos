import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize OpenAI instance with an API key from environment variables
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export default openai;