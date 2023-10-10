// Importing necessary modules for configuration
import { fileURLToPath } from 'url';
import { dirname, sep } from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Determine the directory paths for various resources in the app
const __dirname = dirname(fileURLToPath(import.meta.url)) + sep;

// Configuration object for the app
const cfg = {
    port: process.env.PORT || 4000,
    dir: {
        root: __dirname,
        static: __dirname + 'static' + sep,
        pdfsummary: __dirname + 'pdfsummary' + sep
    },
    nameLen: 15,
    msgLen: 200
};

export default cfg;