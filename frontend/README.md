# FlatWithoutBrokerage - Frontend

Welcome to the FlatWithoutBrokerage frontend application.

## Project Overview

**URL**: https://flatwithoutbrokerage.com

FlatWithoutBrokerage is India's only 100% Free Real Estate Directory. Connect directly with property owners without any brokerage fees.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:8080`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: TanStack Query
- **Routing**: React Router DOM
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── lib/            # Utility functions and configurations
│   ├── hooks/          # Custom React hooks
│   └── main.tsx        # Application entry point
├── public/             # Static assets
└── index.html          # HTML template
```

## Features

- Property listings (buy, rent, sell)
- Direct owner contact
- Advanced search and filters
- User authentication
- Admin dashboard
- WhatsApp integration
- Responsive design

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=your_api_url
VITE_ADMIN_PASSWORD=your_admin_password
```

## Deployment

The application is deployed using Docker. See the main project README for deployment instructions.

## License

Copyright © 2025 FlatWithoutBrokerage. All rights reserved.
