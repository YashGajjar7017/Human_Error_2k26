# Dashboard System Architecture & Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Browser)                               │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Main Compiler Page (index.html)                                │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │ Navbar                                                  │    │   │
│  │  │ ┌─────────────────────────────────────────────────────┐ │    │   │
│  │  │ │ Dashboard (Admin) ← Only shows if role='admin'    │ │    │   │
│  │  │ │ Dashboard (User)  ← Only shows if role='user'     │ │    │   │
│  │  │ └─────────────────────────────────────────────────────┘ │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Login Page (Services/login/index.html)                         │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │ Stores role in:                                         │    │   │
│  │  │ • Cookies: document.cookie = "role=admin"             │    │   │
│  │  │ • LocalStorage: localStorage.setItem('role', role)    │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Dashboard Pages                                                │   │
│  │  ┌──────────────────────┐    ┌──────────────────────┐          │   │
│  │  │ Dashboard_admin.html │    │ Dashboard_User.html  │          │   │
│  │  │                      │    │                      │          │   │
│  │  │ Includes:            │    │ Includes:            │          │   │
│  │  │ • Helper script      │    │ • Helper script      │          │   │
│  │  │ • Admin features     │    │ • User features      │          │   │
│  │  └──────────────────────┘    └──────────────────────┘          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Dashboard Helper Script (Public/JS/dashboard-helper.js)        │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │ Functions:                                              │    │   │
│  │  │ • initializeDashboard()                                 │    │   │
│  │  │ • getUserRole()                                         │    │   │
│  │  │ • hideNonRoleElements()                                 │    │   │
│  │  │ • logoutDashboard()                                     │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    ↕
                              HTTP Requests
                                    ↕
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Node.js/Express)                       │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Routes                                                          │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │ POST /Account/login                                      │   │   │
│  │  │ → login.controller.js → User.model.js                   │   │   │
│  │  │ → Returns: { success, user: { role, ... } }             │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  │                                                                  │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │ GET /Account/Dashboard                                   │   │   │
│  │  │ → dashboard.routes.js                                   │   │   │
│  │  │ → if role === 'admin'                                  │   │   │
│  │  │     → serve Dashboard_admin.html                        │   │   │
│  │  │ → else                                                 │   │   │
│  │  │     → serve Dashboard_User.html                         │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  Database                                                        │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │ Users Collection                                         │   │   │
│  │  │ {                                                        │   │   │
│  │  │   username: "john",                                     │   │   │
│  │  │   email: "john@example.com",                            │   │   │
│  │  │   role: "admin" OR "user"  ← KEY FIELD                 │   │   │
│  │  │ }                                                        │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## User Login & Dashboard Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ User Opens Browser                                              │
└────────────┬────────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────────┐
│ Navigate to Login Page: /Account/login                         │
└────────────┬────────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────────┐
│ Enter Credentials                                              │
│ ┌──────────────────────────────────────────────────────────┐   │
│ │ Username: [john]                                         │   │
│ │ Password: [****]                                         │   │
│ │ [Login Button]                                           │   │
│ └──────────────────────────────────────────────────────────┘   │
└────────────┬────────────────────────────────────────────────────┘
             │
             ↓ POST /Account/login
             │
┌─────────────────────────────────────────────────────────────────┐
│ Backend: Verify Credentials                                    │
│ • Check username in database                                  │
│ • Verify password                                            │
│ • Get user role from database                               │
└────────────┬────────────────────────────────────────────────────┘
             │
             ↓ Return Response
             │
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: Receives Response                                    │
│ {                                                              │
│   "success": true,                                            │
│   "user": {                                                   │
│     "username": "john",                                       │
│     "role": "admin"  ← IMPORTANT                             │
│   },                                                          │
│   "token": "eyJhbG..."                                        │
│ }                                                              │
└────────────┬────────────────────────────────────────────────────┘
             │
             ↓ Store Role in Frontend
             │
     ┌───────┴──────────────┬──────────────┐
     │                      │              │
     ↓                      ↓              ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Cookies      │  │ LocalStorage │  │ Session      │
├──────────────┤  ├──────────────┤  ├──────────────┤
│ role=admin   │  │ role: "admin"│  │ Session data │
│ username=... │  │ token: "..." │  │ with role    │
└──────────────┘  └──────────────┘  └──────────────┘
     │                      │              │
     └───────┬──────────────┴──────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────────┐
│ Redirect to Main Page: /                                       │
│ JavaScript checks role:                                        │
│ if (role === 'admin') {                                        │
│   show "Dashboard (Admin)" button                              │
│ } else {                                                       │
│   show "Dashboard (User)" button                               │
│ }                                                              │
└────────────┬────────────────────────────────────────────────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────────┐
│ User Clicks Dashboard Button                                   │
│ [Dashboard (Admin)] ← For admins                              │
│ OR                                                             │
│ [Dashboard (User)] ← For users                                │
└────────────┬────────────────────────────────────────────────────┘
             │
             ↓ Navigate to /Account/Dashboard
             │
