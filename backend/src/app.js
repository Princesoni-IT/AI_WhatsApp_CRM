import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import routes from "./routes/index.js";
import errorHandler from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser";

const app = express();
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minutes
    max: 100,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Security Middleware
app.use(helmet());

// Logging Middleware
app.use(morgan("dev"));

// Rate Limiter
app.use(limiter);


// General Middleware
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());


//Routes
app.use("/api/v1", routes);

// Global Error Handler
app.use(errorHandler);


export default app;