import { prisma } from '../config/index.js';
import { AppError } from '../utils/index.js';

// Dashboard Statistics
export const getDashboardStats = async () => {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOf7Days = new Date(now.setDate(now.getDate() - 7));
    const startOf30Days = new Date(now.setDate(now.getDate() - 30));

    const [
        totalUsers,
        totalProperties,
        activeProperties,
        totalViews,
        totalContacts,
        newUsersToday,
        newListingsToday,
        newUsers7Days,
        newListings7Days,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.property.count(),
        prisma.property.count({ where: { status: 'ACTIVE' } }),
        prisma.property.aggregate({
            _sum: { views: true },
        }),
        prisma.contactAccess.count(),
        prisma.user.count({
            where: { createdAt: { gte: startOfDay } },
        }),
        prisma.property.count({
            where: { createdAt: { gte: startOfDay } },
        }),
        prisma.user.count({
            where: { createdAt: { gte: startOf7Days } },
        }),
        prisma.property.count({
            where: { createdAt: { gte: startOf7Days } },
        }),
    ]);

    return {
        totalUsers,
        totalProperties,
        activeProperties,
        totalViews: totalViews._sum.views || 0,
        totalContacts,
        newUsersToday,
        newListingsToday,
        newUsers7Days,
        newListings7Days,
    };
};

// User Management
export const getAllUsers = async (filters: any) => {
    const {
        search = '',
        role,
        isVerified,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 50,
    } = filters;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    // Search filter
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
        ];
    }

    // Role filter
    if (role) {
        where.role = role;
    }

    // Verification filter
    if (isVerified !== undefined) {
        where.isVerified = isVerified === 'true';
    }

    // Date range filter
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                isVerified: true,
                credits: true,
                avatar: true,
                createdAt: true,
                _count: {
                    select: {
                        properties: true,
                        contactsGiven: true,
                    },
                },
            },
            orderBy: { [sortBy]: sortOrder },
            skip,
            take: Number(limit),
        }),
        prisma.user.count({ where }),
    ]);

    return {
        users,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
    };
};

export const getUserById = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            properties: {
                select: {
                    id: true,
                    title: true,
                    status: true,
                    views: true,
                    type: true,
                    listingType: true,
                    price: true,
                    city: true,
                    locality: true,
                    createdAt: true,
                },
            },
            contactsGiven: {
                select: {
                    id: true,
                    property: {
                        select: {
                            title: true,
                        },
                    },
                    viewer: {
                        select: {
                            name: true,
                            phone: true,
                        },
                    },
                    timestamp: true,
                },
                orderBy: { timestamp: 'desc' },
                take: 20,
            },
        },
    });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return user;
};

export const updateUser = async (id: string, data: any) => {
    const { name, email, role, credits, isVerified } = data;

    const user = await prisma.user.update({
        where: { id },
        data: {
            name,
            email,
            role,
            credits: credits !== undefined ? Number(credits) : undefined,
            isVerified,
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            isVerified: true,
            credits: true,
            avatar: true,
            createdAt: true,
        },
    });

    return user;
};

export const deleteUser = async (id: string) => {
    // First, delete all related records
    await prisma.contactAccess.deleteMany({
        where: { OR: [{ viewerId: id }, { ownerId: id }] },
    });

    // Delete user's properties
    await prisma.property.deleteMany({
        where: { ownerId: id },
    });

    // Delete user
    await prisma.user.delete({
        where: { id },
    });

    return { message: 'User deleted successfully' };
};

// Property Management
export const getAllProperties = async (filters: any) => {
    const {
        search = '',
        type,
        listingType,
        status,
        city,
        minPrice,
        maxPrice,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 50,
    } = filters;

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    // Search filter
    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { locality: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
        ];
    }

    // Type filter
    if (type) {
        where.type = type;
    }

    // Listing type filter
    if (listingType) {
        where.listingType = listingType;
    }

    // Status filter
    if (status) {
        where.status = status;
    }

    // City filter
    if (city) {
        where.city = { contains: city, mode: 'insensitive' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = Number(minPrice);
        if (maxPrice) where.price.lte = Number(maxPrice);
    }

    // Date range filter
    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [properties, total] = await Promise.all([
        prisma.property.findMany({
            where,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        contacts: true,
                    },
                },
            },
            orderBy: { [sortBy]: sortOrder },
            skip,
            take: Number(limit),
        }),
        prisma.property.count({ where }),
    ]);

    return {
        properties,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
    };
};

