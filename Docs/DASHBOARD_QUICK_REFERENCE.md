# Quick Reference: Role-Based Dashboard

## 🎯 What Was Built

A system where:
- **Admin users** see → `Dashboard_admin.html`
- **Regular users** see → `Dashboard_User.html`
- **Single URL** `/Account/Dashboard` routes to correct dashboard automatically

## ✨ Key Features

✅ **Automatic Role Detection** - Backend checks user role and serves correct dashboard
✅ **Dual Storage** - Role stored in cookies AND localStorage for reliability
✅ **Smart Button Display** - Dashboard buttons on main page show only for logged-in users
✅ **Helper Functions** - Reusable JavaScript functions for common dashboard tasks
✅ **Console Debugging** - Detailed logs show exactly what's happening

## 🚀 Quick Start for Users

### For Admin
1. Login with admin account
2. See "Dashboard (Admin)" in red on main page
3. Click to access admin dashboard

### For Regular User
1. Login with user account
2. See "Dashboard (User)" in blue on main page
3. Click to access user dashboard

## 💻 For Developers

### Add Role-Based Content to Dashboard

**Hide content for non-admins:**
```html
<div data-admin-only>
    Admin only content here
</div>
```

**Hide content for admins:**
```html
<div data-user-only>
    User only content here
</div>
```

### Use Dashboard Helper Functions

```javascript
// Check role
if (isAdmin()) {
    console.log('User is admin');
}

// Get username
const name = getUsername();

// Load role-specific data
loadDashboardDataByRole();

// Logout
logoutDashboard();
```

## 📂 Important Files

| File | Purpose |
|------|---------|
| `Frontend/Routes/dashboard.routes.js` | Routes `/Account/Dashboard` to correct page |
| `Frontend/Public/JS/dashboard-helper.js` | Helper functions for dashboards |
| `Frontend/views/Dashboard_admin.html` | Admin dashboard page |
| `Frontend/views/Dashboard_User.html` | User dashboard page |
| `Frontend/views/index.html` | Main compiler page with dashboard buttons |

## 🔍 Debug Commands

Run these in browser console when logged in:

```javascript
// Check current role
getUserRole()

// Check if admin
isAdmin()

// See all user data
getUserData()

// Check if authenticated
isAuthenticated()

// Get username
getUsername()
```

## 🐛 If Something's Wrong

1. **Dashboard button not showing?**
   - Make sure you're logged in
   - Refresh page
   - Check console for errors

2. **Wrong dashboard loading?**
   - Check: `getUserRole()` in console
   - Verify role in database matches

3. **Helper functions not working?**
   - Make sure dashboard page includes: `<script src="/JS/dashboard-helper.js"></script>`
   - Check console for script loading errors

## 🔄 How It Works (Simple Version)

```
User Logs In
    ↓
Role is saved (cookies + localStorage)
    ↓
User clicks Dashboard button
    ↓
Backend checks role in session
    ↓
Serves admin OR user dashboard
    ↓
Dashboard loads helper script
    ↓
Helper initializes dashboard with user info
    ↓
Role-specific content displays
```

## 📋 Checklist for Testing

- [ ] Login as admin user
- [ ] See "Dashboard (Admin)" button
- [ ] Click and view admin dashboard
- [ ] Logout
- [ ] Login as regular user
- [ ] See "Dashboard (User)" button
- [ ] Click and view user dashboard
- [ ] Check console for role value
- [ ] Test logout from dashboard
- [ ] Verify redirect to login works

## 🎨 UI Elements

**On Main Compiler Page:**
```html
<!-- For Admins Only (Red) -->
<li id="admin-dashboard-link">
    <a href="/Account/Dashboard" class="text-danger">Dashboard (Admin)</a>
</li>

<!-- For Regular Users (Blue) -->
<li id="user-dashboard-link">
    <a href="/Account/Dashboard" class="text-primary">Dashboard (User)</a>
</li>
```

## 📡 API Endpoints (Future)

These will load role-specific data:
- `/api/admin/stats` - Admin statistics
- `/api/user/stats` - User statistics

Currently using mock data, implement as needed.

## 🔐 Security Reminder

1. Always validate user role on **backend**, never trust frontend alone
2. Use tokens with **expiration times**
3. Clear **cookies and storage on logout**
4. Use **HTTPS in production**
5. **Log authentication attempts**

## 📞 Common Issues & Solutions

| Problem | Solution |
|---------|----------|
| Role not storing | Clear cache, check login response includes role |
| Wrong dashboard shows | Verify role in database, check session data |
| Buttons not showing | Ensure JavaScript ran after page load, check console |
| Helper functions undefined | Make sure dashboard-helper.js is loaded first |
| Logout not working | Check console for errors, ensure `/api/auth/logout` exists |

## 📚 Learn More

For detailed information, see:
- `Docs/DASHBOARD_FEATURE.md` - Full documentation
- `Docs/DASHBOARD_IMPLEMENTATION_SUMMARY.md` - Implementation details
- Browser DevTools → Console → Look for logs with "===" 

---

**Status**: ✅ Ready to Use  
**Last Updated**: November 12, 2025
