import { PrismaClient, PropertyType, ListingType, Furnishing, TenantType, Availability } from '@prisma/client';

const prisma = new PrismaClient();

const CITY_DATA: Record<string, { localities: string[], prices: { rent: number, sell: number } }> = {
    'Mumbai': {
        localities: ['Bandra West', 'Andheri West', 'Juhu', 'Powai', 'Worli', 'Lower Parel', 'Malad West', 'Goregaon East', 'Borivali', 'Colaba'],
        prices: { rent: 45000, sell: 25000000 }
    },
    'Delhi': {
        localities: ['Dwarka', 'Rohini', 'Saket', 'Vasant Kunj', 'Hauz Khas', 'Greater Kailash', 'Lajpat Nagar', 'Mayur Vihar', 'Vasant Vihar', 'Defence Colony'],
        prices: { rent: 35000, sell: 20000000 }
    },
    'Bangalore': {
        localities: ['Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'Jayanagar', 'Electronic City', 'Marathahalli', 'Bellandur', 'Hebbal', 'Malleshwaram'],
        prices: { rent: 25000, sell: 12000000 }
    },
    'Pune': {
        localities: ['Koregaon Park', 'Viman Nagar', 'Hinjewadi', 'Baner', 'Kharadi', 'Wakad', 'Hadapsar', 'Kothrud', 'Magarpatta', 'Aundh'],
        prices: { rent: 20000, sell: 9000000 }
    },
    'Hyderabad': {
        localities: ['Gachibowli', 'Madhapur', 'Hitech City', 'Jubilee Hills', 'Banjara Hills', 'Kondapur', 'Manikonda', 'Kukatpally', 'Begumpet', 'Secunderabad'],
        prices: { rent: 22000, sell: 10000000 }
    },
    'Chennai': {
        localities: ['Adyar', 'Anna Nagar', 'T. Nagar', 'Velachery', 'OMR', 'Nungambakkam', 'Mylapore', 'Thiruvanmiyur', 'Porur', 'Tambaram'],
        prices: { rent: 20000, sell: 9500000 }
    },
    'Noida': {
        localities: ['Sector 62', 'Sector 137', 'Sector 18', 'Sector 44', 'Sector 150', 'Greater Noida West', 'Sector 75', 'Sector 78', 'Sector 50', 'Sector 93'],
        prices: { rent: 18000, sell: 8500000 }
    },
    'Gurgaon': {
        localities: ['Golf Course Road', 'Cyber City', 'Sohna Road', 'DLF Phase 1', 'DLF Phase 5', 'Sector 56', 'Sector 45', 'Manesar', 'MG Road', 'Sushant Lok'],
        prices: { rent: 30000, sell: 18000000 }
    }
};

const ownerNames = ['Shubham Yadav', 'Rahul Sharma', 'Priya Mehta', 'Amit Kumar', 'Sneha Rao', 'Vikram Patel', 'Anita Gupta', 'Raj Thakur', 'Meera Nair', 'Suresh Bansal', 'Kavita Desai', 'Arjun Singh', 'Zara Khan', 'Rohan Das', 'Ananya Roy'];

const amenitiesMaster = ['AC', 'Parking', 'Gym', 'Swimming Pool', 'Power Backup', 'Security', 'Lift', 'Garden', 'Club House', 'Kids Play Area', 'WiFi', 'Gas Pipeline', 'Water Purifier', 'Intercom', 'Servant Room', 'Modular Kitchen'];

const imageUrls = [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600596542815-60c37c6525fa?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop'
];

function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomElements<T>(arr: T[], count: number): T[] {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

const DESCRIPTIONS = {
    'RENT': [
        "Spacious and well-ventilated apartment available for rent. Located in a prime area with easy access to markets and schools.",
        "Beautifully designed flat with modern interiors. Perfect for families. 24/7 security and water supply.",
        "Premium property available immediately. Close to metro station and tech parks. Fully furnished with all amenities.",
        "Cozy apartment in a peaceful neighborhood. Ideal for bachelors or small families. Affordable rent with no brokerage.",
        "Luxury living at its best. High-rise apartment with stunning city views. Club house, gym, and swimming pool access included."
    ],
    'SELL': [
        "Ready to move in property in a sought-after location. Excellent appreciation potential. Clear title and paperwork.",
        "Luxurious home with state-of-the-art amenities. Gated community with 3 tier security. Perfect dream home.",
        "Spacious builder floor with high-end fittings. Close to international schools and hospitals. Urgent sale.",
        "Premium villa in a posh locality. Private garden and terrace. Quiet and green surroundings.",
        "Investment opportunity in a rapidly developing area. High rental yield expected. Modern construction quality."
    ]
};

async function main() {
    console.log('🌱 Starting realistic seed...');

    // Clear existing data
    await prisma.contactAccess.deleteMany();
    await prisma.property.deleteMany();
    await prisma.user.deleteMany();

    console.log('🗑️ Cleared existing data');

    // Create demo users
    const users = await Promise.all(
        ownerNames.map((name, i) =>
            prisma.user.create({
                data: {
                    phone: `+91${9000000000 + i}`,
                    name,
                    role: 'OWNER',
                    isVerified: name === 'Shubham Yadav' ? true : Math.random() > 0.4, // Higher verification rate
                    avatar: name === 'Shubham Yadav' ? '/shubham.png' : null,
                },
            })
        )
    );

    console.log(`👤 Created ${users.length} users`);

    const properties = [];
    const TOTAL_PROPERTIES = 240; // ~30 per city (8 cities)

    for (let i = 0; i < TOTAL_PROPERTIES; i++) {
        // Distribute evenly among cities
        const cityNames = Object.keys(CITY_DATA);
        const city = cityNames[i % cityNames.length];
        const cityInfo = CITY_DATA[city];
        const locality = getRandomElement(cityInfo.localities);

        const bhk = getRandomElement([1, 2, 3, 4]);
        const listingType = Math.random() > 0.4 ? 'RENT' : 'SELL';

        // Property Type Logic
        let propertyType: PropertyType = 'APARTMENT';
        if (Math.random() > 0.8) propertyType = 'VILLA';
        if (listingType === 'RENT' && Math.random() > 0.7) propertyType = 'PG';
        if (Math.random() > 0.95) propertyType = 'OFFICE';

        const furnishing = getRandomElement(['FULLY', 'SEMI', 'NONE'] as const);

        // Price Calculation with randomness and city factors
        let price = 0;
        if (listingType === 'RENT') {
            price = cityInfo.prices.rent * (bhk * 0.5) * (furnishing === 'FULLY' ? 1.3 : 1) * (Math.random() * 0.4 + 0.8);
            if (propertyType === 'PG') price = price * 0.4;
            if (propertyType === 'VILLA') price = price * 1.5;
        } else {
            price = cityInfo.prices.sell * (bhk * 0.6) * (Math.random() * 0.4 + 0.8);
            if (propertyType === 'VILLA') price = price * 1.8;
            if (propertyType === 'OFFICE') price = price * 1.2;
        }

        price = Math.round(price / 1000) * 1000; // Round to nearest 1000

        // Title Generation
        const typeStr = propertyType === 'PG' ? 'PG/Co-living' : propertyType === 'OFFICE' ? 'Office Space' : `${bhk} BHK ${propertyType === 'APARTMENT' ? 'Apartment' : 'Villa'}`;
        const title = `${typeStr} in ${locality}, ${city}`;

        // Description Generation
        const baseDesc = getRandomElement(DESCRIPTIONS[listingType]);
        const customDesc = `This ${typeStr.toLowerCase()} in ${locality} offers a comfortable lifestyle. ${baseDesc} The property is ${furnishing.toLowerCase().replace('none', 'un')} furnished and has ${Math.min(bhk, 3)} bathrooms.`;

        const property = await prisma.property.create({
            data: {
                title,
                description: customDesc,
                type: propertyType,
                listingType: listingType as ListingType,
                price,
                deposit: listingType === 'RENT' ? Math.round(price * (Math.random() * 3 + 2)) : null, // 2-5 months rent
                bhk: propertyType === 'PG' || propertyType === 'OFFICE' ? 0 : bhk,
                bathrooms: Math.min(bhk, 3),
                builtUpArea: bhk * 450 + Math.floor(Math.random() * 500),
                furnishing: furnishing as Furnishing,
                tenantType: getRandomElement(['FAMILY', 'BACHELOR', 'COMPANY', 'ANY'] as const) as TenantType,
                availability: getRandomElement(['IMMEDIATE', 'WITHIN15', 'WITHIN30'] as const) as Availability,
                locality,
                city,
                state: 'State', // Simplified
                images: getRandomElements(imageUrls, 4),
                amenities: getRandomElements(amenitiesMaster, Math.floor(Math.random() * 8) + 4),
                ownerId: getRandomElement(users).id,
                views: Math.floor(Math.random() * 1000) + 50,
                status: 'ACTIVE',
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)) // Random date last 30 days
            },
        });
        properties.push(property);
    }

    console.log(`🏠 Created ${properties.length} properties`);
    console.log('✅ Realistic Seed completed!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
