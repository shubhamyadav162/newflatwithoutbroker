# FlatWithoutBrokerage.com - VPS Deployment Guide

## 🎯 Current Status

✅ Docker containers deployed on VPS (port 3080)
✅ Domain purchased: flatwithoutbrokerage.com
✅ Email configured: info@flatwithoutbrokerage.com
❌ Nginx reverse proxy NOT configured (website shows "No website found")
❌ SSL certificate NOT installed

---

## 🚨 Problem Identified

Your website is running on **port 3080** but domain tries to connect to **port 80/443**.

**Solution:** Install Nginx reverse proxy to forward port 80/443 → 3080

---

## 📋 Deployment Steps

### Step 1: Connect to VPS

Using SSH key (recommended):
```bash
ssh -i id_rsa_vps root@203.57.85.130
```

Or using password:
```bash
ssh root@203.57.85.130
# Password: oFUeZkAOc97phKHZ
```

### Step 2: Upload and Run Deployment Script

```bash
# On your local machine, upload the script
scp vps-setup/deploy-all.sh root@203.57.85.130:/root/

# On VPS, run the script
cd /root
chmod +x deploy-all.sh
./deploy-all.sh
```

### Step 3: Follow the Script Prompts

The script will:
1. ✅ Install Nginx
2. ✅ Configure reverse proxy (port 80 → 3080)
3. ✅ Test HTTP access
4. ✅ Install SSL certificate (HTTPS)
5. ✅ Configure auto-renewal

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| [deploy-all.sh](deploy-all.sh) | Complete deployment automation |
| [setup-nginx.sh](setup-nginx.sh) | Nginx reverse proxy only |
| [setup-ssl.sh](setup-ssl.sh) | SSL certificate only |
| [nginx.conf](nginx.conf) | Nginx configuration reference |
| [email-setup-guide.md](email-setup-guide.md) | Email setup instructions |

---

## 🌐 Expected Results

After deployment:

| URL | Should Show |
|-----|-------------|
| `http://flatwithoutbrokerage.com` | Redirects to HTTPS |
| `https://flatwithoutbrokerage.com` | Your website ✅ |
| `https://www.flatwithoutbrokerage.com` | Your website ✅ |

---

## 📧 Email Setup

**Your email is already configured with GoDaddy!**

See: [email-setup-guide.md](email-setup-guide.md)

**Quick Access:**
- Webmail: https://email.secureserver.net/remote/index.php
- SMTP: smtp.secureserver.net:465
- Username: info@flatwithoutbrokerage.com

---

## 🔧 Useful Commands

```bash
# Check Nginx status
systemctl status nginx

# Check Docker containers
cd /root/flat-without-brokerage && docker compose ps

# View Nginx logs
tail -f /var/log/nginx/flatwithoutbrokerage_access.log
tail -f /var/log/nginx/flatwithoutbrokerage_error.log

# Restart Nginx
systemctl restart nginx

# Test SSL certificate
certbot certificates

# Renew SSL manually
certbot renew

# Check DNS propagation
dig flatwithoutbrokerage.com
curl http://flatwithoutbrokerage.com
```

---

## 🔍 Troubleshooting

### Website shows "No website found"

**Cause:** Nginx not configured or Docker containers not running

**Solution:**
```bash
# Check if Nginx is installed
systemctl status nginx

# Check if Docker containers are running
docker ps | grep fwb

# If containers not running
cd /root/flat-without-brokerage
docker compose up -d
```

### SSL certificate fails

**Cause:** DNS not propagated or port 80 blocked

**Solution:**
```bash
# Check DNS propagation
dig flatwithoutbrokerage.com

# Wait 10-15 minutes after DNS update before getting SSL

# Check if port 80 is accessible
netstat -tlnp | grep :80
```

### HTTP to HTTPS redirect not working

**Cause:** Nginx configuration not updated

**Solution:**
```bash
# Check Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

## 📊 Architecture

```
Internet
   │
   ▼
User (browser)
   │
   ▼ https://flatwithoutbrokerage.com:443
   │
Nginx Reverse Proxy (port 443)
   │
   ▼ forwards to
Docker Container fwb-frontend (port 3080)
   │
   ▼
React Application
   │
   ▼ API calls
Docker Container fwb-backend (port 5000)
   │
   ▼
PostgreSQL Database
```

---

## 🔐 Security Checklist

- [x] Firewall configured (ports 80, 443, 22)
- [ ] SSL certificate installed (Let's Encrypt)
- [ ] HTTP to HTTPS redirect enabled
- [ ] Security headers configured
- [ ] Docker containers not exposed publicly
- [ ] Database on internal network only
- [ ] Regular backups configured
- [ ] SSL auto-renewal enabled

---

## 📞 Support

If you encounter issues:

1. Check logs: `tail -f /var/log/nginx/*.log`
2. Check containers: `docker compose ps`
3. Test locally: `curl http://localhost:3080`
4. Test externally: `curl http://flatwithoutbrokerage.com`

---

## ✅ Next Steps

1. **Run deployment script:** `./deploy-all.sh`
2. **Verify website opens:** https://flatwithoutbrokerage.com
3. **Test API:** https://flatwithoutbrokerage.com/api/v1/health
4. **Setup email:** Follow email-setup-guide.md
5. **Monitor logs:** Watch for any errors

---

**Created:** January 22, 2026
**VPS:** 203.57.85.130 (Ubuntu 22.04 LTS)
**Domain:** flatwithoutbrokerage.com
**Email:** info@flatwithoutbrokerage.com
