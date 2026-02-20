import { Router } from 'express';
import { revealContact, getContactHistory } from '../controllers/index.js';
import { protect, validate } from '../middlewares/index.js';
import { revealContactSchema } from '../utils/index.js';

const router = Router();

// All routes require authentication
router.post('/reveal', protect, validate(revealContactSchema), revealContact);
router.get('/history', protect, getContactHistory);

export default router;
