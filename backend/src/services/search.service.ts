import { prisma } from '../config/index.js';
import { SearchQueryInput } from '../utils/index.js';
import { Prisma } from '@prisma/client';

export class SearchService {
    // Search properties with filters
    static async search(query: SearchQueryInput) {
        const { q, city, locality, type, listingType, bhk, minPrice, maxPrice, furnishing, page, limit } = query;
        const skip = (page - 1) * limit;

        // Build where clause dynamically
        const where: any = {
            status: 'ACTIVE',
        };

        // Text search on title, description, locality
        if (q) {
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { locality: { contains: q, mode: 'insensitive' } },
                { city: { contains: q, mode: 'insensitive' } },
            ];
        }

        if (city) {
            where.city = { equals: city, mode: 'insensitive' };
        }

        if (locality) {
            where.locality = { contains: locality, mode: 'insensitive' };
        }

        if (type) {
            where.type = type;
        }

        if (listingType) {
            where.listingType = listingType;
        }

        if (bhk !== undefined) {
            where.bhk = bhk;
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {};
            if (minPrice !== undefined) {
                where.price.gte = minPrice;
            }
            if (maxPrice !== undefined) {
                where.price.lte = maxPrice;
            }
        }

        if (furnishing) {
            where.furnishing = furnishing;
        }

        const [properties, total] = await Promise.all([
            prisma.property.findMany({
                where: where as any,
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            isVerified: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.property.count({ where: where as any }),
        ]);

        return {
            properties,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            filters: {
                q,
                city,
                locality,
                type,
                listingType,
                bhk,
                minPrice,
                maxPrice,
                furnishing,
            },
        };
    }

    // Get cities with property count
    static async getCitiesWithCount() {
        const cities = await prisma.property.groupBy({
            by: ['city'],
            where: { status: 'ACTIVE' },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
        });

        return cities.map((c: any) => ({
            city: c.city,
            count: c._count.id,
        }));
    }
}
