import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env, prisma } from '../config/index.js';
import { AppError } from '../utils/index.js';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        phone?: string | null;
        email?: string | null;
        role: string;
    };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        let token: string | undefined;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('Please log in to access this resource', 401));
        }

        // Verify token
        const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; phone: string; role: string };

        // Check if user still exists
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        if (!user) {
            return next(new AppError('User no longer exists', 401));
        }

        // Grant access
        req.user = {
            id: user.id,
            phone: user.phone,
            email: user.email,
            role: user.role,
        };

        next();
    } catch (error) {
        return next(new AppError('Invalid or expired token', 401));
    }
};

// Optional auth - sets user if token provided, but doesn't require it
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        let token: string | undefined;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }

        if (token) {
            const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; phone: string; role: string };
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
            });

            if (user) {
                req.user = {
                    id: user.id,
                    phone: user.phone,
                    email: user.email,
                    role: user.role,
                };
            }
        }

        next();
    } catch {
        // Token invalid but that's okay for optional auth
        next();
    }
};

// Restrict to specific roles
export const restrictTo = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
