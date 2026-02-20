import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/index.js';
import { AppError, catchAsync } from '../utils/index.js';
import { AuthRequest } from '../middlewares/index.js';
import { prisma } from '../config/index.js';

// Send OTP
export const sendOtp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { phone } = req.body;

    const result = await AuthService.sendOtp(phone);

    res.status(200).json({
        success: true,
        message: result.message,
    });
});

// Verify OTP and login
export const verifyOtp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { phone, otp } = req.body;

    const isValid = await AuthService.verifyOtp(phone, otp);

    if (!isValid) {
        return next(new AppError('Invalid or expired OTP', 400));
    }

    // Find or create user
    const user = await AuthService.findOrCreateUser(phone);

    // Generate tokens
    const tokens = AuthService.generateTokens(user);

    res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: user.id,
                phone: user.phone,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified,
            },
            ...tokens,
        },
    });
});

// Refresh token
export const refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return next(new AppError('Refresh token is required', 400));
    }

    try {
        const result = await AuthService.refreshAccessToken(refreshToken);

        res.status(200).json({
            success: true,
            data: {
                accessToken: result.accessToken,
            },
        });
    } catch {
        return next(new AppError('Invalid refresh token', 401));
    }
});

// Get current user
export const getMe = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
            id: true,
            phone: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            isVerified: true,
            credits: true,
            createdAt: true,
        },
    });

    res.status(200).json({
        success: true,
        data: { user },
    });
});

// Update profile
export const updateProfile = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { name, email } = req.body;

    const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: { name, email },
        select: {
            id: true,
            phone: true,
            name: true,
            email: true,
            role: true,
            isVerified: true,
        },
    });

    res.status(200).json({
        success: true,
        data: { user },
    });
});
