# Build stage
FROM node:18-alpine3.17 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine3.17 AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only (including prisma for CLI)
RUN npm ci --only=production

# Copy Prisma schema and migrations
COPY --from=builder /app/prisma ./prisma

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Re-generate Prisma client in production to ensure engines match the environment
RUN npx prisma generate


# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start the server
CMD ["node", "dist/server.js"]
