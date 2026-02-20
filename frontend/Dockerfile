# Build stage
FROM node:18-alpine AS builder

# Accept build arguments
ARG VITE_ADMIN_PASSWORD
ARG VITE_API_URL
ARG VITE_GOOGLE_MAPS_API_KEY

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create .env file for Vite
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env && \
    echo "VITE_ADMIN_PASSWORD=${VITE_ADMIN_PASSWORD}" >> .env && \
    echo "VITE_GOOGLE_MAPS_API_KEY=${VITE_GOOGLE_MAPS_API_KEY}" >> .env && \
    cat .env

# Build the application
RUN npm run build

# Production stage - use nginx to serve static files
FROM nginx:alpine AS production

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

