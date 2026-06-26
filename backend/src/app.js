import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

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

// NoSQL Injection Protection
app.use(mongoSanitize());

// General Middleware
app.use(cors());
app.use(express.json());

app.get("/api/v1", (req, res) => {
    res.json({
        success: true,
        message: "AI WhatsApp CRM Backend is Running 🚀",
    });
});

export default app;