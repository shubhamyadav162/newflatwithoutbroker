import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../services/index.js';
import { catchAsync } from '../utils/index.js';

// Search properties
export const searchProperties = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await SearchService.search(req.query as any);

    res.status(200).json({
        success: true,
        data: result,
    });
});

// Get cities with property count
export const getCities = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const cities = await SearchService.getCitiesWithCount();

    res.status(200).json({
        success: true,
        data: { cities },
    });
});
