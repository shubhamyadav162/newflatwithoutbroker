// Mock Data Service - For running without database
// This allows the backend to run and serve data immediately

export interface MockProperty {
    id: string;
    title: string;
    description: string;
    type: string;
    listingType: string;
    status: string;
    price: number;
    deposit: number | null;
    bhk: number;
    bathrooms: number;
    builtUpArea: number;
    furnishing: string;
    tenantType: string;
    availability: string;
    locality: string;
    city: string;
    state: string;
    images: string[];
    amenities: string[];
    views: number;
    createdAt: Date;
    updatedAt: Date;
    ownerId: string;
    owner: {
        id: string;
        name: string;
        phone: string;
        isVerified: boolean;
    };
}

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata', 'Ahmedabad'];

const localities: Record<string, string[]> = {
    'Mumbai': ['Andheri', 'Bandra', 'Juhu', 'Powai', 'Worli', 'Lower Parel', 'Malad', 'Goregaon'],
    'Delhi': ['Dwarka', 'Rohini', 'Saket', 'Vasant Kunj', 'Hauz Khas', 'Greater Kailash', 'Lajpat Nagar'],
    'Bangalore': ['Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'Jayanagar', 'Electronic City', 'Marathahalli'],
    'Pune': ['Koregaon Park', 'Viman Nagar', 'Hinjewadi', 'Baner', 'Kharadi', 'Wakad', 'Hadapsar'],
    'Hyderabad': ['Gachibowli', 'Madhapur', 'Hitech City', 'Jubilee Hills', 'Banjara Hills', 'Kondapur'],
    'Chennai': ['Adyar', 'Anna Nagar', 'T. Nagar', 'Velachery', 'OMR', 'Nungambakkam'],
    'Kolkata': ['Salt Lake', 'Park Street', 'Ballygunge', 'New Town', 'Alipore', 'Gariahat'],
    'Ahmedabad': ['Navrangpura', 'Satellite', 'Prahlad Nagar', 'Bodakdev', 'SG Highway', 'Vastrapur'],
};

const ownerNames = ['Rahul Sharma', 'Priya Mehta', 'Amit Kumar', 'Sneha Rao', 'Vikram Patel', 'Anita Gupta', 'Raj Thakur', 'Meera Nair', 'Suresh Bansal', 'Kavita Desai'];

const amenities = ['AC', 'Parking', 'Gym', 'Swimming Pool', 'Power Backup', 'Security', 'Lift', 'Garden', 'Club House', 'Kids Play Area', 'WiFi', 'Gas Pipeline'];

const imageUrls = [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop',
];

function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomElements<T>(arr: T[], count: number): T[] {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Generate mock properties
function generateMockProperties(): MockProperty[] {
    const properties: MockProperty[] = [];

    for (let i = 0; i < 50; i++) {
        const city = getRandomElement(cities);
        const locality = getRandomElement(localities[city]);
        const bhk = Math.floor(Math.random() * 4) + 1;
        const listingType = getRandomElement(['RENT', 'SELL']);
        const furnishing = getRandomElement(['FULLY', 'SEMI', 'NONE']);
        const propertyType = getRandomElement(['APARTMENT', 'VILLA', 'PG']);
        const ownerName = getRandomElement(ownerNames);

        const basePrice = listingType === 'RENT'
            ? bhk * 8000 + Math.random() * 40000
            : bhk * 2000000 + Math.random() * 10000000;

        properties.push({
            id: `prop-${i + 1}`,
            title: `${bhk} BHK ${propertyType === 'APARTMENT' ? 'Apartment' : propertyType} in ${locality}, ${city}`,
            description: `Beautiful ${bhk} BHK property in the heart of ${locality}. Well-maintained with modern amenities.`,
            type: propertyType,
            listingType,
            status: 'ACTIVE',
            price: Math.round(basePrice),
            deposit: listingType === 'RENT' ? Math.round(basePrice * 2) : null,
            bhk,
            bathrooms: Math.min(bhk, 3),
            builtUpArea: bhk * 400 + Math.floor(Math.random() * 400),
            furnishing,
            tenantType: getRandomElement(['FAMILY', 'BACHELOR', 'COMPANY', 'ANY']),
            availability: getRandomElement(['IMMEDIATE', 'WITHIN15', 'WITHIN30']),
            locality,
            city,
            state: 'Maharashtra',
            images: getRandomElements(imageUrls, 4),
            amenities: getRandomElements(amenities, Math.floor(Math.random() * 6) + 3),
            views: Math.floor(Math.random() * 500),
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
            ownerId: `owner-${i % 10}`,
            owner: {
                id: `owner-${i % 10}`,
                name: ownerName,
                phone: `+91${9000000000 + (i % 10)}`,
                isVerified: Math.random() > 0.3,
            },
        });
    }

    return properties;
}

// Singleton mock data
let mockProperties: MockProperty[] | null = null;

export function getMockProperties(): MockProperty[] {
    if (!mockProperties) {
        mockProperties = generateMockProperties();
    }
    return mockProperties;
}

export function getMockPropertyById(id: string): MockProperty | undefined {
    return getMockProperties().find(p => p.id === id);
}

export function searchMockProperties(filters: {
    q?: string;
    city?: string;
    type?: string;
    listingType?: string;
    bhk?: number;
    minPrice?: number;
    maxPrice?: number;
    furnishing?: string;
    page?: number;
    limit?: number;
}) {
    let results = getMockProperties();

    if (filters.q) {
        const q = filters.q.toLowerCase();
        results = results.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.locality.toLowerCase().includes(q) ||
            p.city.toLowerCase().includes(q)
        );
    }

    if (filters.city) {
        results = results.filter(p => p.city.toLowerCase() === filters.city!.toLowerCase());
    }

    if (filters.type) {
        results = results.filter(p => p.type === filters.type);
    }

    if (filters.listingType) {
        results = results.filter(p => p.listingType === filters.listingType);
    }

    if (filters.bhk !== undefined) {
        results = results.filter(p => p.bhk === filters.bhk);
    }

    if (filters.minPrice !== undefined) {
        results = results.filter(p => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
        results = results.filter(p => p.price <= filters.maxPrice!);
    }

    if (filters.furnishing) {
        results = results.filter(p => p.furnishing === filters.furnishing);
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const total = results.length;
    const skip = (page - 1) * limit;

    return {
        properties: results.slice(skip, skip + limit),
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export function getMockCitiesWithCount() {
    const properties = getMockProperties();
    const cityCount: Record<string, number> = {};

    properties.forEach(p => {
        cityCount[p.city] = (cityCount[p.city] || 0) + 1;
    });

    return Object.entries(cityCount)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count);
}
