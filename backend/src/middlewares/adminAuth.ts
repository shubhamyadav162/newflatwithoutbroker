import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma, env } from '../config/index.js';
import { AppError } from '../utils/index.js';

export interface AdminRequest extends Request {
    admin?: any;
}

export const adminOnly = async (
    req: AdminRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        // Check for admin password authentication (alternative to JWT)
        const adminPassword = req.headers['x-admin-password'] as string;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

        // Use a secure timing-safe equality check if possible, or basic check when ENV is explicitly set
        // DO NOT fallback to a hardcoded string as this leaves a backdoor!
        if (ADMIN_PASSWORD && adminPassword === ADMIN_PASSWORD) {
            // Admin password authentication successful
            req.admin = { email: 'admin@flatwithoutbrokerage.com', role: 'ADMIN' };
            return next();
        }

        // Check if user is authenticated with JWT
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
        }

        // Verify token
        const decoded = jwt.verify(token, env.JWT_SECRET) as any;

        // Check if user exists and is admin
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
            });
        }

        if (user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.',
            });
        }

        req.admin = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
        });
    }
};
