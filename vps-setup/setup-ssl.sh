#!/bin/bash

# FlatWithoutBrokerage.com - SSL Setup with Let's Encrypt
# This script installs SSL certificate using Certbot

set -e

DOMAIN="flatwithoutbrokerage.com"
EMAIL="info@flatwithoutbrokerage.com"

echo "🔒 Setting up SSL certificate for $DOMAIN..."

# Check if Nginx is running
if ! systemctl is-active --quiet nginx; then
    echo "❌ Nginx is not running. Please run setup-nginx.sh first."
    exit 1
fi

# Stop Nginx temporarily to free up port 80
echo "⏸️  Stopping Nginx temporarily..."
systemctl stop nginx

# Get SSL certificate using standalone mode
echo "📜 Obtaining SSL certificate from Let's Encrypt..."
certbot certonly --standalone \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    -d $DOMAIN \
    -d www.$DOMAIN

# Start Nginx again
echo "▶️  Starting Nginx..."
systemctl start nginx

# Update Nginx configuration with SSL
echo "🔄 Updating Nginx configuration for HTTPS..."
cat > /etc/nginx/sites-available/flatwithoutbrokerage << 'EOF'
upstream fwb_frontend {
    server 127.0.0.1:3080;
    keepalive 64;
}

# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;

    server_name flatwithoutbrokerage.com www.flatwithoutbrokerage.com;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all HTTP traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS - Main configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name flatwithoutbrokerage.com www.flatwithoutbrokerage.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/flatwithoutbrokerage.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/flatwithoutbrokerage.com/privkey.pem;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Logging
    access_log /var/log/nginx/flatwithoutbrokerage_access.log;
    error_log /var/log/nginx/flatwithoutbrokerage_error.log;

    # Client body size limit
    client_max_body_size 10M;

    # Proxy settings
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    # Main location - Forward to Docker container
    location / {
        proxy_pass http://fwb_frontend;
        proxy_redirect off;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # API forwarding
    location /api/ {
        proxy_pass http://fwb_frontend;
        proxy_redirect off;
    }
}
EOF

# Test Nginx configuration
echo "🔍 Testing Nginx configuration..."
nginx -t

# Reload Nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

# Setup auto-renewal
echo "🔄 Setting up SSL auto-renewal..."
systemctl enable certbot.timer
systemctl start certbot.timer

echo "✅ SSL setup complete!"
echo "🌐 Website accessible at: https://$DOMAIN"
echo ""
echo "SSL certificate will auto-renew. Check status with:"
echo "  certbot renew --dry-run"
