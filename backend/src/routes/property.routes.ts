import { Router } from 'express';
import {
    getAllProperties,
    getProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    getMyProperties,
} from '../controllers/index.js';
import { protect, validate } from '../middlewares/index.js';
import { createPropertySchema, updatePropertySchema } from '../utils/index.js';

const router = Router();

// User's properties (must come before /:id route)
router.get('/user/my-listings', protect, getMyProperties);

// Public routes
router.get('/', getAllProperties);
router.get('/:id', getProperty);

// Protected routes
router.post('/', protect, validate(createPropertySchema), createProperty);
router.put('/:id', protect, validate(updatePropertySchema), updateProperty);
router.delete('/:id', protect, deleteProperty);

export default router;

