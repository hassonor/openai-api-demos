import expressRateLimit from "express-rate-limit";

// Rate limiting middleware to prevent DOS attacks
const rateLimiter = expressRateLimit({
    windowMs: 1000,
    max: 100,
    message: "Too many requests, please try again later."
});

export default rateLimiter;