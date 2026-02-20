import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/index.js';
import { env } from '../config/index.js';

interface CustomError extends Error {
    statusCode?: number;
    status?: string;
    isOperational?: boolean;
    code?: string;
}

export const errorHandler = (
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (env.NODE_ENV === 'development') {
        return res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message,
            stack: err.stack,
            error: err,
        });
    }

    // Production: don't leak error details
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            success: false,
            status: err.status,
            message: err.message,
        });
    }

    // Programming or unknown error
    console.error('ERROR 💥:', err);
    return res.status(500).json({
        success: false,
        status: 'error',
        message: 'Something went wrong!',
    });
};

// Handle 404
export const notFound = (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
};
