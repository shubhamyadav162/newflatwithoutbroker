# FlatWithoutBrokerage.com - Complete Project Specification

> A NoBroker alternative - 100% Free Real Estate Directory Marketplace

---

## 1. Project Overview

### Core Concept
- **Mission:** Eliminate middlemen (brokers) from real estate transactions
- **USP:** "100% Free, Direct Contact, No Hidden Charges"
- **Model:** Open Directory / Classified Marketplace

### Target Audience
- Property Owners (listing properties)
- Buyers/Tenants (searching properties)
- Indian Real Estate Market focus

---

## 2. Technology Stack

### Frontend (Completed ✅)
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Components:** Shadcn UI
- **Animation:** Framer Motion
- **Routing:** React Router DOM
- **State:** TanStack Query

### Backend (To Build 🔨)
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js + TypeScript
- **Database:** PostgreSQL (Prisma ORM)
- **Search:** Meilisearch (fast filtering)
- **Cache:** Redis
- **Storage:** AWS S3 (images)
- **Container:** Docker + Docker Compose

### Deployment
- **Server:** KVM 8 VPS (8 vCPU, 32GB RAM, 400GB NVMe)
- **Web Server:** Nginx (reverse proxy)
- **Process Manager:** PM2 (cluster mode)

---

## 3. Color Theme ("Royal Estate")

| Color Name       | Hex Code  | Usage                                           |
|-----------------|-----------|------------------------------------------------|
| Imperial Cherry | `#D61C4E` | Primary CTAs, Search button, Contact button    |
| Metallic Gold   | `#C5A059` | Accents, Verified badges, Premium highlights   |
| Rich Black      | `#121212` | Headers, Footers, Main text                    |
| Pure White      | `#FFFFFF` | Backgrounds, Cards                              |
| Soft Grey       | `#F3F4F6` | Section dividers                                |

---

## 4. Database Schema

### User Table
```
- id: UUID (Primary Key)
- phone: String (Unique, Indexed)
- name: String
- role: Enum (BUYER, OWNER, ADMIN)
- isVerified: Boolean
- credits: Integer (Default: 9999 - Free model)
- createdAt: DateTime
```

### Property Table
```
- id: UUID
- ownerId: UUID (FK → User)
- title: String
- description: Text
- type: Enum (APARTMENT, VILLA, PG, SHOP, OFFICE)
- listingType: Enum (RENT, SELL)
- status: Enum (ACTIVE, SOLD, INACTIVE)
- price: Float (Indexed)
- deposit: Float
- builtUpArea: Integer
- furnishing: Enum (FULLY, SEMI, NONE)
- bhk: Integer
- bathrooms: Integer
- locality: String (Indexed)
- city: String (Indexed)
- latitude: Float
- longitude: Float
- images: String[]
- amenities: String[]
- tenantType: Enum (FAMILY, BACHELOR, COMPANY, ANY)
- availability: Enum (IMMEDIATE, WITHIN15, WITHIN30)
- views: Integer
- createdAt: DateTime
- updatedAt: DateTime
```

### ContactAccess Table (Audit)
```
- id: UUID
- viewerId: UUID (who clicked)
- propertyId: UUID
- ownerId: UUID
- timestamp: DateTime
```

---

## 5. API Endpoints

### Authentication (`/api/v1/auth`)
| Method | Endpoint        | Description                |
|--------|----------------|----------------------------|
| POST   | `/send-otp`    | Send OTP to phone number   |
| POST   | `/verify-otp`  | Verify OTP & get JWT token |
| POST   | `/refresh`     | Refresh access token       |
| GET    | `/me`          | Get current user profile   |

### Properties (`/api/v1/properties`)
| Method | Endpoint      | Description                      |
|--------|--------------|----------------------------------|
| GET    | `/`          | List all properties (paginated)  |
| GET    | `/:id`       | Get single property details      |
| POST   | `/`          | Create new listing (Protected)   |
| PUT    | `/:id`       | Update listing (Owner only)      |
| DELETE | `/:id`       | Soft delete (Owner only)         |

### Search (`/api/v1/search`)
| Method | Endpoint | Query Params                                |
|--------|---------|---------------------------------------------|
| GET    | `/`     | q, city, type, bhk, minPrice, maxPrice, furnishing |

### Media (`/api/v1/upload`)
| Method | Endpoint  | Description                  |
|--------|----------|------------------------------|
| POST   | `/image` | Upload image to S3           |

### Contact (`/api/v1/contact`)
| Method | Endpoint   | Description                   |
|--------|-----------|-------------------------------|
| POST   | `/reveal` | Get owner contact (Protected) |

---

## 6. Frontend Pages

### Completed Pages
1. **Home (Index)** - Hero section with Omni-Search bar
2. **Listings** - Property directory with filters
3. **404** - Not found page

### Pages to Add (with Backend)
1. **Property Detail** - Full property view with owner contact
2. **Post Property** - Multi-step wizard for listing
3. **Login/Signup** - OTP-based authentication
4. **My Listings** - User's posted properties
5. **Profile** - User profile management

---

## 7. Key Features

### For Buyers/Tenants
- ✅ Search properties by city, locality, BHK
- ✅ Filter by price, furnishing, type
- 🔨 Direct contact with owners (no broker)
- 🔨 View property photos and details
- 🔨 WhatsApp integration for quick contact

### For Property Owners
- 🔨 Free property listing
- 🔨 Easy 2-minute posting process
- 🔨 Photo upload (up to 10 images)
- 🔨 Track property views
- 🔨 Mark as sold/rented

### Platform Features
- 🔨 OTP-based login (anti-spam)
- 🔨 Verified owner badges
- 🔨 Report fake listings
- 🔨 Rate limiting (anti-scraping)

---

## 8. Docker Services

```yaml
Services:
  - app:       Node.js API (Express)
  - postgres:  PostgreSQL Database
  - redis:     Redis Cache
  - meilisearch: Fast Search Engine
  - nginx:     Reverse Proxy (production)
```

---

## 9. Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/fwb

# JWT
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Redis
REDIS_URL=redis://localhost:6379

# Meilisearch
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_KEY=masterKey123

# AWS S3
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=ap-south-1
AWS_BUCKET_NAME=flat-without-brokerage-media

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

---

## 10. Project Structure

```
/backend
  /src
    /config       # DB, Redis, S3 clients
    /controllers  # Request handlers
    /middlewares  # Auth, rate-limit, errors
    /routes       # Express routers
    /services     # Business logic
    /utils        # Helpers, validators
    /types        # TypeScript types
    app.ts        # Express app setup
    server.ts     # Entry point
  /prisma
    schema.prisma # Database schema
  docker-compose.yml
  Dockerfile
  package.json
  tsconfig.json
  .env.example

/frontend (Existing)
  /src
    /components
    /pages
    /hooks
    /data
    /services     # API calls (to add)
```
