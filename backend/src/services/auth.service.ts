import jwt from 'jsonwebtoken';
import { prisma, env } from '../config/index.js';

// In-memory OTP storage (use Redis in production)
const otpStore = new Map<string, { otp: string; expires: number }>();

export class AuthService {
    // Generate 4-digit OTP
    static generateOtp(): string {
        // In development, always use 1234 for testing
        if (env.NODE_ENV === 'development') {
            return '1234';
        }
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    // Send OTP (mock for now - integrate SMS API later)
    static async sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
        const otp = this.generateOtp();
        const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

        // Store OTP
        otpStore.set(phone, { otp, expires });

        // In production, send SMS here
        console.log(`[DEV] OTP for ${phone}: ${otp}`);

        return {
            success: true,
            message: 'OTP sent successfully',
        };
    }

    // Verify OTP
    static async verifyOtp(phone: string, otp: string): Promise<boolean> {
        const stored = otpStore.get(phone);

        if (!stored) {
            return false;
        }

        if (Date.now() > stored.expires) {
            otpStore.delete(phone);
            return false;
        }

        if (stored.otp !== otp) {
            return false;
        }

        // OTP verified, delete it
        otpStore.delete(phone);
        return true;
    }

    // Find or create user
    static async findOrCreateUser(phone: string) {
        let user = await prisma.user.findUnique({
            where: { phone },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    phone,
                    isVerified: true,
                },
            });
        }

        return user;
    }

    // Generate JWT tokens
    static generateTokens(user: { id: string; phone?: string | null; email?: string | null; role: string }) {
        const accessToken = jwt.sign(
            { id: user.id, phone: user.phone, email: user.email, role: user.role },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            env.JWT_REFRESH_SECRET,
            { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
        );

        return { accessToken, refreshToken };
    }

    // Refresh access token
    static async refreshAccessToken(refreshToken: string) {
        const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { id: string };

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        if (!user) {
            throw new Error('User not found');
        }

        const accessToken = jwt.sign(
            { id: user.id, phone: user.phone, role: user.role },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
        );

        return { accessToken, user };
    }
}
