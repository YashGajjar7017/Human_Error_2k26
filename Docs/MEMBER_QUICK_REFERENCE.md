# Member Routes - Quick Reference Guide

## 📁 Files Created

| File | Location | Purpose |
|------|----------|---------|
| `member.routes.js` | `/Backend/Routes/` | Backend API routes definition |
| `member.controller.js` | `/Backend/controller/` | Backend business logic |
| `member.middleware.js` | `/Backend/middleware/` | Input validation middleware |
| `Member.routes.js` | `/Frontend/Routes/` | Frontend page routes |
| `member.controller.js` | `/Frontend/controller/` | Frontend page logic |
| `MEMBER_API_DOCS.md` | `/Docs/` | Complete API documentation |
| `MEMBER_ROUTES_IMPLEMENTATION.md` | `/Docs/` | Implementation summary |

## 🚀 Backend API Endpoints (Summary)

### GET Requests
```
GET /api/members                    - Get all members (paginated)
GET /api/members/stats              - Get statistics
GET /api/members/:id                - Get member by ID
GET /api/members/:id/profile        - Get member profile
GET /api/members/:id/activity       - Get activity logs
GET /api/members/:id/projects       - Get member projects
GET /api/members/:id/compilations   - Get compilations
GET /api/members/search/:query      - Search members
```

### POST Requests
```
POST /api/members                   - Create new member
POST /api/members/:id/upgrade       - Upgrade plan
POST /api/members/:id/downgrade     - Downgrade plan
POST /api/members/:id/suspend       - Suspend account
POST /api/members/:id/activate      - Activate account
```

### PATCH/PUT Requests
```
PATCH /api/members/:id              - Update member (partial)
PUT /api/members/:id/profile        - Update profile (full)
PATCH /api/members/:id/settings     - Update settings
```

### DELETE Requests
```
DELETE /api/members/:id             - Delete member
DELETE /api/members/:id/data        - Delete all member data
```

## 🌐 Frontend Routes (Summary)

### Public Routes
```
GET /members                        - Members directory
GET /members/search?q=query         - Search members
GET /members/:id                    - Member profile
GET /members/:id/projects           - Member projects
GET /members/:id/activity           - Member activity
```

### Admin Routes (Protected)
```
GET /members/admin/dashboard        - Admin dashboard
GET /members/admin/:id/edit         - Edit member form
POST /members/admin/:id/update      - Update member
POST /members/admin/:id/suspend     - Suspend member
POST /members/admin/:id/activate    - Activate member
POST /members/admin/:id/delete      - Delete member
POST /members/admin/:id/upgrade     - Upgrade plan
POST /members/admin/:id/downgrade   - Downgrade plan
```

## 📊 Statistics Available

```javascript
{
  totalMembers: Number,
  byRole: {
    admin: Number,
    user: Number
  },
  byStatus: {
    active: Number,
    suspended: Number
  },
  byPlan: {
    free: Number,
    pro: Number,
    enterprise: Number
  }
}
```

## 🔐 Authentication

**Header Required**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Admin Routes Check**:
```javascript
if (req.session?.user?.role !== 'admin') {
  // Unauthorized
}
```

## 📝 Common Request Examples

### Get Members (with filters)
```bash
GET /api/members?page=1&limit=20&role=user&status=active
```

### Search Members
```bash
GET /api/members/search/john
```

### Upgrade Member Plan
```bash
POST /api/members/507f1f77bcf86cd799439011/upgrade
Content-Type: application/json

{
  "plan": "pro"
}
```

### Suspend Member
```bash
POST /api/members/507f1f77bcf86cd799439011/suspend
Content-Type: application/json

{
  "reason": "Violation of terms"
}
```

### Update Member
```bash
PATCH /api/members/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "fullName": "John Smith",
  "bio": "Updated bio"
}
```

## ✅ Validation Rules

| Field | Rules |
|-------|-------|
| username | 3-30 chars, alphanumeric + underscore/dash |
| email | Valid email format |
| password | Min 6 chars |
| fullName | 2-100 chars |
| role | 'user' or 'admin' |
| plan | 'free', 'pro', or 'enterprise' |
| memberId | Valid MongoDB ObjectId |

## 🛡️ Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 403 | Unauthorized (admin only) |
| 404 | Not found |
| 500 | Server error |

## 📚 Response Structure

**Success**:
```json
{
  "success": true,
  "message": "Operation message",
  "data": { /* object or array */ },
  "pagination": { /* if applicable */ }
}
```

**Error**:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* if validation */ ]
}
```

## 🔄 Pagination Parameters

- `page` (default: 1) - Page number
- `limit` (default: 20) - Items per page

## 🎯 Common Use Cases

### List all active users
```
GET /api/members?status=active&role=user&limit=50
```

### Get member with all details
```
GET /api/members/:id/profile
```

### Search for specific member
```
GET /api/members/search/john_doe
```

### Admin: Get stats for dashboard
```
GET /api/members/stats
```

### Admin: Suspend inactive member
```
POST /api/members/:id/suspend
Body: { "reason": "Inactivity for 90 days" }
```

### Admin: Bulk member list
```
GET /api/members?page=1&limit=100
```

## 🚨 Important Notes

1. **Passwords**: Never logged or returned in responses
2. **Tokens**: Excluded from all API responses
3. **Admin Only**: Plan changes and suspensions require admin role
4. **Timestamps**: All in ISO 8601 UTC format
5. **IDs**: Must be valid MongoDB ObjectIds
6. **Search**: Case-insensitive, searches across username/email/fullName

## 🔗 Integration Checklist

- [ ] Backend server registered member routes
- [ ] Frontend server registered member routes
- [ ] JWT token generation implemented
- [ ] Admin role verification working
- [ ] Session middleware configured
- [ ] Database User model has subscription field
- [ ] Axios/HTTP client configured for frontend API calls
- [ ] Error handling implemented
- [ ] Logging implemented

## 📖 Full Documentation

See `MEMBER_API_DOCS.md` for complete endpoint documentation with all parameters and examples.

See `MEMBER_ROUTES_IMPLEMENTATION.md` for implementation details and architecture.
