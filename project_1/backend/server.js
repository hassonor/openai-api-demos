// Import necessary modules
import express from 'express';
import dotenv from 'dotenv';
import compression from 'compression';
import {fileURLToPath} from 'url';
import {dirname, sep} from 'path';

dotenv.config();

// Determine the directory paths for various resources in the app
const __dirname = dirname(fileURLToPath(import.meta.url)) + sep;

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
app.use(compression());
app.use(express.static(cfg.dir.static));

app.use((req, res) => {
    res.status(404).send("Not Found");
});


// Start the Express server
app.listen(cfg.port, () => {
    console.log(`Server listening at http://localhost:${cfg.port}`);
});


// Export configurations and app for potential external use
export {cfg, app};