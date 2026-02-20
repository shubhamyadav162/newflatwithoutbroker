import { Response, NextFunction } from 'express';
import { ContactService } from '../services/index.js';
import { AppError, catchAsync } from '../utils/index.js';
import { AuthRequest } from '../middlewares/index.js';

// Reveal owner contact
export const revealContact = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { propertyId } = req.body;

    const contact = await ContactService.revealContact(req.user!.id, propertyId);

    if (!contact) {
        return next(new AppError('Property not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Contact revealed successfully',
        data: { contact },
    });
});

// Get contact history
export const getContactHistory = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const history = await ContactService.getContactHistory(req.user!.id);

    res.status(200).json({
        success: true,
        data: { history },
    });
});
