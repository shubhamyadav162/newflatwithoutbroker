const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Enums from Prisma Schema (manually defined for JS)
const ListingType = {
    RENT: 'RENT',
    SELL: 'SELL'
};

const PropertyType = {
    APARTMENT: 'APARTMENT',
    VILLA: 'VILLA',
    PG: 'PG',
    SHOP: 'SHOP',
    OFFICE: 'OFFICE',
    PLOT: 'PLOT'
};

const Furnishing = {
    FULLY: 'FULLY',
    SEMI: 'SEMI',
    NONE: 'NONE'
};

const TenantType = {
    FAMILY: 'FAMILY',
    BACHELOR: 'BACHELOR',
    COMPANY: 'COMPANY',
    ANY: 'ANY'
};

const Availability = {
    IMMEDIATE: 'IMMEDIATE',
    WITHIN15: 'WITHIN15',
    WITHIN30: 'WITHIN30'
};

const cities = [
    {
        name: 'Mumbai',
        state: 'Maharashtra',
        localities: ['Bandra West', 'Andheri East', 'Powai', 'Juhu', 'Worli', 'Malad West', 'Goregaon East', 'Lower Parel', 'Chembur', 'Thane West'],
        coords: { lat: 19.0760, lng: 72.8777 }
    },
    {
        name: 'Delhi',
        state: 'Delhi',
        localities: ['Saket', 'Vasant Kunj', 'Dwarka Sector 10', 'Hauz Khas', 'Greater Kailash', 'Lajpat Nagar', 'Rohini', 'Mayur Vihar', 'Vasant Vihar', 'Karol Bagh'],
        coords: { lat: 28.6139, lng: 77.2090 }
    },
    {
        name: 'Bangalore',
        state: 'Karnataka',
        localities: ['Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'Jayanagar', 'Electronic City', 'Marathahalli', 'Hebbal', 'Malleshwaram', 'BTM Layout'],
        coords: { lat: 12.9716, lng: 77.5946 }
    },
    {
        name: 'Pune',
        state: 'Maharashtra',
        localities: ['Baner', 'Wakad', 'Viman Nagar', 'Koregaon Park', 'Kalyani Nagar', 'Hadapsar', 'Kothrud', 'Magarpatta', 'Hinjewadi', 'Aundh'],
        coords: { lat: 18.5204, lng: 73.8567 }
    },
    {
        name: 'Hyderabad',
        state: 'Telangana',
        localities: ['Gachibowli', 'Hitech City', 'Jubilee Hills', 'Banjara Hills', 'Madhapur', 'Kukatpally', 'Secunderabad', 'Manikonda', 'Kondapur', 'Begumpet'],
        coords: { lat: 17.3850, lng: 78.4867 }
    },
    {
        name: 'Chennai',
        state: 'Tamil Nadu',
        localities: ['Adyar', 'Anna Nagar', 'T Nagar', 'Velachery', 'OMR', 'Besant Nagar', 'Thiruvanmiyur', 'Mylapore', 'Nungambakkam', 'Porur'],
        coords: { lat: 13.0827, lng: 80.2707 }
    },
    {
        name: 'Noida',
        state: 'Uttar Pradesh',
        localities: ['Sector 62', 'Sector 18', 'Sector 150', 'Sector 44', 'Sector 75', 'Sector 137', 'Sector 76', 'Sector 50', 'Sector 128', 'Greater Noida'],
        coords: { lat: 28.5355, lng: 77.3910 }
    },
    {
        name: 'Gurgaon',
        state: 'Haryana',
        localities: ['Cyber City', 'Sector 56', 'DLF Phase 1', 'Sohna Road', 'Golf Course Road', 'Sector 45', 'DLF Phase 3', 'Sector 82', 'MG Road', 'Sushant Lok'],
        coords: { lat: 28.4595, lng: 77.0266 }
    }
];

const propertyImages = [
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
    'https://images.unsplash.com/photo-1502005229766-528357c34e6d?w=1200&q=80',
    'https://images.unsplash.com/photo-1484154218962-a1c00207bf9a?w=1200&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
    'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=1200&q=80',
    'https://images.unsplash.com/photo-1494526585095-c41746248156?w=1200&q=80',
    'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?w=1200&q=80'
];

const amenitiesList = [
    'Parking', 'Power Backup', 'Lift', 'Gym', 'Swimming Pool',
    'Club House', 'Security', 'Park', 'Water Supply', 'Gas Pipeline'
];

const dummyUsers = [
    { name: 'Rahul Sharma', email: 'rahul.s@example.com', phone: '9876543210', role: 'OWNER' },
    { name: 'Priya Patel', email: 'priya.p@example.com', phone: '9898989898', role: 'OWNER' },
    { name: 'Amit Verma', email: 'amit.v@example.com', phone: '9988776655', role: 'OWNER' },
    { name: 'Sneha Gupta', email: 'sneha.g@example.com', phone: '9123456789', role: 'OWNER' },
    { name: 'Vikram Singh', email: 'vikram.s@example.com', phone: '9567812340', role: 'OWNER' }
];

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Create Owners
    const owners = [];
    for (const u of dummyUsers) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                name: u.name,
                email: u.email,
                phone: u.phone,
                role: 'OWNER',
                isVerified: true
            }
        });
        owners.push(user);
        console.log(`Created/Found user: ${user.name}`);
    }

    // 2. Create Properties for each city
    for (const city of cities) {
        console.log(`Creating properties for ${city.name}...`);

        for (let i = 0; i < 10; i++) {
            const locality = city.localities[i % city.localities.length];
            const owner = owners[Math.floor(Math.random() * owners.length)];

            const bhk = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3 BHK
            const listingType = Math.random() > 0.5 ? ListingType.RENT : ListingType.SELL;
            const type = Math.random() > 0.8 ? PropertyType.VILLA : PropertyType.APARTMENT;

            // Calculate realistic price
            let price;
            if (listingType === ListingType.RENT) {
                price = (bhk * 10000) + (Math.random() * 15000) + (type === PropertyType.VILLA ? 20000 : 0);
            } else {
                price = (bhk * 2500000) + (Math.random() * 5000000) + (type === PropertyType.VILLA ? 5000000 : 0);
            }
            price = Math.round(price / 1000) * 1000; // Round to nearest 1000

            // Select 3 random images
            const shuffledImages = propertyImages.sort(() => 0.5 - Math.random());
            const selectedImages = shuffledImages.slice(0, 3);

            await prisma.property.create({
                data: {
                    title: `${bhk} BHK ${type === PropertyType.APARTMENT ? 'Apartment' : 'Villa'} in ${locality}`,
                    description: `A spacious and well-ventilated ${bhk} BHK ${type === PropertyType.APARTMENT ? 'flat' : 'house'} located in prime area of ${locality}, ${city.name}. Close to schools, markets, and hospitals. Ideal for families and working professionals. Immediate possession available.`,
                    type: type,
                    listingType: listingType,
                    status: 'ACTIVE',
                    price: price,
                    deposit: listingType === ListingType.RENT ? price * 3 : 0,
                    maintenance: listingType === ListingType.RENT ? 1500 + (bhk * 500) : 0,
                    bhk: bhk,
                    bathrooms: Math.max(1, bhk - 1 + Math.floor(Math.random() * 2)),
                    builtUpArea: 600 + (bhk * 400),
                    furnishing: Math.random() > 0.6 ? Furnishing.FULLY : (Math.random() > 0.3 ? Furnishing.SEMI : Furnishing.NONE),
                    tenantType: TenantType.ANY,
                    availability: Availability.IMMEDIATE,
                    locality: locality,
                    city: city.name,
                    state: city.state,
                    address: `${Math.floor(Math.random() * 100) + 1}, ${locality}, ${city.name}`,
                    images: selectedImages,
                    amenities: amenitiesList.sort(() => 0.5 - Math.random()).slice(0, 6),
                    contactPhone: owner.phone,
                    views: Math.floor(Math.random() * 500),
                    ownerId: owner.id,
                    latitude: city.coords.lat + (Math.random() * 0.05 - 0.025),
                    longitude: city.coords.lng + (Math.random() * 0.05 - 0.025)
                }
            });
        }
    }

    console.log('✅ Seeding completed! Added 80 properties.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
