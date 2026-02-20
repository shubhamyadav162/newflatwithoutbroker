const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Creating database tables...');

  try {
    // Create User table
    await prisma.\$executeRawUnsafe(\`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "phone" TEXT,
        "email" TEXT,
        "name" TEXT,
        "avatar" TEXT,
        "googleId" TEXT,
        "role" TEXT NOT NULL DEFAULT 'BUYER',
        "isVerified" BOOLEAN NOT NULL DEFAULT false,
        "credits" INTEGER NOT NULL DEFAULT 9999,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
    \`);

    // Create Property table
    await prisma.\$executeRawUnsafe(\`
      CREATE TABLE IF NOT EXISTS "Property" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "listingType" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "price" INTEGER NOT NULL,
        "deposit" INTEGER,
        "bhk" INTEGER,
        "bathrooms" INTEGER,
        "builtUpArea" INTEGER NOT NULL,
        "furnishing" TEXT NOT NULL,
        "tenantType" TEXT NOT NULL,
        "availability" TEXT NOT NULL,
        "location" TEXT NOT NULL,
        "images" TEXT NOT NULL,
        "amenities" TEXT NOT NULL,
        "views" INTEGER NOT NULL DEFAULT 0,
        "ownerId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
      );
    \`);

    // Create ContactAccess table
    await prisma.\$executeRawUnsafe(\`
      CREATE TABLE IF NOT EXISTS "ContactAccess" (
        "id" TEXT NOT NULL,
        "viewerId" TEXT NOT NULL,
        "propertyId" TEXT NOT NULL,
        "ownerId" TEXT NOT NULL,
        "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "ContactAccess_pkey" PRIMARY KEY ("id")
      );
    \`);

    // Create indexes
    await prisma.\$executeRawUnsafe(\`CREATE INDEX IF NOT EXISTS "User_googleId_idx" ON "User"("googleId");\`);
    await prisma.\$executeRawUnsafe(\`CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");\`);
    await prisma.\$executeRawUnsafe(\`CREATE INDEX IF NOT EXISTS "Property_ownerId_idx" ON "Property"("ownerId");\`);

    console.log('✅ Database tables created successfully!');

    // Check if tables exist
    const result = await prisma.\$queryRawUnsafe \`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';\`;
    console.log('📊 Tables in database:', result);

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    await prisma.\$disconnect();
  }
}

main()
  .then(() => {
    console.log('✅ Setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
