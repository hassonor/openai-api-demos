import express from 'express';
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import compression from 'compression';
import sanitize from './middlewares/sanitize.js';
import rateLimiter from './middlewares/rateLimiter.js';
import chatRoutes from './routes/chatRoutes.js';
import cfg from './config/config.js';

const app = express();

// Express and middleware configurations
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitize);
app.use(express.static(cfg.dir.static));
app.use("/api/", rateLimiter);
app.use(chatRoutes);
app.use("*", (request, response) => response.status(404).send("Route not found."));

export default app;
