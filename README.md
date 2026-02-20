# FlatWithoutBrokerage.com

> A NoBroker alternative - 100% Free Real Estate Directory

## 🚀 Quick Start (Local Development)

```bash
# Backend
cd backend
npm install
npm run dev  # Runs on http://localhost:5000

# Frontend
cd frontend
npm install
npm run dev  # Runs on http://localhost:8080
```

## 🐳 Docker Deployment (VPS)

```bash
# Clone the repository
git clone https://github.com/shubhamyadav162/Flat-without-brokerage.git
cd Flat-without-brokerage

# Start all services
docker compose up -d

# Access the app
# Frontend: http://your-vps-ip:3080
# API: http://your-vps-ip:3080/api/v1/health
```

## 📁 Project Structure

```
├── frontend/          # React + Vite + Tailwind
├── backend/           # Node.js + Express + Prisma
├── docker-compose.yml # Production deployment
└── .github/workflows/ # CI/CD pipeline
```

## 🔐 Environment Variables

For VPS deployment, set these GitHub Secrets:
- `VPS_HOST` - VPS IP address
- `VPS_USER` - SSH username (root)
- `VPS_SSH_KEY` - Private SSH key

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/health` | GET | Health check |
| `/api/v1/properties` | GET | List properties |
| `/api/v1/search` | GET | Search with filters |
| `/api/v1/auth/send-otp` | POST | Send OTP |
| `/api/v1/auth/verify-otp` | POST | Login |

## 🎨 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, Prisma, PostgreSQL
- **Deployment**: Docker, GitHub Actions, Nginx
