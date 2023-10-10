import app from './app.js';
import cfg from './config.js';

// Start the Express server on the specified port
app.listen(cfg.port, () => {
    console.log(`Server listening at http://localhost:${cfg.port}`);
});