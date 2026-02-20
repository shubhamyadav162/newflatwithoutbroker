# Admin Panel - FlatWithoutBrokerage

## 🎯 Overview
Complete Master Control Panel for managing the FlatWithoutBrokerage platform with real-time analytics, user management, property management, and contact tracking.

---

## 🔐 How to Access

### Method 1: Direct URL
Navigate to: `https://flatwithoutbrokerage.com/admin`

### Method 2: Create Admin User
To make a user an admin, you need to manually update their role in the database:

```sql
-- Open your PostgreSQL database
-- Run this command to make a user an admin
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';

-- Or by phone number
UPDATE "User" SET role = 'ADMIN' WHERE phone = '919876543210';
```

### Method 3: Via Node.js Script
Create a temporary script to make yourself an admin:

```javascript
// make-admin.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeAdmin() {
  const email = 'your-email@example.com'; // Change this
  await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' }
  });
  console.log('User is now an admin!');
}

makeAdmin();
```

Run it:
```bash
cd backend
node make-admin.js
```

---

## ✨ Features

### 📊 Dashboard
- Real-time statistics
- User count & growth
- Property listings & trends
- Contact activity
- Live auto-refresh (30 seconds)
- Recent activity feed

### 👥 User Management
- View all users with pagination
- Search by name, email, phone
- Filter by role and verification status
- Edit user details
- Update user role (Buyer/Owner/Admin)
- Manage user credits
- Delete users
- View user's properties and contact history

### 🏠 Property Management
- View all properties with pagination
- Advanced search and filters
- Filter by type, status, city, price range
- Update property status (Active/Sold/Rented/Inactive)
- Delete properties
- View property stats (views, contacts)

### 📞 Contact Tracking
- Complete contact exchange history
- Viewer and owner details
- Property information
- Timestamp tracking

### 📈 Analytics
- User growth charts (7/30/90 days)
- Listing trends over time
- Contact activity patterns
- Top cities by properties
- Properties by type distribution
- Users by role distribution
- Visual bar charts

---

## 🔒 Security Features

- Admin-only access (role-based)
- Protected API routes
- JWT authentication required
- Automatic session validation
- Access denied for non-admin users

---

## 🚀 Deployment

The admin panel is already integrated into your application! Just:

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **The admin panel will be available at:**
   - `https://flatwithoutbrokerage.com/admin`

3. **Make yourself an admin** (see instructions above)

4. **Login with your admin account**
   - Go to `/login`
   - Login with Google or Phone
   - Navigate to `/admin`
   - You'll see the full admin dashboard!

---

## 📁 Files Created

### Backend
```
backend/src/
  ├── routes/admin.routes.ts       # Admin API endpoints
  ├── controllers/admin.controller.ts  # Admin logic
  ├── services/admin.service.ts    # Admin operations
  └── middlewares/adminAuth.ts     # Admin authentication
```

### Frontend
```
frontend/src/
  ├── pages/admin/
  │   ├── AdminDashboard.tsx       # Main dashboard
  │   ├── AdminUsers.tsx           # User management
  │   ├── AdminProperties.tsx      # Property management
  │   ├── AdminContacts.tsx        # Contact history
  │   └── AdminAnalytics.tsx       # Analytics & charts
  └── components/admin/
      └── AdminLayout.tsx           # Admin layout with sidebar
```

---

## 🎨 UI/UX Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark sidebar navigation
- ✅ Loading skeletons
- ✅ Toast notifications
- ✅ Confirmation dialogs
- ✅ Pagination
- ✅ Advanced filters
- ✅ Real-time data refresh
- ✅ Beautiful animations
- ✅ Professional color scheme

---

## 🛠️ API Endpoints

All endpoints require Admin role:

```
GET  /admin/stats/dashboard      # Dashboard stats
GET  /admin/users                # Get all users (with filters)
GET  /admin/users/:id            # Get single user
PATCH /admin/users/:id            # Update user
DELETE /admin/users/:id           # Delete user
GET  /admin/properties           # Get all properties (with filters)
PATCH /admin/properties/:id/status  # Update property status
DELETE /admin/properties/:id      # Delete property
GET  /admin/contacts             # Get contact history
GET  /admin/analytics            # Get analytics data
GET  /admin/activity-logs        # Get recent activity
```

---

## 💡 Tips

1. **First Time Setup**: Make yourself an admin using the SQL query above
2. **Auto-Refresh**: Dashboard auto-refreshes every 30 seconds
3. **Export**: Coming soon - export data to CSV/Excel
4. **Performance**: Optimized queries with pagination
5. **Security**: All routes protected with admin middleware

---

## 🐛 Troubleshooting

### "Access Denied" Error
- Make sure your user role is set to 'ADMIN' in the database
- Try logging out and logging back in
- Clear your browser cache

### Data Not Loading
- Check browser console for errors
- Verify backend is running
- Check your network connection
- Ensure JWT token is valid

### Charts Not Displaying
- Make sure you have data in the database
- Try changing the date range filter
- Refresh the page

---

## 📞 Support

For issues or questions, check the code comments or contact the development team.

---

**Built with ❤️ for FlatWithoutBrokerage**
