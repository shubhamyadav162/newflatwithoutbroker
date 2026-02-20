import { Router } from 'express';
import { sendOtp, verifyOtp, refreshToken, getMe, updateProfile } from '../controllers/index.js';
import { protect, validate } from '../middlewares/index.js';
import { sendOtpSchema, verifyOtpSchema } from '../utils/index.js';

const router = Router();

// Public routes
router.post('/send-otp', validate(sendOtpSchema), sendOtp);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);

export default router;
