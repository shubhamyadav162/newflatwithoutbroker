# GitHub Authentication Setup for Windows

## Method 1: Using Git Credential Manager (RECOMMENDED)

### Step 1: Generate Personal Access Token
1. Go to https://github.com
2. Click profile → Settings → Developer settings → Personal access tokens → Tokens (classic)
3. Click "Generate new token (classic)"
4. Name: "FlatWithoutBrokerage Windows"
5. Expiration: "No expiration" or "90 days"
6. Check these scopes:
   - ✅ repo (Full control)
   - ✅ workflow (if using GitHub Actions)
7. Click "Generate token"
8. **COPY THE TOKEN** - It will only show once!

### Step 2: Configure Git in Windows Terminal

Open PowerShell or Command Prompt and run:

```bash
# Remove old credentials (if any)
git credential-manager-core erase

# Configure Git to use credential manager
git config --global credential.helper manager-core

# Set your GitHub username
git config --global user.name "shubhamyadav162"
git config --global user.email "your-email@example.com"

# Add remote as HTTPS (your repo already has this)
# git remote set-url origin https://github.com/shubhamyadav162/flat-without-brokerage.git
```

### Step 3: Push - Browser Window Will Open

When you run `git push`, a browser window will open asking you to authorize GitHub:

```bash
cd "c:\Users\S\Desktop\23\Flat without brokerage.com"
git push origin main
```

✅ First time: Browser opens → Login to GitHub → Authorize
✅ After that: No more password prompts!

---

## Method 2: Using Personal Access Token Directly

If credential manager doesn't work, use the token directly:

### Step 1: Generate Token (from above)

### Step 2: Use Token as Password

When pushing, use:
- **Username:** shubhamyadav162
- **Password:** <paste the token here>

```bash
git push origin main
# Username: shubhamyadav162
# Password: <paste your personal access token>
```

### Step 3: Save Credentials (Optional)

```bash
# Save credentials for future use
git config --global credential.helper store
git push origin main
# Enter username and token
# They will be saved in plaintext (be careful!)
```

---

## Method 3: Using SSH Keys (MOST SECURE)

### Step 1: Generate SSH Key

```bash
# Generate new SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Save to: C:\Users\S\.ssh\id_ed25519
# Leave passphrase empty (press Enter)
```

### Step 2: Add SSH Key to GitHub

```bash
# Copy public key
cat C:\Users\S\.ssh\id_ed25519.pub
```

Then:
1. Go to https://github.com/settings/keys
2. Click "New SSH key"
3. Paste the key content
4. Click "Add SSH key"

### Step 3: Change Remote URL to SSH

```bash
cd "c:\Users\S\Desktop\23\Flat without brokerage.com"

# Change from HTTPS to SSH
git remote set-url origin git@github.com:shubhamyadav162/flat-without-brokerage.git

# Now push - no password needed!
git push origin main
```

---

## Recommended: Use Method 1 (Credential Manager)

This is the easiest and most secure method:
- ✅ Browser-based authentication
- ✅ No need to save passwords
- ✅ Automatic token refresh
- ✅ Works with 2FA

---

## Troubleshooting

### If credential manager asks for password again:
```bash
# Clear cached credentials
git credential-manager-core erase

# Try pushing again
git push origin main
```

### If you see "supports only password authentication":
```bash
# You need to use a Personal Access Token, not your GitHub password
# Generate a token using the steps above
```

### To check current git config:
```bash
git config --global --list
```

---

## Quick Test

After setup, test it:

```bash
cd "c:\Users\S\Desktop\23\Flat without brokerage.com"
git push origin main
```

✅ If it pushes without asking for password = Setup successful!
