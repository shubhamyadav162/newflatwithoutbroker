import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/index.js';

export const validate = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
            return next(new AppError(`Validation failed: ${errors.join(', ')}`, 400));
        }

        req.body = result.data;
        next();
    };
};

export const validateQuery = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.query);

        if (!result.success) {
            const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
            return next(new AppError(`Query validation failed: ${errors.join(', ')}`, 400));
        }

        req.query = result.data;
        next();
    };
};
