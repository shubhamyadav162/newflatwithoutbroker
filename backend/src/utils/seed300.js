"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var uuid_1 = require("uuid");
var prisma = new client_1.PrismaClient();
// Helper to generate a random number between min and max (inclusive)
var randomInt = function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; };
// Helper to pick a random item from an array
var randomItem = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
// Helper to get multiple random items from an array
var randomItems = function (arr, min, max) {
    var count = randomInt(min, max);
    var shuffled = __spreadArray([], arr, true).sort(function () { return 0.5 - Math.random(); });
    return shuffled.slice(0, count);
};
var PROPERTY_TYPES = ['APARTMENT', 'VILLA', 'INDEPENDENT_HOUSE', 'BUILDER_FLOOR', 'PG', 'OFFICE', 'SHOP', 'COWORKING', 'PLOT', 'WAREHOUSE'];
var FURNISHING_TYPES = ['FULLY', 'SEMI', 'NONE'];
var TENANT_TYPES = ['FAMILY', 'BACHELOR', 'COMPANY', 'ANY'];
var AVAILABILITIES = ['IMMEDIATE', 'WITHIN15', 'WITHIN30', 'AFTER30'];
var AMENITIES = [
    'Lift', 'Security', 'Water Supply', 'Power Backup', 'Parking',
    'Swimming Pool', 'Gym', 'Clubhouse', 'Garden', 'Jogging Track',
    'CCTV', 'WiFi', 'Intercom', 'Gas Pipeline', 'AC', 'Fire Safety'
];
var CITIES = {
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
var PROPERTY_IMAGES = [
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
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2000&auto=format&fit=crop' // room
];
var ADJECTIVES = ['Spacious', 'Luxurious', 'Cozy', 'Modern', 'Premium', 'Beautiful', 'Stunning', 'Affordable', 'Newly Renovated', 'Well-ventilated', 'Elegant', 'Furnished', 'Semi-furnished'];
var NOUNS = ['Apartment', 'Flat', 'Villa', 'Home', 'Studio', 'Penthouse', 'Bungalow', 'Property'];
var FEATURES = ['with Sea View', 'near Metro Station', 'in Gated Society', 'with Modern Amenities', 'in Prime Location', 'with Garden', 'with Pool View', 'facing Park'];
var INDIAN_FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Ananya', 'Diya', 'Advika', 'Jiya', 'Sana', 'Aadhya', 'Kavya', 'Fatima', 'Ayesha', 'Rahul', 'Amit', 'Neha', 'Pooja', 'Rohan', 'Sneha', 'Vikram', 'Priya', 'Karan'];
var INDIAN_LAST_NAMES = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Das', 'Gupta', 'Verma', 'Reddy', 'Mehta', 'Jain', 'Shah', 'Nair', 'Menon', 'Rao', 'Yadav', 'Khan', 'Choudhury', 'Iyer', 'Bose', 'Chatterjee'];
function generateMockUser() {
    var firstName = randomItem(INDIAN_FIRST_NAMES);
    var lastName = randomItem(INDIAN_LAST_NAMES);
    return {
        id: (0, uuid_1.v4)(),
        name: "".concat(firstName, " ").concat(lastName),
        email: "".concat(firstName.toLowerCase(), ".").concat(lastName.toLowerCase()).concat(randomInt(1, 99), "@example.com"),
        phone: "9".concat(randomInt(100000000, 999999999)),
        role: 'OWNER',
        isVerified: true,
        credits: randomInt(10, 500)
    };
}
function generateMockProperty(ownerId, ownerPhone) {
    var city = randomItem(Object.keys(CITIES));
    var cityData = CITIES[city];
    var localityObj = randomItem(cityData.localities);
    var isCommercial = Math.random() < 0.15;
    var type = isCommercial ? randomItem(['OFFICE', 'SHOP', 'COWORKING', 'WAREHOUSE']) : randomItem(['APARTMENT', 'VILLA', 'INDEPENDENT_HOUSE', 'BUILDER_FLOOR', 'PG']);
    var listingType = randomItem(['RENT', 'SELL']);
    var adj = randomItem(ADJECTIVES);
    var noun = isCommercial ? type : randomItem(NOUNS);
    var feat = randomItem(FEATURES);
    var bhk = isCommercial ? 0 : randomInt(1, 5);
    if (type === 'PG')
        bhk = 1;
    var bathrooms = isCommercial ? randomInt(1, 4) : Math.min(bhk, randomInt(1, 4));
    var title = "".concat(adj, " ").concat(bhk > 0 ? bhk + 'BHK ' : '').concat(noun, " ").concat(feat, " in ").concat(localityObj.name);
    var price;
    if (listingType === 'SELL') {
        price = randomInt(2000000, 50000000); // 20 Lakhs to 5 Cr
    }
    else {
        price = randomInt(8000, 150000); // 8k to 1.5 Lakhs rent
    }
    // Nearest hundreds
    price = Math.floor(price / 100) * 100;
    var builtUpArea = randomInt(400, 4000);
    var images = randomItems(PROPERTY_IMAGES, 2, 5);
    var deposit = listingType === 'RENT' ? price * randomInt(2, 6) : null;
    var maintenance = randomInt(500, 10000);
    return {
        id: (0, uuid_1.v4)(),
        title: title,
        description: "This is a highly desirable property located in the heart of ".concat(localityObj.name, ", ").concat(city, ". It comes with all the necessary amenities and offers a comfortable living/working space. The design is contemporary and ensures plenty of natural light and ventilation. Close to essential services like schools, hospitals, and markets."),
        type: type,
        listingType: listingType,
        status: 'ACTIVE',
        price: price,
        deposit: deposit,
        maintenance: maintenance,
        bhk: bhk,
        bathrooms: bathrooms,
        builtUpArea: builtUpArea,
        furnishing: randomItem(FURNISHING_TYPES),
        tenantType: randomItem(TENANT_TYPES),
        availability: randomItem(AVAILABILITIES),
        locality: localityObj.name,
        city: city,
        state: cityData.state,
        pincode: localityObj.pincode,
        images: images,
        amenities: randomItems(AMENITIES, 4, 12),
        contactPhone: ownerPhone,
        views: randomInt(10, 2000),
        isDemo: true, // Identify mock data
        ownerId: ownerId,
        createdAt: new Date(Date.now() - randomInt(1, 90) * 24 * 60 * 60 * 1000) // Random date in last 90 days
    };
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var NUM_OWNERS, PROPERTIES_PER_OWNER, totalInserted, _loop_1, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🔄 Starting Data Seeding Process...');
                    NUM_OWNERS = 30;
                    PROPERTIES_PER_OWNER = 10;
                    totalInserted = 0;
                    _loop_1 = function (i) {
                        var user, properties, result;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    user = generateMockUser();
                                    // Ensure user exists
                                    return [4 /*yield*/, prisma.user.upsert({
                                            where: { id: user.id },
                                            update: {},
                                            create: user,
                                        })];
                                case 1:
                                    // Ensure user exists
                                    _b.sent();
                                    properties = Array.from({ length: PROPERTIES_PER_OWNER }).map(function () {
                                        return generateMockProperty(user.id, user.phone);
                                    });
                                    return [4 /*yield*/, prisma.property.createMany({
                                            data: properties,
                                            skipDuplicates: true
                                        })];
                                case 2:
                                    result = _b.sent();
                                    totalInserted += result.count;
                                    console.log("\u2705 Progress: Inserted owner ".concat(i + 1, "/").concat(NUM_OWNERS, " and ").concat(result.count, " properties. Total: ").concat(totalInserted));
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < NUM_OWNERS)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(i)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log("\uD83C\uDF89 Seeding complete! Successfully added ".concat(totalInserted, " properties."));
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
