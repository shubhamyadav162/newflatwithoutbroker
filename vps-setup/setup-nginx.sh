#!/bin/bash

# FlatWithoutBrokerage.com - Nginx Reverse Proxy Setup
# This script sets up Nginx as a reverse proxy with SSL for the domain

set -e

echo "🚀 Setting up Nginx Reverse Proxy for flatwithoutbrokerage.com..."

# Update system
echo "📦 Updating system packages..."
apt-get update

# Install Nginx and Certbot
echo "📦 Installing Nginx and Certbot..."
apt-get install -y nginx certbot python3-certbot-nginx

# Create directories
mkdir -p /var/www/certbot
mkdir -p /etc/nginx/sites-available
mkdir -p /etc/nginx/sites-enabled

# Remove default Nginx configuration
rm -f /etc/nginx/sites-enabled/default

# Copy our Nginx configuration (without SSL first)
cat > /etc/nginx/sites-available/flatwithoutbrokerage << 'EOF'
upstream fwb_frontend {
    server 127.0.0.1:3080;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;

    server_name flatwithoutbrokerage.com www.flatwithoutbrokerage.com;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # For now, serve directly (before SSL is setup)
    location / {
        proxy_pass http://fwb_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/flatwithoutbrokerage /etc/nginx/sites-enabled/

# Test Nginx configuration
echo "🔍 Testing Nginx configuration..."
nginx -t

# Restart Nginx
echo "🔄 Restarting Nginx..."
systemctl restart nginx
systemctl enable nginx

echo "✅ Nginx setup complete!"
echo "🌐 Website should be accessible at http://flatwithoutbrokerage.com"
echo ""
echo "Next steps:"
echo "1. Verify DNS has propagated: curl http://flatwithoutbrokerage.com"
echo "2. Setup SSL with: ./setup-ssl.sh"
