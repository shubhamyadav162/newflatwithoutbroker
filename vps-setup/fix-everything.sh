#!/bin/bash
# Complete Fix Script - Run this to fix everything

set -e

echo "=========================================="
echo "🚀 FIXING FLATWITHOUTBROKERAGE.COM"
echo "=========================================="
echo ""

# Step 1: Update and install dependencies
echo "📦 Step 1: Installing Nginx..."
apt-get update -y
apt-get install -y nginx curl net-tools

# Step 2: Check and start Docker containers
echo ""
echo "🐳 Step 2: Checking Docker containers..."
if [ -d /root/flat-without-brokerage ]; then
    cd /root/flat-without-brokerage
    echo "Starting Docker containers..."
    docker compose up -d
    sleep 15

    # Verify containers are running
    if docker ps | grep -q "fwb-frontend"; then
        echo "✅ Docker containers are running"
        docker ps --filter "name=fwb" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    else
        echo "❌ Failed to start containers"
        docker compose logs
    fi
else
    echo "⚠️  Project directory not found at /root/flat-without-brokerage"
fi

# Step 3: Configure Nginx
echo ""
echo "📝 Step 3: Configuring Nginx..."
mkdir -p /etc/nginx/sites-available
mkdir -p /etc/nginx/sites-enabled

cat > /etc/nginx/sites-available/flatwithoutbrokerage << 'NGINX_CONFIG'
upstream fwb_frontend {
    server 127.0.0.1:3080;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;

    server_name flatwithoutbrokerage.com www.flatwithoutbrokerage.com _;

    access_log /var/log/nginx/flatwithoutbrokerage_access.log;
    error_log /var/log/nginx/flatwithoutbrokerage_error.log;

    # Proxy settings
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;

    # Main location
    location / {
        proxy_pass http://fwb_frontend;
        proxy_redirect off;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health {
        proxy_pass http://fwb_frontend;
        access_log off;
    }
}
NGINX_CONFIG

# Enable site
ln -sf /etc/nginx/sites-available/flatwithoutbrokerage /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
echo ""
echo "🔍 Testing Nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration failed!"
    exit 1
fi

# Step 4: Configure Firewall
echo ""
echo "🔥 Step 4: Configuring Firewall..."
if command -v ufw &> /dev/null; then
    echo "Allowing HTTP (port 80)..."
    ufw allow 80/tcp 2>/dev/null || echo "UFW rule may already exist or UFW not active"
    echo "Allowing HTTPS (port 443)..."
    ufw allow 443/tcp 2>/dev/null || echo "UFW rule may already exist or UFW not active"
    echo "Allowing SSH (port 22)..."
    ufw allow 22/tcp 2>/dev/null || echo "UFW rule may already exist"
    ufw status
else
    echo "⚠️  UFW not installed, skipping firewall config"
fi

# Step 5: Start Nginx
echo ""
echo "🔄 Step 5: Starting Nginx..."
systemctl unmask nginx 2>/dev/null || true
systemctl enable nginx
systemctl restart nginx

# Wait a moment for Nginx to start
sleep 3

if systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx failed to start!"
    systemctl status nginx
    journalctl -xeu nginx --no-pager | tail -20
    exit 1
fi

# Step 6: Verify ports
echo ""
echo "🔍 Step 6: Verifying ports..."
echo "Port 80 (HTTP - Nginx):"
netstat -tlnp | grep :80 || echo "❌ Port 80 not listening!"
echo ""
echo "Port 3080 (Docker Frontend):"
netstat -tlnp | grep :3080 || echo "❌ Port 3080 not listening!"

# Step 7: Test locally
echo ""
echo "🧪 Step 7: Testing local connection..."
sleep 2
echo "Testing http://localhost:80 ..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80 || echo "000")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo "✅ Local HTTP test passed (HTTP $HTTP_CODE)"
else
    echo "⚠️  Local HTTP test returned: $HTTP_CODE"
fi

echo ""
echo "Testing http://localhost:3080 ..."
DOCKER_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3080 || echo "000")
if [ "$DOCKER_CODE" = "200" ]; then
    echo "✅ Docker frontend test passed (HTTP $DOCKER_CODE)"
else
    echo "⚠️  Docker frontend test returned: $DOCKER_CODE"
fi

# Summary
echo ""
echo "=========================================="
echo "✅ FIX COMPLETE!"
echo "=========================================="
echo ""
echo "🌐 Your website should be accessible at:"
echo "   http://flatwithoutbrokerage.com"
echo "   http://www.flatwithoutbrokerage.com"
echo ""
echo "📊 Service Status:"
echo "   Nginx: $(systemctl is-active nginx)"
echo "   Docker: $(docker ps | grep -q fwb && echo "Running" || echo "Not Running")"
echo ""
echo "🔍 If still not working, check:"
echo "   1. DNS propagation: dig flatwithoutbrokerage.com"
echo "   2. Nginx logs: tail -f /var/log/nginx/flatwithoutbrokerage_error.log"
echo "   3. Docker logs: docker logs fwb-frontend"
echo ""
echo "🔥 If connection refused externally but works locally:"
echo "   → Check VPS provider firewall (not just OS firewall)"
echo "   → Go to your VPS dashboard and allow ports 80 and 443"
echo ""
