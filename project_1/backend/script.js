// Importing required modules
import {fileURLToPath} from 'url'; // Convert a module URL to a file path
import {dirname, parse, sep} from 'path'; // Extract directory name and get platform-specific path separator
import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import compression from 'compression';
import expressRateLimit from "express-rate-limit";
import sanitize from './sanitize.js';


import OpenAI from 'openai';

dotenv.config();

// Determine the directory paths for various resources in the app
const __dirname = dirname(fileURLToPath(import.meta.url)) + sep;

// Configuration object for the app
const cfg = {
    port: process.env.PORT || 4000,
    dir: {
        root: __dirname,
        static: __dirname + 'static' + sep
    },
    nameLen: 15,
    msgLen: 200
};

// Initialize Express app
const app = express();

// Express configurations
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Middleware configurations
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitize);
app.use(express.static(cfg.dir.static));

// Rate limiting middleware to prevent DOS attacks
app.use("/api/", expressRateLimit({
    windowMs: 1000,
    max: 100,
    message: "Too many requests, please try again later."
}));

// Initialize OpenAI instance
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Endpoint to handle POST request to /api/chatgpt
app.post('/api/chatgpt', async (req, res) => {
    try {
        const {text} = req.body;
        const chatCompletion = await openai.completions.create({
            model: "gpt-3.5-turbo-instruct",
            prompt: text,
            max_tokens: 20,
        });
        console.log(chatCompletion)
        res.json({data: chatCompletion});

    } catch (error) {
        if(error.response){
            console.error(error.response.status, error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            console.error('Error with OPENAI API request:', error.message);
            res.status(500).json({
                error: {
                    message: 'An error occurred during your request.'
                }
            });
        }
    }
});

// Middleware to handle undefined routes
app.use("*", (request, response) => response.status(404).send("Route not found."));

// Start the Express server
app.listen(cfg.port, () => {
    console.log(`Server listening at http://localhost:${cfg.port}`);
});

// Export configurations and app for potential external use
export { cfg, app };
