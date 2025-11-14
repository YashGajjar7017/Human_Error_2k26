# User Role Flow Diagram

## Login Flow with Role Assignment

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER LOGIN PROCESS                          │
└─────────────────────────────────────────────────────────────────┘

1. User Submits Login Form
   │
   ├─ Username: "john"
   ├─ Password: "password123"
   └─ Endpoint: POST /login

2. Backend Authentication
   │
   ├─ Validates credentials in database
   ├─ Checks user table
   └─ Returns user object WITH ROLE:
      
      {
        id: 1,
        username: "john",
        email: "john@example.com",
        role: "user"  ← ← ← BACKEND ASSIGNS ROLE HERE
      }

3. Frontend Stores Role in Session
   │
   └─ req.session.user = {
        id: 1,
        username: "john",
        email: "john@example.com",
        role: "user"  ← ← ← STORED IN SESSION
      }

4. Send Login Response to Client
   │
   └─ Response includes user object with role

5. User Accesses Dashboard (/Account/Dashboard)
   │
   └─ Hit endpoint

┌──────────────────────────────────────────────────────────────────┐
│                   ROLE-BASED ROUTING                             │
└──────────────────────────────────────────────────────────────────┘

Dashboard Route Handler
  │
  ├─ Get userRole from session: req.session.user.role
  │
  ├─ IF userRole === 'admin'
  │  │
  │  └─→ Redirect to /Account/Dashboard (admin panel)
  │      Serve: Dashboard_admin.html
  │
  └─ ELSE (userRole === 'user' or default)
     │
     └─→ Serve: Dashboard_User.html

┌──────────────────────────────────────────────────────────────────┐
│                      RESULT                                      │
└──────────────────────────────────────────────────────────────────┘

ADMIN USER                          REGULAR USER
┌─────────────────────────┐        ┌─────────────────────────┐
│  Admin Dashboard        │        │  User Dashboard         │
│  ─────────────────────  │        │  ─────────────────────  │
│  • User Management      │        │  • My Profile           │
│  • Analytics            │        │  • Achievements         │
│  • System Settings      │        │  • Collaboration        │
│  • Reports              │        │  • Progress Tracking    │
│  • Admin Features       │        │                         │
└─────────────────────────┘        └─────────────────────────┘
```

---

## Code Flow (Detailed)

```javascript
// Step 1: LOGIN CONTROLLER - Stores role from backend
Frontend/controller/login.controller.js

req.session.user = {
    id: response.user.id,
    username: response.user.username,
    email: response.user.email,
    role: response.user.role,  ← ← ← FROM BACKEND
    token: response.token
};

// Step 2: DASHBOARD CONTROLLER - Routes based on role
Frontend/controller/user.controller.js

exports.Dashboard = (req, res, next) => {
    const userRole = req.session.user.role || 'user';  // Default: 'user'
    
    if (userRole === 'admin') {
        res.redirect('/Account/Dashboard');  // Admin path
    } else {
        res.sendFile(path.join(rootDir, 'views', 'Dashboard_User.html'));
    }
};

// Step 3: DASHBOARD ROUTES - Also check role
Frontend/Routes/dashboard.routes.js

router.get('/', requireAuth, (req, res) => {
    const userRole = req.session.user?.role || 'user';
    
    if (userRole === 'admin') {
        res.sendFile(path.join(__dirname, '../views/Dashboard_admin.html'));
    } else {
        res.sendFile(path.join(__dirname, '../views/Dashboard_User.html'));
    }
});
```

---

## Role Comparison Table

| Feature | Admin | User |
|---------|-------|------|
| **Dashboard Access** | Admin Dashboard | User Dashboard |
| **Manage Users** | ✅ Yes | ❌ No |
| **View Analytics** | ✅ Yes | ✅ Yes (limited) |
| **Edit Settings** | ✅ Yes | ❌ No |
| **Access Reports** | ✅ Yes | ❌ No |
| **View Profile** | ✅ Yes | ✅ Yes |
| **Achievements** | ✅ Yes | ✅ Yes |

---

## How Backend Should Assign Roles

Your backend should determine a user's role based on:
- User type flag in database
- User table has `role` or `type` column
- Admin users have role = 'admin'
- Regular users have role = 'user'

**Example Backend User Table:**
```sql
CREATE TABLE users (
    id INT PRIMARY KEY,
    username VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(255),
    role ENUM('admin', 'user') DEFAULT 'user'  ← Role field
);
```

---

## Summary

✅ Backend API must return a `role` field for every user  
✅ Frontend stores this role in the session  
✅ Dashboard routing checks the role and serves appropriate HTML  
✅ Admins see admin dashboard, regular users see user dashboard  
✅ Default role is 'user' if not explicitly set
