import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import router from './routes/index.js';

const app = express();

// Security middleware
app.use(helmet());

// CORS - Lock down for production, allow specific origins
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL || 'https://your-production-url.com'
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        // In production, you might want to remove !origin if mobile is not expected
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Too many requests, please try again later.',
    },
});

app.use(limiter);

// Body parser
app.use(express.json({ limit: '5mb' })); // Changed from 50mb to 5mb
app.use(express.urlencoded({ extended: true, limit: '5mb' })); // Changed from 50mb to 5mb

// Use real routes
app.use('/api/v1', router);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Cannot find ${req.originalUrl} on this server`,
    });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);

    // Prevent leaking sensitive info in production
    const message = process.env.NODE_ENV === 'production' && !err.isOperational
        ? 'Something went wrong!'
        : err.message || 'Something went wrong!';

    res.status(err.statusCode || 500).json({
        success: false,
        message,
    });
});

export default app;
