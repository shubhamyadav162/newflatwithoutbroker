#!/bin/bash

# FlatWithoutBrokerage.com - Complete Deployment Script
# This script sets up everything: Nginx reverse proxy + SSL

set -e

echo "=========================================="
echo "🚀 FlatWithoutBrokerage.com Deployment"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Step 1: Setup Nginx
echo "📌 Step 1: Setting up Nginx reverse proxy..."
echo ""

# Install Nginx
apt-get update
apt-get install -y nginx

# Create directories
mkdir -p /var/www/certbot
mkdir -p /etc/nginx/sites-available
mkdir -p /etc/nginx/sites-enabled

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Create initial HTTP-only configuration
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

    location / {
        proxy_pass http://fwb_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/flatwithoutbrokerage /etc/nginx/sites-enabled/

# Test and restart Nginx
nginx -t
systemctl restart nginx
systemctl enable nginx

echo "✅ Nginx configured and running on port 80"
echo ""

# Step 2: Check Docker containers
echo "📌 Step 2: Checking Docker containers..."
echo ""

cd /root/flat-without-brokerage

if docker compose ps | grep -q "fwb-frontend"; then
    echo "✅ Docker containers are running"
    docker compose ps
else
    echo "⚠️  Docker containers not running. Starting..."
    docker compose up -d
    sleep 10
fi

echo ""

# Step 3: Test HTTP access
echo "📌 Step 3: Testing HTTP access..."
echo ""

if curl -s -o /dev/null -w "%{http_code}" http://flatwithoutbrokerage.com | grep -q "200\|301\|302"; then
    echo "✅ Website is accessible via HTTP"
else
    echo "⚠️  Website not yet accessible. DNS might still be propagating."
    echo "   Check with: curl http://flatwithoutbrokerage.com"
fi

echo ""

# Step 4: Setup SSL
echo "📌 Step 4: Setting up SSL certificate..."
echo ""

read -p "Do you want to setup SSL now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Install Certbot
    apt-get install -y certbot

    # Stop Nginx temporarily
    systemctl stop nginx

    # Get certificate
    certbot certonly --standalone \
        --non-interactive \
        --agree-tos \
        --email info@flatwithoutbrokerage.com \
        -d flatwithoutbrokerage.com \
        -d www.flatwithoutbrokerage.com

    # Start Nginx
    systemctl start nginx

    # Update Nginx configuration for HTTPS
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

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS - Main configuration
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name flatwithoutbrokerage.com www.flatwithoutbrokerage.com;

    ssl_certificate /etc/letsencrypt/live/flatwithoutbrokerage.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/flatwithoutbrokerage.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    access_log /var/log/nginx/flatwithoutbrokerage_access.log;
    error_log /var/log/nginx/flatwithoutbrokerage_error.log;

    client_max_body_size 10M;

    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    location / {
        proxy_pass http://fwb_frontend;
        proxy_redirect off;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /api/ {
        proxy_pass http://fwb_frontend;
        proxy_redirect off;
    }
}
EOF

    # Reload Nginx
    nginx -t
    systemctl reload nginx

    # Setup auto-renewal
    systemctl enable certbot.timer
    systemctl start certbot.timer

    echo "✅ SSL configured and HTTPS is enabled"
else
    echo "⏭️  Skipping SSL setup. You can run it later with certbot."
fi

echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""
echo "🌐 Website URLs:"
echo "   HTTP:  http://flatwithoutbrokerage.com"
echo "   HTTPS: https://flatwithoutbrokerage.com"
echo ""
echo "🔧 Useful commands:"
echo "   Check Nginx status: systemctl status nginx"
echo "   Check Docker containers: cd /root/flat-without-brokerage && docker compose ps"
echo "   View Nginx logs: tail -f /var/log/nginx/flatwithoutbrokerage_access.log"
echo "   Renew SSL: certbot renew"
echo ""
