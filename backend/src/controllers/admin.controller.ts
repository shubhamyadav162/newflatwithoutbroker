import { catchAsync, AppError } from '../utils/index.js';
import * as adminService from '../services/admin.service.js';
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/index.js';

// Dashboard
export const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({
        success: true,
        data: stats,
    });
});

// User Management
export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const users = await adminService.getAllUsers(req.query);
    res.status(200).json({
        success: true,
        data: users,
    });
});

export const getUserById = catchAsync(async (req: Request, res: Response) => {
    const user = await adminService.getUserById(req.params.id);
    res.status(200).json({
        success: true,
        data: user,
    });
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
    const user = await adminService.updateUser(req.params.id, req.body);
    res.status(200).json({
        success: true,
        data: user,
        message: 'User updated successfully',
    });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
    await adminService.deleteUser(req.params.id);
    res.status(200).json({
        success: true,
        message: 'User deleted successfully',
    });
});

// Property Management
export const getAllProperties = catchAsync(async (req: Request, res: Response) => {
    const properties = await adminService.getAllProperties(req.query);
    res.status(200).json({
        success: true,
        data: properties,
    });
});

export const updatePropertyStatus = catchAsync(async (req: Request, res: Response) => {
    const property = await adminService.updatePropertyStatus(
        req.params.id,
        req.body.status
    );
    res.status(200).json({
        success: true,
        data: property,
        message: 'Property status updated successfully',
    });
});

export const deleteProperty = catchAsync(async (req: Request, res: Response) => {
    await adminService.deleteProperty(req.params.id);
    res.status(200).json({
        success: true,
        message: 'Property deleted successfully',
    });
});

// Contact History
export const getContactHistory = catchAsync(async (req: Request, res: Response) => {
    const contacts = await adminService.getContactHistory(req.query);
    res.status(200).json({
        success: true,
        data: contacts,
    });
});

// Analytics
export const getAnalyticsData = catchAsync(async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string) || 30;
    const analytics = await adminService.getAnalyticsData(days);
    res.status(200).json({
        success: true,
        data: analytics,
    });
});

// Activity Logs
export const getActivityLogs = catchAsync(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const activities = await adminService.getActivityLogs(limit);
    res.status(200).json({
        success: true,
        data: activities,
    });
});
