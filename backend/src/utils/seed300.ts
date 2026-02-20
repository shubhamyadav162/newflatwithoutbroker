import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Helper to generate a random number between min and max (inclusive)
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
// Helper to pick a random item from an array
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
// Helper to get multiple random items from an array
const randomItems = <T>(arr: T[], min: number, max: number): T[] => {
    const count = randomInt(min, max);
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const PROPERTY_TYPES = ['APARTMENT', 'VILLA', 'INDEPENDENT_HOUSE', 'BUILDER_FLOOR', 'PG', 'OFFICE', 'SHOP', 'COWORKING', 'PLOT', 'WAREHOUSE'];
const FURNISHING_TYPES = ['FULLY', 'SEMI', 'NONE'];
const TENANT_TYPES = ['FAMILY', 'BACHELOR', 'COMPANY', 'ANY'];
const AVAILABILITIES = ['IMMEDIATE', 'WITHIN15', 'WITHIN30', 'AFTER30'];
const AMENITIES = [
    'Lift', 'Security', 'Water Supply', 'Power Backup', 'Parking',
    'Swimming Pool', 'Gym', 'Clubhouse', 'Garden', 'Jogging Track',
    'CCTV', 'WiFi', 'Intercom', 'Gas Pipeline', 'AC', 'Fire Safety'
];

interface CityData {
    state: string;
    localities: Array<{ name: string; pincode: string }>;
}

const CITIES: Record<string, CityData> = {
    'Mumbai': {
        state: 'Maharashtra',
        localities: [
            { name: 'Andheri West', pincode: '400058' },
            { name: 'Bandra West', pincode: '400050' },
            { name: 'Borivali East', pincode: '400066' },
            { name: 'Goregaon East', pincode: '400063' },
            { name: 'Powai', pincode: '400076' },
            { name: 'Malad West', pincode: '400064' },
            { name: 'Juhu', pincode: '400049' },
            { name: 'Khar West', pincode: '400052' },
            { name: 'Santacruz East', pincode: '400055' },
            { name: 'Vile Parle East', pincode: '400057' }
        ]
    },
    'Delhi': {
        state: 'Delhi',
        localities: [
            { name: 'Dwarka Sector 12', pincode: '110075' },
            { name: 'Vasant Kunj', pincode: '110070' },
            { name: 'Saket', pincode: '110017' },
            { name: 'Hauz Khas', pincode: '110016' },
            { name: 'Lajpat Nagar', pincode: '110024' },
            { name: 'Rohini Sector 9', pincode: '110085' },
            { name: 'Janakpuri', pincode: '110058' },
            { name: 'Karol Bagh', pincode: '110005' },
            { name: 'South Extension', pincode: '110049' },
            { name: 'Green Park', pincode: '110016' }
        ]
    },
    'Bangalore': {
        state: 'Karnataka',
        localities: [
            { name: 'Whitefield', pincode: '560066' },
            { name: 'Koramangala', pincode: '560034' },
            { name: 'HSR Layout', pincode: '560102' },
            { name: 'Indiranagar', pincode: '560038' },
            { name: 'BTM Layout', pincode: '560068' },
            { name: 'Marathahalli', pincode: '560037' },
            { name: 'Electronic City', pincode: '560100' },
            { name: 'Jayanagar', pincode: '560041' },
            { name: 'JP Nagar', pincode: '560078' },
            { name: 'Bellandur', pincode: '560103' }
        ]
    },
    'Pune': {
        state: 'Maharashtra',
        localities: [
            { name: 'Hinjewadi', pincode: '411057' },
            { name: 'Magarpatta City', pincode: '411028' },
            { name: 'Kharadi', pincode: '411014' },
            { name: 'Viman Nagar', pincode: '411014' },
            { name: 'Kothrud', pincode: '411038' },
            { name: 'Wakad', pincode: '411057' },
            { name: 'Baner', pincode: '411045' },
            { name: 'Aundh', pincode: '411007' },
            { name: 'Hadapsar', pincode: '411028' },
            { name: 'Kalyani Nagar', pincode: '411006' }
        ]
    },
    'Hyderabad': {
        state: 'Telangana',
        localities: [
            { name: 'Gachibowli', pincode: '500032' },
            { name: 'Banjara Hills', pincode: '500034' },
            { name: 'Jubilee Hills', pincode: '500033' },
            { name: 'HITEC City', pincode: '500081' },
            { name: 'Kondapur', pincode: '500084' },
            { name: 'Madhapur', pincode: '500081' },
            { name: 'Kukatpally', pincode: '500072' },
            { name: 'Begumpet', pincode: '500016' },
            { name: 'Secunderabad', pincode: '500003' },
            { name: 'Miyapur', pincode: '500049' }
        ]
    },
    'Chennai': {
        state: 'Tamil Nadu',
        localities: [
            { name: 'Adyar', pincode: '600020' },
            { name: 'Besant Nagar', pincode: '600090' },
            { name: 'Anna Nagar', pincode: '600040' },
            { name: 'Velachery', pincode: '600042' },
            { name: 'T Nagar', pincode: '600017' },
            { name: 'Mylapore', pincode: '600004' },
            { name: 'OMR', pincode: '600097' },
            { name: 'Thoraipakkam', pincode: '600097' },
            { name: 'Perungudi', pincode: '600096' },
            { name: 'Guindy', pincode: '600032' }
        ]
    },
    'Kolkata': {
        state: 'West Bengal',
        localities: [
            { name: 'Salt Lake City', pincode: '700091' },
            { name: 'New Town', pincode: '700156' },
            { name: 'Ballygunge', pincode: '700019' },
            { name: 'Alipore', pincode: '700027' },
            { name: 'Gariahat', pincode: '700029' },
            { name: 'Jodhpur Park', pincode: '700068' },
            { name: 'Park Street', pincode: '700016' },
            { name: 'Rajarhat', pincode: '700135' },
            { name: 'Tollygunge', pincode: '700033' },
            { name: 'Dum Dum', pincode: '700028' }
        ]
    },
    'Ahmedabad': {
        state: 'Gujarat',
        localities: [
            { name: 'SG Highway', pincode: '380060' },
            { name: 'Bopal', pincode: '380058' },
            { name: 'Satellite', pincode: '380015' },
            { name: 'Vastrapur', pincode: '380015' },
            { name: 'Navrangpura', pincode: '380009' },
            { name: 'Prahlad Nagar', pincode: '380015' },
            { name: 'Thaltej', pincode: '380054' },
            { name: 'Maninagar', pincode: '380008' },
            { name: 'Gota', pincode: '382481' },
            { name: 'Chandkheda', pincode: '382424' }
        ]
    }
};

const PROPERTY_IMAGES = [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2000&auto=format&fit=crop', // apartment modern
    'https://images.unsplash.com/photo-1502672260266-1c1de2d9d000?q=80&w=2000&auto=format&fit=crop', // bedroom
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2000&auto=format&fit=crop', // luxury apartment exterior
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=2000&auto=format&fit=crop', // kitchen
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000&auto=format&fit=crop', // modern home
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2000&auto=format&fit=crop', // large living room
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop', // beautiful house exterior
    'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop', // office space
    'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2000&auto=format&fit=crop', // living room
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2000&auto=format&fit=crop', // dining room
    'https://images.unsplash.com/photo-1598928506311-c55dd1b31bb1?q=80&w=2000&auto=format&fit=crop', // bedroom airy
    'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2000&auto=format&fit=crop', // bright room
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000&auto=format&fit=crop', // house exterior evening
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2000&auto=format&fit=crop', // cozy apartment
    'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=2000&auto=format&fit=crop', // traditional home
    'https://images.unsplash.com/photo-1628191011867-b7156942adbc?q=80&w=2000&auto=format&fit=crop', // small apartment
    'https://images.unsplash.com/photo-1549517045-bc93de0ce7f5?q=80&w=2000&auto=format&fit=crop', // sunny living room
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2000&auto=format&fit=crop'  // room
];

const ADJECTIVES = ['Spacious', 'Luxurious', 'Cozy', 'Modern', 'Premium', 'Beautiful', 'Stunning', 'Affordable', 'Newly Renovated', 'Well-ventilated', 'Elegant', 'Furnished', 'Semi-furnished'];
const NOUNS = ['Apartment', 'Flat', 'Villa', 'Home', 'Studio', 'Penthouse', 'Bungalow', 'Property'];
const FEATURES = ['with Sea View', 'near Metro Station', 'in Gated Society', 'with Modern Amenities', 'in Prime Location', 'with Garden', 'with Pool View', 'facing Park'];

const INDIAN_FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Ananya', 'Diya', 'Advika', 'Jiya', 'Sana', 'Aadhya', 'Kavya', 'Fatima', 'Ayesha', 'Rahul', 'Amit', 'Neha', 'Pooja', 'Rohan', 'Sneha', 'Vikram', 'Priya', 'Karan'];
const INDIAN_LAST_NAMES = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Das', 'Gupta', 'Verma', 'Reddy', 'Mehta', 'Jain', 'Shah', 'Nair', 'Menon', 'Rao', 'Yadav', 'Khan', 'Choudhury', 'Iyer', 'Bose', 'Chatterjee'];

function generateMockUser() {
    const firstName = randomItem(INDIAN_FIRST_NAMES);
    const lastName = randomItem(INDIAN_LAST_NAMES);
    return {
        id: uuidv4(),
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 99)}@example.com`,
        phone: `9${randomInt(100000000, 999999999)}`,
        role: 'OWNER' as const,
        isVerified: true,
        credits: randomInt(10, 500)
    };
}

function generateMockProperty(ownerId: string, ownerPhone: string) {
    const city = randomItem(Object.keys(CITIES));
    const cityData = CITIES[city];
    const localityObj = randomItem(cityData.localities);

    const isCommercial = Math.random() < 0.15;
    let type = isCommercial ? randomItem(['OFFICE', 'SHOP', 'COWORKING', 'WAREHOUSE']) : randomItem(['APARTMENT', 'VILLA', 'INDEPENDENT_HOUSE', 'BUILDER_FLOOR', 'PG']);
    let listingType = randomItem(['RENT', 'SELL']);

    const adj = randomItem(ADJECTIVES);
    const noun = isCommercial ? type : randomItem(NOUNS);
    const feat = randomItem(FEATURES);

    let bhk = isCommercial ? 0 : randomInt(1, 5);
    if (type === 'PG') bhk = 1;
    const bathrooms = isCommercial ? randomInt(1, 4) : Math.min(bhk, randomInt(1, 4));

    const title = `${adj} ${bhk > 0 ? bhk + 'BHK ' : ''}${noun} ${feat} in ${localityObj.name}`;

    let price;
    if (listingType === 'SELL') {
        price = randomInt(2000000, 50000000); // 20 Lakhs to 5 Cr
    } else {
        price = randomInt(8000, 150000); // 8k to 1.5 Lakhs rent
    }

    // Nearest hundreds
    price = Math.floor(price / 100) * 100;

    const builtUpArea = randomInt(400, 4000);
    const images = randomItems(PROPERTY_IMAGES, 2, 5);

    const deposit = listingType === 'RENT' ? price * randomInt(2, 6) : null;
    const maintenance = randomInt(500, 10000);

    return {
        id: uuidv4(),
        title,
        description: `This is a highly desirable property located in the heart of ${localityObj.name}, ${city}. It comes with all the necessary amenities and offers a comfortable living/working space. The design is contemporary and ensures plenty of natural light and ventilation. Close to essential services like schools, hospitals, and markets.`,
        type,
        listingType,
        status: 'ACTIVE',
        price,
        deposit,
        maintenance,
        bhk,
        bathrooms,
        builtUpArea,
        furnishing: randomItem(FURNISHING_TYPES),
        tenantType: randomItem(TENANT_TYPES),
        availability: randomItem(AVAILABILITIES),
        locality: localityObj.name,
        city,
        state: cityData.state,
        pincode: localityObj.pincode,
        images,
        amenities: randomItems(AMENITIES, 4, 12),
        contactPhone: ownerPhone,
        views: randomInt(10, 2000),
        isDemo: true, // Identify mock data
        ownerId,
        createdAt: new Date(Date.now() - randomInt(1, 90) * 24 * 60 * 60 * 1000) // Random date in last 90 days
    };
}

async function main() {
    console.log('🔄 Starting Data Seeding Process...');

    const NUM_OWNERS = 30; // Creates 30 distinct owners
    const PROPERTIES_PER_OWNER = 10; // Total 300 properties

    let totalInserted = 0;

    // We process owners one by one to avoid massive memory usage or transaction timeouts
    for (let i = 0; i < NUM_OWNERS; i++) {
        const user = generateMockUser();

        // Ensure user exists
        await prisma.user.upsert({
            where: { id: user.id },
            update: {},
            create: user,
        });

        const properties = Array.from({ length: PROPERTIES_PER_OWNER }).map(() =>
            generateMockProperty(user.id, user.phone)
        );

        const result = await prisma.property.createMany({
            data: properties as any,
            skipDuplicates: true
        });

        totalInserted += result.count;
        console.log(`✅ Progress: Inserted owner ${i + 1}/${NUM_OWNERS} and ${result.count} properties. Total: ${totalInserted}`);
    }

    console.log(`🎉 Seeding complete! Successfully added ${totalInserted} properties.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
