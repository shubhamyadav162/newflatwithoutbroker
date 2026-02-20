#!/bin/bash
# VPS Deployment Script for FlatWithoutBrokerage.com
# Run this on the VPS after cloning the repository

set -e

PROJECT_DIR="/root/flat-without-brokerage"
NGINX_PROXY_DIR="/root/nginx-proxy"

echo "🏠 Deploying FlatWithoutBrokerage.com..."

# Navigate to project
cd $PROJECT_DIR

# Pull latest changes
echo "📥 Pulling latest code..."
git pull origin main || true

# Build and start containers
echo "🐳 Building Docker containers..."
docker compose down || true
docker compose build --no-cache
docker compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Show status
echo "✅ Deployment complete!"
echo ""
docker compose ps

echo ""
echo "📡 FlatWithoutBrokerage is running on:"
echo "   - Frontend: http://$(hostname -I | awk '{print $1}'):3080"
echo "   - API: http://$(hostname -I | awk '{print $1}'):3080/api/v1/health"
echo ""
echo "🌐 To point your domain:"
echo "   1. Add A record: flatwithoutbrokerage.com → $(hostname -I | awk '{print $1}')"
echo "   2. Update Nginx in hyper-liquid to proxy the domain"
