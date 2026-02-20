import { Router } from 'express';
import { searchProperties, getCities } from '../controllers/index.js';
import { validateQuery } from '../middlewares/index.js';
import { searchQuerySchema } from '../utils/index.js';

const router = Router();

router.get('/', validateQuery(searchQuerySchema), searchProperties);
router.get('/cities', getCities);

export default router;
