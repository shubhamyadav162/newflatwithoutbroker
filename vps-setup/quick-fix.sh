#!/bin/bash
# Quick Fix Script - Run this on VPS to fix "ERR_CONNECTION_REFUSED"

echo "🚀 Fixing flatwithoutbrokerage.com..."

# Update and install Nginx
apt-get update -y
apt-get install -y nginx

# Create Nginx configuration
cat > /etc/nginx/sites-available/flatwithoutbrokerage << 'EOF'
upstream fwb_frontend {
    server 127.0.0.1:3080;
    keepalive 64;
}

server {
    listen 80;
    listen [::]:80;

    server_name flatwithoutbrokerage.com www.flatwithoutbrokerage.com;

    location / {
        proxy_pass http://fwb_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/flatwithoutbrokerage /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test configuration
echo "🔍 Testing Nginx configuration..."
nginx -t

# Start and enable Nginx
echo "🔄 Starting Nginx..."
systemctl enable nginx
systemctl restart nginx

# Check if Docker containers are running
echo "🐳 Checking Docker containers..."
if docker ps | grep -q "fwb-frontend"; then
    echo "✅ Docker containers are running"
else
    echo "⚠️  Starting Docker containers..."
    cd /root/flat-without-brokerage
    docker compose up -d
    sleep 10
fi

# Check status
echo ""
echo "📊 Status Check:"
echo "=================="
echo "Nginx status:"
systemctl status nginx --no-pager -l | grep -E "Active|running"
echo ""
echo "Docker containers:"
docker ps --filter "name=fwb" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "Port 80 listening:"
netstat -tlnp | grep :80
echo ""
echo "Port 3080 listening:"
netstat -tlnp | grep :3080

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌐 Try opening: http://flatwithoutbrokerage.com"
echo ""
echo "If still not working, check:"
echo "  - Firewall: sudo ufw allow 80/tcp"
echo "  - Logs: tail -f /var/log/nginx/error.log"
