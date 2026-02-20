# FlatWithoutBrokerage.com - Quick Fix Guide

## 🎯 Problem Summary (Hindi)

1. **Website "No website found" error दे रही है**
   - कारण: Website port 3080 पर चल रही है लेकिन domain port 80 पर जाता है
   - Solution: Nginx reverse proxy install करना होगा

2. **Email setup करना है**
   - अच्छी खबर: आपका email पहले से configured है GoDaddy पर
   - सिर्फ GoDaddy Workspace Email में login करना है

---

## 🚀 Quick Fix (5 मिनट में)

### Option 1: Manual Deployment (Recommended)

अपने local machine से VPS पर connect करें:

```bash
# Windows CMD में run करें
ssh root@203.57.85.130
# Password: oFUeZkAOc97phKHZ
```

फिर VPS पर ये commands run करें:

```bash
# 1. Nginx install करें
apt-get update
apt-get install -y nginx

# 2. Nginx config file बनाएं
cat > /etc/nginx/sites-available/flatwithoutbrokerage << 'EOF'
upstream fwb_frontend {
    server 127.0.0.1:3080;
}

server {
    listen 80;
    server_name flatwithoutbrokerage.com www.flatwithoutbrokerage.com;

    location / {
        proxy_pass http://fwb_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

# 3. Site enable करें
ln -sf /etc/nginx/sites-available/flatwithoutbrokerage /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 4. Nginx restart करें
nginx -t
systemctl restart nginx
systemctl enable nginx
```

**बस! अब आपकी website http://flatwithoutbrokerage.com पर चलनी चाहिए!** 🎉

---

### Option 2: Automated Script

अगर आप पूरा automation चाहते हैं:

```bash
# अपने local machine पर
cd "c:\Users\S\Desktop\Flat without brokerage.com\vps-setup"

# Script को VPS पर upload करें (अगर आपके पास SCP है)
scp deploy-all.sh root@203.57.85.130:/root/

# या सीधे VPS पर create करें
ssh root@203.57.85.130
# (paste the deploy-all.sh content manually)

# Run करें
chmod +x /root/deploy-all.sh
cd /root
./deploy-all.sh
```

---

## ✅ Verification

Check करें कि website चल रही है:

```bash
# VPS पर
curl http://flatwithoutbrokerage.com

# या अपने browser में खोलें
# http://flatwithoutbrokerage.com
```

---

## 🔒 SSL Setup (HTTPS) - Optional

HTTP काम करने के बाद, HTTPS enable करें:

```bash
# VPS पर

# 1. Certbot install करें
apt-get install -y certbot

# 2. Nginx stop करें (port 80 free करने के लिए)
systemctl stop nginx

# 3. SSL certificate प्राप्त करें
certbot certonly --standalone \
  --agree-tos \
  --email info@flatwithoutbrokerage.com \
  -d flatwithoutbrokerage.com \
  -d www.flatwithoutbrokerage.com

# 4. Nginx config को update करें (HTTPS के साथ)
cat > /etc/nginx/sites-available/flatwithoutbrokerage << 'EOF'
upstream fwb_frontend {
    server 127.0.0.1:3080;
}

# HTTP → HTTPS redirect
server {
    listen 80;
    server_name flatwithoutbrokerage.com www.flatwithoutbrokerage.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS
server {
    listen 443 ssl;
    server_name flatwithoutbrokerage.com www.flatwithoutbrokerage.com;

    ssl_certificate /etc/letsencrypt/live/flatwithoutbrokerage.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/flatwithoutbrokerage.com/privkey.pem;

    location / {
        proxy_pass http://fwb_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto https;
    }
}
EOF

# 5. Nginx restart करें
systemctl start nginx
nginx -t
systemctl reload nginx
```

अब website दोनों पर चलेगी:
- http://flatwithoutbrokerage.com (redirects to HTTPS)
- https://flatwithoutbrokerage.com ✅

---

## 📧 Email Setup

**अच्छी खबर:** आपका email पहले से setup है!

### Email Access करने के लिए:

1. **GoDaddy Workspace खोलें:**
   - URL: https://email.secureserver.net/remote/index.php
   - Login: अपना GoDaddy account
   - Password: जो आपने set किया था

2. **Email में login करें:**
   - Username: `info@flatwithoutbrokerage.com`
   - Password: (GoDaddy में set किया हुआ)

3. **Mobile या Desktop app में add करें:**
   - IMAP: email.secureserver.net (port 993)
   - SMTP: smtp.secureserver.net (port 465)
   - Username: info@flatwithoutbrokerage.com

**DNS records already configured!** ✅

---

## 🔍 Troubleshooting

### Website still shows "No website found"?

```bash
# Check Nginx status
systemctl status nginx

# Check Docker containers
docker ps | grep fwb

# Restart containers if needed
cd /root/flat-without-brokerage
docker compose up -d

# Restart Nginx
systemctl restart nginx
```

### SSL certificate fails?

```bash
# Check DNS propagation
curl http://flatwithoutbrokerage.com

# Make sure port 80 is not used by other service
netstat -tlnp | grep :80

# Wait 10-15 minutes after DNS update
```

---

## 📋 Final Checklist

- [ ] Nginx installed
- [ ] Nginx reverse proxy configured (port 80 → 3080)
- [ ] Website opens at http://flatwithoutbrokerage.com
- [ ] SSL certificate installed
- [ ] HTTPS working: https://flatwithoutbrokerage.com
- [ ] Email accessible via GoDaddy Workspace

---

## 🎉 Expected URLs After Setup

| URL | Result |
|-----|--------|
| http://flatwithoutbrokerage.com | → Redirects to HTTPS |
| https://flatwithoutbrokerage.com | → Your website ✅ |
| https://flatwithoutbrokerage.com/api/v1/health | → API status |

---

## 📞 Need Help?

Common issues:

1. **"Connection refused"** → Docker containers not running
2. **"502 Bad Gateway"** → Backend not healthy
3. **"SSL not working"** → DNS not propagated (wait 10-15 min)

Check logs:
```bash
tail -f /var/log/nginx/flatwithoutbrokerage_error.log
docker logs fwb-frontend
docker logs fwb-backend
```

---

**Last Updated:** January 22, 2026
**Est. Time to Fix:** 5-10 minutes
