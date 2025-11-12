# Dashboard System - Quick Visual Guide

## 🎯 What You Get

```
┌─────────────────────────────────────────────┐
│  Compiler Main Page (After Login)          │
│                                             │
│  Navbar:                                    │
│  ┌─────────────────────────────────────┐   │
│  │ [Run] [Debug] [Stop] [Save] [Print]│   │
│  │                                     │   │
│  │ IF USER IS ADMIN:                  │   │
│  │ ┌─────────────────────────────────┐ │   │
│  │ │ Dashboard (Admin)  [RED]         │ │   │
│  │ └─────────────────────────────────┘ │   │
│  │                                     │   │
│  │ IF USER IS REGULAR USER:           │   │
│  │ ┌─────────────────────────────────┐ │   │
│  │ │ Dashboard (User)   [BLUE]        │ │   │
│  │ └─────────────────────────────────┘ │   │
│  │                                     │   │
│  │ [Admin Panel] [Logout]              │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  EDITOR AREA...                             │
└─────────────────────────────────────────────┘
```

## 📊 Role Routing Logic

```
User Clicks "Dashboard" Button
         ↓
    GET /Account/Dashboard
         ↓
Backend Checks: req.session.user.role
         ↓
     ┌───┴──────────────┐
     │                  │
     ↓                  ↓
role='admin'        role='user'
     ↓                  ↓
Serve:             Serve:
Admin Page         User Page
```

## 🛡️ Role Storage (Triple Redundancy)

```
┌──────────────────────────────────────┐
│ After Login, Role Stored In:         │
├──────────────────────────────────────┤
│ 1. COOKIE                            │
│    document.cookie = "role=admin"    │
│    ✓ Sent with every HTTP request    │
│    ✓ Backend can read it             │
│                                       │
│ 2. localStorage                      │
│    localStorage.setItem('role')      │
│    ✓ Persists in browser             │
│    ✓ Fallback if cookie lost         │
│                                       │
│ 3. Session (Backend)                 │
│    req.session.user.role             │
│    ✓ Server-side security            │
│    ✓ Primary source of truth         │
└──────────────────────────────────────┘
```

## 🎮 Helper Functions at a Glance

```javascript
// AUTHENTICATION
isAuthenticated()           // → true/false
requireAuth()              // → true/false
isAdmin()                  // → true/false

// DATA RETRIEVAL
getUserRole()              // → "admin" or "user"
getUsername()              // → "john_doe"
getUserData()              // → { id, username, role, ... }

// INITIALIZATION
initializeDashboard()      // → Setup complete dashboard

// UI CONTROL
hideNonRoleElements()      // → Hide inappropriate content
setupDashboardNavigation() // → Setup role nav
showRoleBadge(role)        // → Display role badge

// ACTION
logoutDashboard()          // → Clear & logout

// DATA
loadDashboardDataByRole()  // → Load admin/user data
```

## 🔍 Debug Checklist

When testing, run these commands in console:

```javascript
[ ] getUserRole()          // Should show role
[ ] isAdmin()              // Should show true/false
[ ] isAuthenticated()      // Should show true
[ ] getUsername()          // Should show your name
[ ] localStorage.getItem('role')  // Should show role
[ ] document.cookie        // Should show role cookie
[ ] initializeDashboard()  // Should reinitialize
```

## 📍 Key Files Location

```
Frontend/
  ├── views/
  │   ├── index.html              [MAIN PAGE - Dashboard buttons]
  │   ├── Dashboard_admin.html    [ADMIN DASHBOARD]
  │   └── Dashboard_User.html     [USER DASHBOARD]
  ├── Routes/
  │   └── dashboard.routes.js     [ROUTING LOGIC]
  ├── Services/login/
  │   └── index.html              [LOGIN - Stores role]
  └── Public/JS/
      └── dashboard-helper.js     [HELPER FUNCTIONS]
```

## 🚦 Login Success Indicators

### If Login Successful ✅
```
Console shows:
  "=== DASHBOARD LOGIC ==="
  "User: john_doe"
  "Role from localStorage: admin"
  "User is ADMIN - showing admin dashboard"
  "Admin dashboard button shown"

Browser shows:
  "Dashboard (Admin)" button appears
  OR
  "Dashboard (User)" button appears
```

### If Login Failed ❌
```
Console shows:
  "User not logged in - showing login button"
  OR
  "ERROR: admin-dashboard-link element not found!"

Browser shows:
  "Login" button instead of dashboard
  OR
  No dashboard buttons visible
```

## 💡 Common Tasks

### Check if I'm an Admin
```javascript
if (isAdmin()) {
  console.log("You are an admin!");
}
```

### Get My Username
```javascript
const name = getUsername();
console.log("Hello, " + name);
```

### Check Who I Am
```javascript
console.log("Username:", getUsername());
console.log("Role:", getUserRole());
console.log("Authenticated:", isAuthenticated());
```

### Logout
```javascript
logoutDashboard();  // Clears everything and logs out
```

### Reinitialize Dashboard
```javascript
initializeDashboard();  // Useful if something went wrong
```

## 🎨 Role Color Coding

```
ADMIN        → Red (#danger)      → "Dashboard (Admin)"
USER         → Blue (#primary)    → "Dashboard (User)"
NOT LOGGED   → Gray (hidden)      → "Login"
```

## 📋 What Each Dashboard Has

### Admin Dashboard
```
✓ System Statistics
✓ User Management
✓ System Settings
✓ Activity Logs
✓ Maintenance Controls
✓ Analytics
✓ Performance Metrics
```

### User Dashboard
```
✓ My Projects
✓ My Progress
✓ Achievements
✓ Learning Path
✓ Profile
✓ Settings
✓ Submissions
```

## ⚡ Quick Start for Developers

### Step 1: Include Helper
```html
<script src="/JS/dashboard-helper.js"></script>
```

### Step 2: Initialize
```javascript
document.addEventListener('DOMContentLoaded', function() {
  initializeDashboard();
});
```

### Step 3: Use Functions
```javascript
const role = getUserRole();  // "admin" or "user"
const name = getUsername();  // "john_doe"
```

### Step 4: Hide Role Content
```html
<!-- Only for admins -->
<div data-admin-only>Admin settings</div>

<!-- Only for users -->
<div data-user-only>My projects</div>
```

## 🐛 Troubleshooting Quick Fix

| Problem | Quick Fix |
|---------|-----------|
| Button not showing | Refresh page |
| Wrong dashboard shows | Clear cache/cookies, relogin |
| Console errors | Check helper.js loaded |
| Functions undefined | Ensure script loaded first |
| Role not storing | Check login response |
| Logout not working | Check backend logout endpoint |

## 📞 Get Help

1. **Check Console** → Look for error messages
2. **Look for Logs** → Find "===" markers in console
3. **Verify Role** → Run `getUserRole()` in console
4. **Read Docs** → See DASHBOARD_FEATURE.md
5. **Check Database** → Verify user role in database

## 🎓 Learning Path

```
1. Understand the flow (read this page)
   ↓
2. Check the architecture (DASHBOARD_ARCHITECTURE.md)
   ↓
3. Read full feature guide (DASHBOARD_FEATURE.md)
   ↓
4. Test all functions
   ↓
5. Add custom role-based content
   ↓
6. Deploy to production
```

---

**Quick Reference Card**  
Print this page or bookmark for quick access!  
Last Updated: November 12, 2025