export const updatePropertyStatus = async (id: string, status: string) => {
    const property = await prisma.property.update({
        where: { id },
        data: { status: status as any },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                },
            },
        },
    });

    return property;
};

export const deleteProperty = async (id: string) => {
    // Delete contact accesses for this property
    await prisma.contactAccess.deleteMany({
        where: { propertyId: id },
    });

    // Delete property
    await prisma.property.delete({
        where: { id },
    });

    return { message: 'Property deleted successfully' };
};

// Contact History
export const getContactHistory = async (filters: any) => {
    const {
        page = 1,
        limit = 50,
    } = filters;

    const skip = (Number(page) - 1) * Number(limit);

    const [contacts, total] = await Promise.all([
        prisma.contactAccess.findMany({
            include: {
                viewer: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                    },
                },
                owner: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                    },
                },
                property: {
                    select: {
                        id: true,
                        title: true,
                        city: true,
                        locality: true,
                    },
                },
            },
            orderBy: { timestamp: 'desc' },
            skip,
            take: Number(limit),
        }),
        prisma.contactAccess.count(),
    ]);

    return {
        contacts,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
    };
};

// Analytics
export const getAnalyticsData = async (days: number = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // User growth over time
    const userGrowth = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT
            DATE("createdAt") as date,
            COUNT(*) as count
        FROM "User"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
    `;

    // Listing trend over time
    const listingTrend = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT
            DATE("createdAt") as date,
            COUNT(*) as count
        FROM "Property"
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
    `;

    // Contacts over time
    const contactTrend = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT
            DATE("timestamp") as date,
            COUNT(*) as count
        FROM "ContactAccess"
        WHERE "timestamp" >= ${startDate}
        GROUP BY DATE("timestamp")
        ORDER BY date ASC
    `;

    // Properties by city
    const propertiesByCity = await prisma.property.groupBy({
        by: ['city'],
        _count: {
            id: true,
        },
        orderBy: {
            _count: {
                id: 'desc',
            },
        },
        take: 10,
    });

    // Properties by type
    const propertiesByType = await prisma.property.groupBy({
        by: ['type'],
        _count: {
            id: true,
        },
    });

    // User distribution by role
    const usersByRole = await prisma.user.groupBy({
        by: ['role'],
        _count: {
            id: true,
        },
    });

    // Convert BigInt to Number for JSON serialization
    return {
        userGrowth: userGrowth.map((item: any) => ({
            ...item,
            count: Number(item.count),
        })),
        listingTrend: listingTrend.map((item: any) => ({
            ...item,
            count: Number(item.count),
        })),
        contactTrend: contactTrend.map((item: any) => ({
            ...item,
            count: Number(item.count),
        })),
        propertiesByCity,
        propertiesByType,
        usersByRole,
    };
};

// Activity Logs
export const getActivityLogs = async (limit: number = 20) => {
    // Get recent activities
    const [recentUsers, recentProperties, recentContacts] = await Promise.all([
        prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        }),
        prisma.property.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
                id: true,
                title: true,
                createdAt: true,
                owner: {
                    select: {
                        name: true,
                    },
                },
            },
        }),
        prisma.contactAccess.findMany({
            orderBy: { timestamp: 'desc' },
            take: limit,
            include: {
                viewer: {
                    select: {
                        name: true,
                    },
                },
                property: {
                    select: {
                        title: true,
                    },
                },
            },
        }),
    ]);

    // Combine and sort by date
    const activities: any[] = [];

    recentUsers.forEach((user) => {
        activities.push({
            type: 'user_signup',
            message: `${user.name || user.email} joined`,
            timestamp: user.createdAt,
            data: user,
        });
    });

    recentProperties.forEach((property) => {
        activities.push({
            type: 'property_posted',
            message: `${property.owner.name} posted "${property.title}"`,
            timestamp: property.createdAt,
            data: property,
        });
    });

    recentContacts.forEach((contact) => {
        activities.push({
            type: 'contact_made',
            message: `${contact.viewer.name} viewed contact of "${contact.property.title}"`,
            timestamp: contact.timestamp,
            data: contact,
        });
    });

    // Sort by timestamp descending
    activities.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return activities.slice(0, limit);
};
