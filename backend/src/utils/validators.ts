import { z } from 'zod';

// Auth Schemas
export const sendOtpSchema = z.object({
    phone: z.string().regex(/^\+91[0-9]{10}$/, 'Invalid Indian phone number (format: +91XXXXXXXXXX)'),
});

export const verifyOtpSchema = z.object({
    phone: z.string().regex(/^\+91[0-9]{10}$/, 'Invalid Indian phone number'),
    otp: z.string().length(4, 'OTP must be 4 digits'),
});

// Property Schemas
export const createPropertySchema = z.object({
    title: z.string().min(5).max(200),
    description: z.string().min(20).max(2000),
    type: z.enum(['APARTMENT', 'VILLA', 'PG', 'SHOP', 'OFFICE', 'PLOT']),
    listingType: z.enum(['RENT', 'SELL']),
    price: z.number().positive(),
    deposit: z.number().positive().optional(),
    maintenance: z.number().positive().optional(),
    bhk: z.number().int().min(0).max(10),
    bathrooms: z.number().int().min(1).max(10),
    builtUpArea: z.number().int().positive(),
    furnishing: z.enum(['FULLY', 'SEMI', 'NONE']),
    tenantType: z.enum(['FAMILY', 'BACHELOR', 'COMPANY', 'ANY']).optional(),
    availability: z.enum(['IMMEDIATE', 'WITHIN15', 'WITHIN30']).optional(),
    locality: z.string().min(2).max(100),
    city: z.string().min(2).max(50),
    state: z.string().min(2).max(50).optional(),
    pincode: z.string().length(6).optional(),
    address: z.string().max(200).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    images: z.array(z.string().url()).max(10).optional().default([]),
    amenities: z.array(z.string()).max(20).optional().default([]),
    contactPhone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number (10 digits starting with 6-9)'),
});

export const updatePropertySchema = createPropertySchema.partial();

// Search Schemas
export const searchQuerySchema = z.object({
    q: z.string().optional(),
    city: z.string().optional(),
    locality: z.string().optional(),
    type: z.enum(['APARTMENT', 'VILLA', 'PG', 'SHOP', 'OFFICE', 'PLOT']).optional(),
    listingType: z.enum(['RENT', 'SELL']).optional(),
    bhk: z.coerce.number().int().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    furnishing: z.enum(['FULLY', 'SEMI', 'NONE']).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
});

// Contact Schema
export const revealContactSchema = z.object({
    propertyId: z.string().uuid(),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type RevealContactInput = z.infer<typeof revealContactSchema>;
