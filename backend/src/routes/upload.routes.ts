import { Router } from 'express';
import { uploadImages } from '../controllers/index.js';
import { protect } from '../middlewares/index.js';
import { upload } from '../services/cloudinary.service.js';

const router = Router();

// Endpoint for multiple image uploads
router.post('/', protect, upload.array('images', 10), uploadImages);

export default router;
