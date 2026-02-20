import { prisma } from '../config/index.js';

export class ContactService {
    // Reveal owner contact and log access
    static async revealContact(viewerId: string, propertyId: string) {
        // Get property with owner
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        isVerified: true,
                    },
                },
            },
        });

        if (!property) {
            return null;
        }

        // Log the contact access
        await prisma.contactAccess.create({
            data: {
                viewerId,
                propertyId,
                ownerId: property.ownerId,
            },
        });

        return {
            ownerName: property.owner.name || 'Property Owner',
            // @ts-ignore - contactPhone exists after schema update
            ownerPhone: property.contactPhone || property.owner.phone,
            isVerified: property.owner.isVerified,
            propertyTitle: property.title,
        };
    }

    // Get contact history for a user
    static async getContactHistory(userId: string) {
        return prisma.contactAccess.findMany({
            where: { viewerId: userId },
            include: {
                property: {
                    select: {
                        id: true,
                        title: true,
                        city: true,
                        locality: true,
                    },
                },
                owner: {
                    select: {
                        name: true,
                        phone: true,
                    },
                },
            },
            orderBy: { timestamp: 'desc' },
            take: 50,
        });
    }
}
