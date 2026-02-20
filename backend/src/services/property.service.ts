import { prisma } from '../config/index.js';
import { CreatePropertyInput, UpdatePropertyInput } from '../utils/index.js';
import { Prisma } from '@prisma/client';

export class PropertyService {
    // Get all properties with pagination
    static async getAll(page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [properties, total] = await Promise.all([
            prisma.property.findMany({
                where: { status: 'ACTIVE' },
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            isVerified: true,
                            avatar: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.property.count({ where: { status: 'ACTIVE' } }),
        ]);

        return {
            properties,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    // Get single property by ID
    static async getById(id: string) {
        const property = await prisma.property.findUnique({
            where: { id },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        isVerified: true,
                        avatar: true,
                    },
                },
            },
        });

        if (property) {
            // Increment view count asynchronously
            prisma.property.update({
                where: { id },
                data: { views: { increment: 1 } },
            }).catch(console.error);
        }

        return property;
    }

    // Create new property
    static async create(ownerId: string, data: CreatePropertyInput) {
        return prisma.property.create({
            data: {
                ...data,
                ownerId,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        isVerified: true,
                        avatar: true,
                    },
                },
            },
        });
    }

    // Update property (owner only)
    static async update(id: string, ownerId: string, data: UpdatePropertyInput) {
        // First check ownership
        const property = await prisma.property.findUnique({
            where: { id },
        });

        if (!property) {
            return null;
        }

        if (property.ownerId !== ownerId) {
            throw new Error('Not authorized to update this property');
        }

        return prisma.property.update({
            where: { id },
            data,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        isVerified: true,
                        avatar: true,
                    },
                },
            },
        });
    }

    // Soft delete property
    static async delete(id: string, ownerId: string) {
        const property = await prisma.property.findUnique({
            where: { id },
        });

        if (!property) {
            return null;
        }

        if (property.ownerId !== ownerId) {
            throw new Error('Not authorized to delete this property');
        }

        return prisma.property.update({
            where: { id },
            data: { status: 'INACTIVE' },
        });
    }

    // Get user's properties
    static async getByOwner(ownerId: string) {
        return prisma.property.findMany({
            where: { ownerId },
            orderBy: { createdAt: 'desc' },
        });
    }
}
