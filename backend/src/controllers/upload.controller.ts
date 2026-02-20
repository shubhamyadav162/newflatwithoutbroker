import { Response, NextFunction } from 'express';
import { catchAsync } from '../utils/index.js';
import { AuthRequest } from '../middlewares/index.js';

export const uploadImages = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Please upload at least one image',
        });
    }

    const imageUrls = files.map(file => (file as any).path);

    res.status(200).json({
        success: true,
        message: 'Images uploaded successfully',
        data: {
            urls: imageUrls,
        },
    });
});
