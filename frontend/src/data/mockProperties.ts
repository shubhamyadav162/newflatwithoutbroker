export interface Property {
  id: string;
  title: string;
  type: 'rent' | 'buy' | 'commercial' | 'pg';
  bhk: number;
  price: number;
  deposit?: number;
  area: number;
  furnishing: 'full' | 'semi' | 'none';
  tenantType: 'family' | 'bachelor' | 'company' | 'any';
  location: string;
  city: string;
  locality: string;
  bathrooms: number;
  amenities: string[];
  images: string[];
  ownerName: string;
  ownerPhone: string;
  isVerified: boolean;
  postedDate: string;
  description: string;
  availability: 'immediate' | 'within15' | 'within30';
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

const ownerNames = ['Rahul S.', 'Priya M.', 'Amit K.', 'Sneha R.', 'Vikram P.', 'Anita G.', 'Raj T.', 'Meera N.', 'Suresh B.', 'Kavita D.'];

const amenities = ['AC', 'Parking', 'Gym', 'Swimming Pool', 'Power Backup', 'Security', 'Lift', 'Garden', 'Club House', 'Kids Play Area', 'WiFi', 'Gas Pipeline', 'Water Purifier', 'Intercom'];

const imageUrls = [
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomElements<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generatePhone(): string {
  return `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`;
}

function generateDescription(bhk: number, locality: string, furnishing: string): string {
  const descriptions = [
    `Beautiful ${bhk} BHK apartment in the heart of ${locality}. Well-maintained with modern amenities.`,
    `Spacious ${bhk} BHK flat with excellent ventilation and natural lighting. ${furnishing === 'full' ? 'Fully furnished with premium furniture.' : furnishing === 'semi' ? 'Semi-furnished with basic furniture.' : 'Unfurnished, ready for your personal touch.'}`,
    `Premium ${bhk} BHK property in a gated community. 24/7 security and well-connected to major areas.`,
    `Cozy ${bhk} BHK home perfect for families. Close to schools, hospitals, and shopping centers.`,
  ];
  return getRandomElement(descriptions);
}

export function generateMockProperties(count: number = 50): Property[] {
  const properties: Property[] = [];

  for (let i = 0; i < count; i++) {
    const city = getRandomElement(cities);
    const locality = getRandomElement(localities[city]);
    const bhk = Math.floor(Math.random() * 4) + 1;
    const type = getRandomElement(['rent', 'buy', 'commercial', 'pg'] as const);
    const furnishing = getRandomElement(['full', 'semi', 'none'] as const);
    const basePrice = type === 'rent' 
      ? (bhk * 8000 + Math.random() * 40000)
      : type === 'pg' 
        ? (5000 + Math.random() * 15000)
        : (bhk * 2000000 + Math.random() * 10000000);

    const property: Property = {
      id: `prop-${i + 1}`,
      title: `${bhk} BHK ${type === 'commercial' ? 'Office Space' : 'Apartment'} in ${locality}, ${city}`,
      type,
      bhk,
      price: Math.round(basePrice),
      deposit: type === 'rent' ? Math.round(basePrice * 2) : undefined,
      area: bhk * 400 + Math.floor(Math.random() * 400),
      furnishing,
      tenantType: getRandomElement(['family', 'bachelor', 'company', 'any'] as const),
      location: `${locality}, ${city}`,
      city,
      locality,
      bathrooms: Math.min(bhk, 3),
      amenities: getRandomElements(amenities, Math.floor(Math.random() * 6) + 3),
      images: getRandomElements(imageUrls, 4),
      ownerName: getRandomElement(ownerNames),
      ownerPhone: generatePhone(),
      isVerified: Math.random() > 0.3,
      postedDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      description: generateDescription(bhk, locality, furnishing),
      availability: getRandomElement(['immediate', 'within15', 'within30'] as const),
    };

    properties.push(property);
  }

  return properties;
}

export const mockProperties = generateMockProperties(50);
export const topCities = cities;
export const allLocalities = localities;
