# Dashboard Feature Documentation

## Overview
The application now features a role-based dashboard system that automatically serves different dashboard pages to admin and regular users. This ensures that each user type sees appropriate content and features based on their role.

## Dashboard Structure

### Files Involved

1. **Frontend Routes** (`Frontend/Routes/dashboard.routes.js`)
   - Common dashboard route that checks user role and serves appropriate page
   - Admin users → `Dashboard_admin.html`
   - Regular users → `Dashboard_User.html`

2. **Dashboard Pages**
   - `Frontend/views/Dashboard_admin.html` - Admin-specific dashboard
   - `Frontend/views/Dashboard_User.html` - User-specific dashboard

3. **Helper Script** (`Frontend/Public/JS/dashboard-helper.js`)
   - Common functions for role-based logic
   - Authentication checks
   - UI updates based on role
   - Logout functionality

4. **Login Handling**
   - `Frontend/Services/login/index.html` - Stores role in cookies and localStorage
   - `Frontend/controller/login.controller.js` - Backend login processing

## How It Works

### 1. Login Process
When a user logs in:
```javascript
// Role is stored in both:
document.cookie = `role=${data.user.role}; path=/`;
localStorage.setItem('role', data.user.role);
```

### 2. Dashboard Access
When user navigates to `/Account/Dashboard`:
```javascript
// Backend checks session role
const userRole = req.session.user?.role || 'user';

if (userRole === 'admin') {
    // Serve admin dashboard
    res.sendFile(path.join(__dirname, '../views/Dashboard_admin.html'));
} else {
    // Serve user dashboard
    res.sendFile(path.join(__dirname, '../views/Dashboard_User.html'));
}
```

### 3. Dashboard Initialization
Each dashboard includes the helper script and initializes with:
```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize common dashboard features
    initializeDashboard();
    
    // Then load role-specific data
    // ... custom dashboard logic
});
```

## Key Functions in dashboard-helper.js

### Authentication Functions
- `isAuthenticated()` - Check if user is logged in
- `requireAuth()` - Redirect to login if not authenticated
- `isAdmin()` - Check if user has admin role

### User Data Functions
- `getUsername()` - Get current username
- `getUserRole()` - Get current user role
- `getUserData()` - Get full user object

### Dashboard Functions
- `initializeDashboard()` - Initialize dashboard with user info
- `hideNonRoleElements()` - Hide elements not meant for this role
- `setupDashboardNavigation()` - Setup role-specific navigation
- `logoutDashboard()` - Logout function

### Data Loading
- `loadDashboardDataByRole()` - Load role-appropriate data
- `loadAdminDashboardData()` - Load admin stats
- `loadUserDashboardData()` - Load user stats

## How to Use in HTML

### Include the Helper Script
```html
<script src="/JS/dashboard-helper.js"></script>
```

### Initialize on Page Load
```html
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Initialize common dashboard features
        initializeDashboard();
        
        // Your custom dashboard logic here
    });
</script>
```

### Use Helper Functions
```javascript
// Check if admin
if (isAdmin()) {
    // Show admin features
}

// Get username
const username = getUsername();

// Logout
logoutDashboard();
```

## Role-Based Content Display

### Hide Elements by Role
Use data attributes to control visibility:

**For Admin Only:**
```html
<div data-admin-only>
    Admin content here
</div>
```

**For Users Only:**
```html
<div data-user-only>
    User content here
</div>
```

The helper function `hideNonRoleElements()` will automatically hide non-applicable content.

## URL Mapping

| URL | Behavior |
|-----|----------|
| `/Account/Dashboard` | Routes to admin or user dashboard based on role |
| `/Account/Dashboard/analytics` | Analytics page |
| `/Account/Dashboard/achievements` | Achievements page |
| `/Account/Dashboard/collaboration` | Collaboration page |

## API Endpoints Used

The dashboard helper attempts to fetch role-specific data from:

- `/api/admin/stats` - Admin statistics (for admin users)
- `/api/user/stats` - User statistics (for regular users)

## Cookie and Storage

### Cookies Set During Login
```
username: ${username}
role: ${user.role}
token: ${auth_token}
```

### LocalStorage Set During Login
```
token: ${token}
user: ${user_object}
role: ${user.role}
```

## Logout Process

The `logoutDashboard()` function:
1. Clears all cookies
2. Clears localStorage and sessionStorage
3. Sends logout request to backend
4. Redirects to login page

## Security Considerations

1. **Backend Authentication**: Always verify user role on backend before serving sensitive data
2. **Token Validation**: Tokens should be validated on every API request
3. **Session Management**: Sessions timeout based on backend configuration
4. **HTTPS**: In production, ensure HTTPS is enabled for cookie security

## Customization

### Adding Admin-Specific Features
1. Add element with `data-admin-only` attribute
2. Element will be hidden for non-admin users automatically

### Adding Custom Data Loading
Extend the helper functions:
```javascript
// Override loadAdminDashboardData
function loadAdminDashboardData() {
    console.log('Loading admin dashboard data...');
    // Your custom logic
    fetch('/api/admin/custom-data')
        .then(response => response.json())
        .then(data => {
            // Update dashboard
        });
}
```

## Troubleshooting

### Dashboard Not Loading Correctly
1. Check browser console for errors
2. Verify user is authenticated: `isAuthenticated()`
3. Check role value: `getUserRole()`
4. Look for console logs with "=== DASHBOARD LOGIC ===" 

### Role Not Being Set
1. Check if cookies are enabled
2. Verify role is returned from login API
3. Check localStorage: `localStorage.getItem('role')`
4. Check cookies: `document.cookie`

### Elements Not Hiding/Showing
1. Ensure helper script is loaded before custom JavaScript
2. Verify data attributes are correct (case-sensitive)
3. Check if `hideNonRoleElements()` is being called

## Browser Console Debugging

When logged in and on dashboard, you can check:
```javascript
// Get role
getUserRole()

// Check if admin
isAdmin()

// Get user data
getUserData()

// Reload dashboard
location.reload()
```

## Future Enhancements

1. Add role-based API endpoints for stats
2. Implement caching for dashboard data
3. Add real-time notifications for admin
4. Create role management system
5. Add audit logging for admin actions

## Support

For issues or questions about the dashboard feature:
1. Check browser console for error messages
2. Review console logs with "===" markers
3. Verify user role in database
4. Check session data on backend
