# Email Setup Guide for flatwithoutbrokerage.com

## Current Email Configuration

You have purchased: `info@flatwithoutbrokerage.com`

## Two Options for Email

### Option 1: Use GoDaddy's Email Service (RECOMMENDED - EASIEST)

Since you bought the email from GoDaddy, just use their webmail:

1. **Access GoDaddy Webmail:**
   - Go to: https://sso.godaddy.com/v1/?app=email&o=http://email.secureserver.net/remote/index.php
   - Login with your GoDaddy account
   - Your email `info@flatwithoutbrokerage.com` is already configured

2. **Configure Email Client (Outlook, Gmail app, etc.):**
   ```
   IMAP Server: email.secureserver.net
   IMAP Port: 993 (SSL)
   POP3 Server: email.secureserver.net
   POP3 Port: 995 (SSL)
   SMTP Server: smtp.secureserver.net
   SMTP Port: 465 (SSL) or 587 (TLS)
   Username: info@flatwithoutbrokerage.com
   Password: (your GoDaddy email password)
   ```

3. **Your Current DNS Records (Already Configured):**
   ```
   MX Record: @ → smtp.secureserver.net (Priority: 0) ✅
   CNAME: email → email.secureserver.net ✅
   DKIM Records (Already configured by GoDaddy) ✅
   ```

**This option is READY TO USE immediately!**

---

### Option 2: Self-Hosted Email on VPS (NOT RECOMMENDED)

⚠️ **Warning:** Self-hosted email is complex and emails may go to spam.

If you still want to host email on your VPS:

#### Required DNS Records

Add these records in GoDaddy DNS:

```
Type: A
Name: mail
Data: 203.57.85.130
TTL: 600

Type: MX
Name: @
Priority: 10
Data: mail.flatwithoutbrokerage.com
TTL: 600

Type: TXT
Name: @
Data: "v=spf1 mx ip4:203.57.85.130 ~all"
TTL: 600

Type: TXT
Name: _dmarc
Data: "v=DMARC1; p=none; rua=mailto:info@flatwithoutbrokerage.com"
TTL: 600
```

#### Install Mail Server on VPS

```bash
# Install Postfix and Dovecot
apt-get update
apt-get install -y postfix dovecot-core dovecot-imapd

# Configure Postfix for your domain
# (This requires detailed configuration)
```

**This will take hours to configure properly. NOT RECOMMENDED!**

---

## Recommendation: Use GoDaddy Email Service

✅ **Just use Option 1** - Your email is already working with GoDaddy!

Your DNS records are already configured:
- MX record points to GoDaddy's email server
- Email CNAME is configured
- DKIM records are set up

All you need to do:
1. Login to GoDaddy Workspace Email
2. Set your email password
3. Start sending/receiving emails

---

## Sending Emails from Backend Application

If your application needs to send emails (like notifications, password reset):

### Using GoDaddy SMTP (Recommended)

Add to your backend `.env`:

```env
SMTP_HOST=smtp.secureserver.net
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=info@flatwithoutbrokerage.com
SMTP_PASSWORD=your_godaddy_email_password
EMAIL_FROM=info@flatwithoutbrokerage.com
```

### Example Nodemailer Configuration

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.secureserver.net',
  port: 465,
  secure: true,
  auth: {
    user: 'info@flatwithoutbrokerage.com',
    pass: process.env.SMTP_PASSWORD
  }
});

// Send email
await transporter.sendMail({
  from: 'FlatWithoutBrokerage <info@flatwithoutbrokerage.com>',
  to: 'user@example.com',
  subject: 'Welcome!',
  text: 'Thank you for signing up!'
});
```

---

## Troubleshooting

### Emails not receiving?

1. Check DNS propagation: `dig flatwithoutbrokerage.com MX`
2. Verify MX record in GoDaddy DNS panel
3. Check GoDaddy email storage limit

### Emails going to spam?

- Setup SPF, DKIM, DMARC (GoDaddy already configured DKIM)
- Send from authenticated SMTP (smtp.secureserver.net)
- Don't use VPS IP to send directly

### Can't login to GoDaddy email?

- Go to: https://email.secureserver.net/remote/index.php
- Reset password from GoDaddy control panel if needed

---

## Summary

✅ Your email `info@flatwithoutbrokerage.com` is **ALREADY CONFIGURED** with GoDaddy
✅ DNS records are **ALREADY SET** (MX, CNAME, DKIM)
✅ Just login to GoDaddy Workspace Email and start using it
✅ Use GoDaddy SMTP from your backend application

**NO ADDITIONAL SETUP NEEDED!**
