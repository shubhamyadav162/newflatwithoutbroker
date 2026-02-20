import { Router } from 'express';
import authRoutes from './auth.routes.js';
import propertyRoutes from './property.routes.js';
import searchRoutes from './search.routes.js';
import contactRoutes from './contact.routes.js';
import googleRoutes from './google.routes.js';
import adminRoutes from './admin.routes.js';
import uploadRoutes from './upload.routes.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'ok',
        message: 'FlatWithoutBrokerage API is running (Demo Mode)',
        timestamp: new Date().toISOString(),
        mode: 'mock-data',
    });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/auth', googleRoutes); // Google OAuth routes
router.use('/properties', propertyRoutes);
router.use('/search', searchRoutes);
router.use('/contact', contactRoutes);
router.use('/admin', adminRoutes); // Admin routes
router.use('/upload', uploadRoutes); // Image upload routes

export default router;
