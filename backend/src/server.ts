import app from './app.js';

const PORT = parseInt(process.env.PORT || '5000', 10);

app.listen(PORT, () => {
    console.log(`
🏠 FlatWithoutBrokerage API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server running on http://localhost:${PORT}
🔧 Mode: DEMO (Mock Data)
🏥 Health check: http://localhost:${PORT}/api/v1/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
API Endpoints:
  GET  /api/v1/properties      - List properties
  GET  /api/v1/properties/:id  - Get single property
  GET  /api/v1/search          - Search with filters
  POST /api/v1/auth/send-otp   - Send OTP (demo: 1234)
  POST /api/v1/auth/verify-otp - Login
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});
