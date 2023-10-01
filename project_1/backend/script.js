// Importing required modules
const { sep, join} = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require('compression');
const expressRateLimit = require("express-rate-limit");
const sanitize = require("./middleware/sanitize.js");
const { Configuration, OpenAIApi } = require('openai');

// Load environment variables from .env file
dotenv.config();

// Configuration object for the app
const cfg = {
    port: process.env.PORT || 4000,
    dir: {
        root: __dirname,
        static: join(__dirname, 'static', sep)
    },
    nameLen: 15,
    msgLen: 200
};

console.log(cfg)

// Initialize Express app
const app = express();

// Express configurations
app.disable('x-powered-by'); // Disable the 'X-Powered-By' header for security reasons
app.set('trust proxy', 1);

// Middleware configurations
app.use(helmet()); // Set security-related HTTP headers
app.use(cors()); // Enable CORS for all routes
app.use(morgan("dev")); // Log HTTP requests in development
app.use(compression()); // Compress response bodies
app.use(express.json()); // Parse incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse incoming URL-encoded payloads
app.use(sanitize); // Prevent XSS attacks
app.use(express.static(cfg.dir.static)); // Serve static files from the 'static' directory

// Rate limiting middleware to prevent DOS attacks
app.use("/api/", expressRateLimit({
    windowMs: 1000,
    max: 100,
    message: "Too many requests, please try again later."
}));

// OpenAI API Configuration
const configuration = new Configuration({
    apiKey: process.env.OPEN_API_KEY
});

// Initialize OpenAI instance using OpenAIApi
const openai = new OpenAIApi(configuration);

// Function to send a request to the OPENAI Completion API
async function runCompletion(prompt) {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 50
    });
    return response;
}

// Endpoint to handle POST request to /api/chatgpt
app.post('/api/chatgpt', async (req, res) => {
    try {
        const {text} = req.body; // Extract the text from the request body
        const completion = await runCompletion(text); // Pass the request text to the runCompletion function
        res.json({data: completion.data}); // Return the completion as a JSON response

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
module.exports = { cfg, app };