┌─────────────────────────────────────────────────────────────────┐
│ Backend Route Handler                                          │
│ GET /Account/Dashboard                                         │
│                                                                │
│ Check: req.session.user.role                                  │
│                                                                │
│ if (role === 'admin') {                                        │
│   sendFile('Dashboard_admin.html')                             │
│ } else {                                                       │
│   sendFile('Dashboard_User.html')                              │
│ }                                                              │
└────────────┬────────────────────────────────────────────────────┘
             │
             ↓
    ┌────────┴────────┐
    │                 │
    ↓                 ↓
┌──────────────┐  ┌──────────────┐
│ Admin Dash   │  │ User Dash    │
├──────────────┤  ├──────────────┤
│ • Stats      │  │ • Projects   │
│ • Users      │  │ • Progress   │
│ • Settings   │  │ • Tutorials  │
│ • Logs       │  │ • Profile    │
└──────────────┘  └──────────────┘
```

## Helper Script Initialization Flow

```
┌──────────────────────────────────────────────────────┐
│ Dashboard Page Loads                                 │
│ (Dashboard_admin.html OR Dashboard_User.html)       │
└──────────────┬───────────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────────┐
│ <script src="/JS/dashboard-helper.js"></script>     │
│ Script loads in background                          │
│ All helper functions now available                  │
└──────────────┬───────────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────────┐
│ DOMContentLoaded event fires                        │
│ (When all HTML is parsed)                           │
└──────────────┬───────────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────────┐
│ Call: initializeDashboard()                         │
└──────────────┬───────────────────────────────────────┘
               │
       ┌───────┴──────────────┬──────────────┐
       │                      │              │
       ↓                      ↓              ↓
   ┌────────┐         ┌──────────┐      ┌──────────┐
   │Check   │         │Get User  │      │Hide Non- │
   │Auth    │         │Data      │      │Role      │
   │Status  │         │          │      │Elements  │
   └────────┘         └──────────┘      └──────────┘
       │                      │              │
       └───────┬──────────────┴──────────────┘
               │
               ↓
┌──────────────────────────────────────────────────────┐
│ Setup Navigation & Logout                           │
└──────────────┬───────────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────────┐
│ Load Role-Specific Data                             │
│ if (admin) loadAdminDashboardData()                │
│ else loadUserDashboardData()                       │
└──────────────┬───────────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────────┐
│ Dashboard Ready!                                     │
│ User sees appropriate content and features         │
└──────────────────────────────────────────────────────┘
```

## Data Flow: Login to Dashboard Access

```
User Credentials
    │
    ↓
POST /Account/login
    │
    ├─→ (Backend) Validate user
    │   └─→ Query Database
    │       └─→ Find user by username
    │
    ├─→ (Backend) Check password
    │   └─→ Compare with stored hash
    │
    ├─→ (Backend) Get user role
    │   └─→ role = "admin" OR "user"
    │
    ├─→ (Backend) Return response
    │   └─→ {success, user, token}
    │       └─→ user.role = "admin"
    │
    ├─→ (Frontend) Store role
    │   ├─→ Cookies
    │   └─→ LocalStorage
    │
    ├─→ (Frontend) Navigate to /
    │   └─→ Show Dashboard button
    │
    ├─→ User clicks Dashboard
    │
    ├─→ GET /Account/Dashboard
    │   └─→ (Backend) Read role from session
    │       └─→ if admin → Dashboard_admin.html
    │       └─→ if user → Dashboard_User.html
    │
    ├─→ (Frontend) Load dashboard HTML
    │   └─→ Include helper script
    │
    ├─→ (Frontend) DOMContentLoaded
    │   └─→ Call initializeDashboard()
    │       ├─→ Get role from cookie/localStorage
    │       ├─→ Hide non-role elements
    │       └─→ Load role data
    │
    └─→ Dashboard Rendered with Correct Content
```

## Role-Based Element Visibility

```
┌───────────────────────────────────────────────────────┐
│ Dashboard Page with Helper Script                    │
└───────────────────────────────────────────────────────┘
                        │
                        ↓
        ┌───────────────┴───────────────┐
        │                               │
        ↓                               ↓
    Check: isAdmin()
        │
        ├─ YES (role='admin')
        │       ↓
        │   ┌─────────────────────────┐
        │   │ Show:                   │
        │   │ • Admin stats           │
        │   │ • User management       │
        │   │ • System settings       │
        │   │ • Maintenance options   │
        │   │                         │
        │   │ Hide:                   │
        │   │ • [data-user-only]      │
        │   └─────────────────────────┘
        │
        └─ NO (role='user')
                ↓
            ┌─────────────────────────┐
            │ Show:                   │
            │ • My projects           │
            │ • My progress           │
            │ • Achievements          │
            │ • Profile settings      │
            │                         │
            │ Hide:                   │
            │ • [data-admin-only]     │
            └─────────────────────────┘
```

---

**Legend:**
- → : Process flow
- ↓ : Data/control passes to next step
- [ ] : User input or action
- < > : API endpoint or function call
