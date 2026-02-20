import { Request, Response, NextFunction } from 'express';
import { PropertyService } from '../services/index.js';
import { AppError, catchAsync } from '../utils/index.js';
import { AuthRequest } from '../middlewares/index.js';

// Get all properties
export const getAllProperties = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await PropertyService.getAll(page, limit);

    res.status(200).json({
        success: true,
        data: result,
    });
});

// Get single property
export const getProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const property = await PropertyService.getById(id);

    if (!property) {
        return next(new AppError('Property not found', 404));
    }

    res.status(200).json({
        success: true,
        data: { property },
    });
});

// Create property
export const createProperty = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const property = await PropertyService.create(req.user!.id, req.body);

    res.status(201).json({
        success: true,
        message: 'Property listed successfully',
        data: { property },
    });
});

// Update property
export const updateProperty = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const property = await PropertyService.update(id, req.user!.id, req.body);

        if (!property) {
            return next(new AppError('Property not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Property updated successfully',
            data: { property },
        });
    } catch (error: any) {
        return next(new AppError(error.message, 403));
    }
});

// Delete property
export const deleteProperty = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
        const property = await PropertyService.delete(id, req.user!.id);

        if (!property) {
            return next(new AppError('Property not found', 404));
        }

        res.status(200).json({
            success: true,
            message: 'Property deleted successfully',
        });
    } catch (error: any) {
        return next(new AppError(error.message, 403));
    }
});

// Get my properties
export const getMyProperties = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const properties = await PropertyService.getByOwner(req.user!.id);

    res.status(200).json({
        success: true,
        data: { properties },
    });
});
