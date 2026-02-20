import { Router } from 'express';
import {
    getDashboardStats,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAllProperties,
    updatePropertyStatus,
    deleteProperty,
    getContactHistory,
    getAnalyticsData,
    getActivityLogs,
} from '../controllers/admin.controller.js';
import { adminOnly } from '../middlewares/adminAuth.js';

const router = Router();

// Apply admin middleware to all routes
router.use(adminOnly);

// Dashboard Stats
router.get('/stats/dashboard', getDashboardStats);

// User Management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Property Management
router.get('/properties', getAllProperties);
router.patch('/properties/:id/status', updatePropertyStatus);
router.delete('/properties/:id', deleteProperty);

// Contact History
router.get('/contacts', getContactHistory);

// Analytics
router.get('/analytics', getAnalyticsData);

// Activity Logs
router.get('/activity-logs', getActivityLogs);

export default router;
