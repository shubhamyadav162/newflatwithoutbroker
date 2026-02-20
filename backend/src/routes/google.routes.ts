import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma, env } from '../config/index.js';

const router = Router();

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_CALLBACK_URL || 'https://flatwithoutbrokerage.com/api/v1/auth/google/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://flatwithoutbrokerage.com';

// Step 1: Redirect to Google OAuth
router.get('/google', (req: Request, res: Response) => {
    const scope = encodeURIComponent('openid email profile');
    const redirectUri = encodeURIComponent(GOOGLE_REDIRECT_URI);
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    res.redirect(googleAuthUrl);
});

// Step 2: Handle Google OAuth callback
router.get('/google/callback', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.redirect(`${FRONTEND_URL}/login?error=no_code`);
        }

        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code: code as string,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: GOOGLE_REDIRECT_URI,
                grant_type: 'authorization_code',
            }),
        });

        const tokenData = await tokenResponse.json() as { access_token?: string; error?: string };

        if (tokenData.error || !tokenData.access_token) {
            console.error('Google token error:', tokenData);
            return res.redirect(`${FRONTEND_URL}/login?error=token_failed`);
        }

        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        const googleUser = await userInfoResponse.json() as {
            id: string;
            email: string;
            name: string;
            picture: string;
        };

        // Find or create user in database
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { googleId: googleUser.id },
                    { email: googleUser.email },
                ],
            },
        });

        if (!user) {
            // Create new user
            user = await prisma.user.create({
                data: {
                    googleId: googleUser.id,
                    email: googleUser.email,
                    name: googleUser.name,
                    avatar: googleUser.picture,
                    isVerified: true,
                },
            });
        } else if (!user.googleId) {
            // Link Google account to existing user
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    googleId: googleUser.id,
                    avatar: googleUser.picture || user.avatar,
                    name: user.name || googleUser.name,
                    isVerified: true,
                },
            });
        }

        // Generate JWT tokens with full user info
        const accessToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
                avatar: user.avatar,
                role: user.role,
            },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            env.JWT_REFRESH_SECRET,
            { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
        );

        // Redirect to frontend with tokens
        res.redirect(`${FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);

    } catch (error) {
        console.error('Google OAuth error:', error);
        res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
    }
});

export default router;
