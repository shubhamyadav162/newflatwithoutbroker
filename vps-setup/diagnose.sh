#!/bin/bash
# Full Diagnosis and Fix Script

echo "=========================================="
echo "🔍 FLATWITHOUTBROKERAGE.COM - DIAGNOSIS"
echo "=========================================="
echo ""

# 1. Check what's listening on ports
echo "📌 1. PORT STATUS:"
echo "==================="
echo "Port 80 (HTTP):"
netstat -tlnp | grep :80 || echo "❌ Nothing listening on port 80"
echo ""
echo "Port 443 (HTTPS):"
netstat -tlnp | grep :443 || echo "❌ Nothing listening on port 443"
echo ""
echo "Port 3080 (Docker):"
netstat -tlnp | grep :3080 || echo "❌ Nothing listening on port 3080"
echo ""

# 2. Check Docker containers
echo "📌 2. DOCKER CONTAINERS:"
echo "======================="
if command -v docker &> /dev/null; then
    docker ps --filter "name=fwb" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    echo "❌ Docker not installed"
fi
echo ""

# 3. Check Nginx
echo "📌 3. NGINX STATUS:"
echo "=================="
if command -v nginx &> /dev/null; then
    echo "✅ Nginx installed"
    systemctl status nginx --no-pager -l | grep -E "Active|loaded|dead"
    echo ""
    echo "Nginx configuration test:"
    nginx -t 2>&1
    echo ""
    echo "Enabled sites:"
    ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "❌ No sites enabled"
else
    echo "❌ Nginx NOT installed"
fi
echo ""

# 4. Check Firewall
echo "📌 4. FIREWALL STATUS:"
echo "======================"
if command -v ufw &> /dev/null; then
    ufw status numbered
else
    echo "UFW not installed"
fi
echo ""

# 5. Test local connection
echo "📌 5. LOCAL CONNECTION TEST:"
echo "==========================="
echo "Testing http://localhost:3080 ..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:3080 || echo "❌ Cannot connect to localhost:3080"
echo ""
echo "Testing http://localhost:80 ..."
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:80 || echo "❌ Cannot connect to localhost:80"
echo ""

# 6. Check recent errors
echo "📌 6. RECENT ERRORS:"
echo "==================="
if [ -f /var/log/nginx/error.log ]; then
    echo "Last 10 Nginx errors:"
    tail -10 /var/log/nginx/error.log
else
    echo "No Nginx error log found"
fi
echo ""

echo "=========================================="
echo "✅ DIAGNOSIS COMPLETE"
echo "=========================================="
