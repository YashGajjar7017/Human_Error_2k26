# User Role System Documentation

## Overview
This project uses a **two-tier role system** for users:
1. **Admin** - Full access to admin dashboard and admin features
2. **User** - Regular user access to user dashboard

---

## How Roles Work

### 1. **Role Assignment** (Backend)
When a user logs in, the backend API returns a user object with a `role` property:

```javascript
{
  id: 1,
  username: "john_admin",
  email: "john@example.com",
  role: "admin"  // ← Role assigned here
}
```

### 2. **Role Storage** (Frontend Session)
The login controller stores the role in the session:
```javascript
// From: Frontend/controller/login.controller.js
req.session.user = {
    id: response.user.id,
    username: response.user.username,
    email: response.user.email,
    role: response.user.role,  // ← Stored in session
    token: response.token
};
```

### 3. **Role-Based Routing** (Dashboard)
The dashboard routes check the user's role and serve appropriate pages:

```javascript
// From: Frontend/Routes/dashboard.routes.js
const userRole = req.session.user?.role || 'user';  // Defaults to 'user' if not set

if (userRole === 'admin') {
    // Serve admin dashboard
    res.sendFile(path.join(__dirname, '../views/Dashboard_admin.html'));
} else {
    // Serve regular user dashboard
    res.sendFile(path.join(__dirname, '../views/Dashboard_User.html'));
}
```

---

## User Controller Logic

### Dashboard Endpoint
```javascript
exports.Dashboard = (req, res, next) => {
    if (req.session.authenticated && req.session.user) {
        const userRole = req.session.user.role || 'user';
        
        if (userRole === 'admin') {
            res.redirect('/Account/Dashboard');  // → Admin dashboard
            return;
        }
        
        // Regular user dashboard
        res.sendFile(path.join(rootDir, 'views', 'Dashboard_User.html'));
    } else {
        res.redirect('/Account/login/');
    }
};
```

---

## Role Default Value
If the backend doesn't explicitly set a role, the system defaults to `'user'`:

```javascript
const userRole = req.session.user.role || 'user';  // Fallback to 'user'
```

This ensures regular users can access their dashboard even if the backend hasn't explicitly assigned a role.

---

## Files Involved

| File | Purpose |
|------|---------|
| `Frontend/controller/login.controller.js` | Stores role in session after login |
| `Frontend/controller/user.controller.js` | Routes users based on role |
| `Frontend/Routes/dashboard.routes.js` | Common dashboard endpoint that routes based on role |
| `Frontend/views/Dashboard_admin.html` | Admin-only dashboard |
| `Frontend/views/Dashboard_User.html` | Regular user dashboard |

---

## How to Add Roles to Users

### Scenario 1: Backend Returns Role
Ensure your backend login API returns the `role` field:
```json
{
  "success": true,
  "user": {
    "id": 123,
    "username": "john",
    "email": "john@example.com",
    "role": "admin"  // ← Backend must set this
  }
}
```

### Scenario 2: Fallback Role
If backend doesn't set role, the system automatically assigns `'user'` role:
```javascript
const userRole = req.session.user.role || 'user';
```

---

## Frontend Client-Side Role Detection

The frontend can also read the role from:

1. **Session/Cookie**: The role is sent to the client in the login response
2. **Local check**: JavaScript can read the user role and conditionally show/hide admin features

---

## Summary

✅ **Admin users** → Redirected to `/Account/Dashboard` (admin panel)  
✅ **Regular users** → Served `Dashboard_User.html` (user panel)  
✅ **Default role** → `'user'` if not explicitly set
