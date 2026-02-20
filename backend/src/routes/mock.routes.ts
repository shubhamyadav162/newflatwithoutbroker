import { Router, Request, Response } from 'express';
import { getMockProperties, getMockPropertyById, searchMockProperties, getMockCitiesWithCount } from '../services/mock.service.js';

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

// Get all properties
router.get('/properties', (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = searchMockProperties({ page, limit });

    res.status(200).json({
        success: true,
        data: result,
    });
});

// Get single property
router.get('/properties/:id', (req: Request, res: Response) => {
    const property = getMockPropertyById(req.params.id);

    if (!property) {
        return res.status(404).json({
            success: false,
            message: 'Property not found',
        });
    }

    res.status(200).json({
        success: true,
        data: { property },
    });
});

// Search properties
router.get('/search', (req: Request, res: Response) => {
    const filters = {
        q: req.query.q as string | undefined,
        city: req.query.city as string | undefined,
        type: req.query.type as string | undefined,
        listingType: req.query.listingType as string | undefined,
        bhk: req.query.bhk ? parseInt(req.query.bhk as string) : undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        furnishing: req.query.furnishing as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };

    const result = searchMockProperties(filters);

    res.status(200).json({
        success: true,
        data: {
            ...result,
            filters,
        },
    });
});

// Get cities with count
router.get('/search/cities', (req: Request, res: Response) => {
    const cities = getMockCitiesWithCount();

    res.status(200).json({
        success: true,
        data: { cities },
    });
});

// Mock auth endpoints
router.post('/auth/send-otp', (req: Request, res: Response) => {
    const { phone } = req.body;

    if (!phone || !phone.startsWith('+91')) {
        return res.status(400).json({
            success: false,
            message: 'Invalid phone number (use +91XXXXXXXXXX format)',
        });
    }

    console.log(`[DEMO] OTP for ${phone}: 1234`);

    res.status(200).json({
        success: true,
        message: 'OTP sent successfully (Demo: use 1234)',
    });
});

router.post('/auth/verify-otp', (req: Request, res: Response) => {
    const { phone, otp } = req.body;

    if (otp !== '1234') {
        return res.status(400).json({
            success: false,
            message: 'Invalid OTP (Demo: use 1234)',
        });
    }

    res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
            user: {
                id: 'demo-user',
                phone,
                name: 'Demo User',
                role: 'OWNER',
                isVerified: true,
            },
            accessToken: 'demo-token-12345',
            refreshToken: 'demo-refresh-12345',
        },
    });
});

router.get('/auth/me', (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        data: {
            user: {
                id: 'demo-user',
                phone: '+919999999999',
                name: 'Demo User',
                role: 'OWNER',
                isVerified: true,
                credits: 9999,
            },
        },
    });
});

// Mock contact reveal
router.post('/contact/reveal', (req: Request, res: Response) => {
    const { propertyId } = req.body;
    const property = getMockPropertyById(propertyId);

    if (!property) {
        return res.status(404).json({
            success: false,
            message: 'Property not found',
        });
    }

    res.status(200).json({
        success: true,
        message: 'Contact revealed successfully',
        data: {
            contact: {
                ownerName: property.owner.name,
                ownerPhone: property.owner.phone,
                isVerified: property.owner.isVerified,
                propertyTitle: property.title,
            },
        },
    });
});

export default router;
