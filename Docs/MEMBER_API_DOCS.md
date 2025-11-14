# Member API Documentation

## Overview
The Member API provides comprehensive endpoints for managing user members, including profile management, plan upgrades, account suspension, and activity tracking.

## Base URLs
- **Backend API**: `http://localhost:8000/api`
- **Frontend Routes**: `http://localhost:3000/members`

---

## Backend API Endpoints

### Authentication
All endpoints require authentication via JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

---

## GET Endpoints

### 1. Get All Members
**Endpoint**: `GET /api/members`

**Query Parameters**:
- `limit` (default: 20) - Number of members per page
- `page` (default: 1) - Page number
- `role` (optional) - Filter by role ('admin' or 'user')
- `status` (optional) - Filter by status ('active' or 'suspended')
- `search` (optional) - Search by username, email, or fullName

**Example Request**:
```bash
curl -H "Authorization: Bearer token" \
  "http://localhost:8000/api/members?page=1&limit=20&role=user"
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "fullName": "John Doe",
      "role": "user",
      "status": "active",
      "subscription": {
        "plan": "pro"
      },
      "createdAt": "2024-11-14T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

---

### 2. Get Members Statistics
**Endpoint**: `GET /api/members/stats`

**Example Request**:
```bash
curl -H "Authorization: Bearer token" \
  "http://localhost:8000/api/members/stats"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalMembers": 150,
    "byRole": {
      "admin": 5,
      "user": 145
    },
    "byStatus": {
      "active": 140,
      "suspended": 10
    },
    "byPlan": {
      "free": 100,
      "pro": 40,
      "enterprise": 10
    }
  }
}
```

---

### 3. Get Member by ID
**Endpoint**: `GET /api/members/:memberId`

**Parameters**:
- `memberId` - MongoDB ObjectId of the member

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "user",
    "status": "active",
    "subscription": {
      "plan": "pro",
      "upgradeDate": "2024-09-14T10:00:00Z"
    },
    "createdAt": "2024-11-14T10:00:00Z"
  }
}
```

---

### 4. Get Member Profile
**Endpoint**: `GET /api/members/:memberId/profile`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Full-stack developer",
    "role": "user",
    "status": "active",
    "subscription": {
      "plan": "pro"
    },
    "joinDate": "2024-11-14T10:00:00Z",
    "lastLogin": "2024-11-14T15:30:00Z",
    "socialLinks": {
      "github": "https://github.com/johndoe",
      "twitter": "https://twitter.com/johndoe"
    },
    "preferences": {
      "notifications": true,
      "theme": "dark"
    }
  }
}
```

---

### 5. Get Member Activity
**Endpoint**: `GET /api/members/:memberId/activity`

**Query Parameters**:
- `limit` (default: 20) - Number of activities per page
- `page` (default: 1) - Page number

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "action": "login",
      "timestamp": "2024-11-14T15:30:00Z",
      "details": "User logged in"
    },
    {
      "action": "compilation",
      "timestamp": "2024-11-14T15:25:00Z",
      "details": "Code compiled successfully"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20
  }
}
```

---

### 6. Get Member Projects
**Endpoint**: `GET /api/members/:memberId/projects`

**Query Parameters**:
- `limit` (default: 10)
- `page` (default: 1)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Web App",
      "language": "JavaScript",
      "createdAt": "2024-11-14T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5
  }
}
```

---

### 7. Get Member Compilations
**Endpoint**: `GET /api/members/:memberId/compilations`

**Query Parameters**:
- `limit` (default: 10)
- `page` (default: 1)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "language": "JavaScript",
      "status": "success",
      "timestamp": "2024-11-14T15:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25
  }
}
```

---

### 8. Search Members
**Endpoint**: `GET /api/members/search/:query`

**Parameters**:
- `query` - Search term (searches username, email, fullName)

**Query Parameters**:
- `limit` (default: 10) - Max results

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com"
    }
  ],
  "count": 1
}
```

---

## POST Endpoints

### 1. Create New Member
**Endpoint**: `POST /api/members`

**Body**:
```json
{
  "username": "jane_doe",
  "email": "jane@example.com",
  "password": "SecurePass123",
  "fullName": "Jane Doe",
  "role": "user"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Member created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "username": "jane_doe",
    "email": "jane@example.com"
  }
}
```

---

### 2. Upgrade Member Plan
**Endpoint**: `POST /api/members/:memberId/upgrade`

**Body**:
```json
{
  "plan": "pro"
}
```

**Valid Plans**: `free`, `pro`, `enterprise`

**Response**:
```json
{
  "success": true,
  "message": "Plan upgraded to pro",
  "data": {
    "plan": "pro",
    "upgradeDate": "2024-11-14T10:00:00Z"
  }
}
```

---

### 3. Downgrade Member Plan
**Endpoint**: `POST /api/members/:memberId/downgrade`

**Body**:
```json
{
  "plan": "free"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Plan downgraded to free",
  "data": {
    "plan": "free",
    "downgradeDate": "2024-11-14T10:00:00Z"
  }
}
```

---

### 4. Suspend Member
**Endpoint**: `POST /api/members/:memberId/suspend`

**Body**:
```json
{
  "reason": "Violation of terms of service"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Member account suspended",
  "data": {
    "status": "suspended",
    "suspensionReason": "Violation of terms of service",
    "suspendedAt": "2024-11-14T10:00:00Z"
  }
}
```

---

### 5. Activate Member
**Endpoint**: `POST /api/members/:memberId/activate`

**Body**: Empty JSON object `{}`

**Response**:
```json
{
  "success": true,
  "message": "Member account activated",
  "data": {
    "status": "active",
    "suspensionReason": null
  }
}
```

---

## PATCH/PUT Endpoints

### 1. Update Member (Partial)
**Endpoint**: `PATCH /api/members/:memberId`

**Body** (any of these):
```json
{
  "fullName": "John Smith",
  "bio": "Updated bio",
  "status": "active"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Member updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "fullName": "John Smith",
    ...
  }
}
```

---

### 2. Update Member Profile
**Endpoint**: `PUT /api/members/:memberId/profile`

**Body**:
```json
{
  "fullName": "John Doe",
  "bio": "Software developer",
  "avatar": "https://example.com/avatar.jpg",
  "socialLinks": {
    "github": "https://github.com/johndoe",
    "twitter": "https://twitter.com/johndoe"
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "fullName": "John Doe",
    "bio": "Software developer",
    ...
  }
}
```

---

### 3. Update Member Settings
**Endpoint**: `PATCH /api/members/:memberId/settings`

**Body**:
```json
{
  "notifications": {
    "email": true,
    "push": false
  },
  "privacy": {
    "profileVisibility": "public"
  },
  "theme": "dark"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    "notifications": {
      "email": true,
      "push": false
    },
    "privacy": {
      "profileVisibility": "public"
    },
    "theme": "dark"
  }
}
```

---

## DELETE Endpoints

### 1. Delete Member
**Endpoint**: `DELETE /api/members/:memberId`

**Response**:
```json
{
  "success": true,
  "message": "Member deleted successfully"
}
```

---

### 2. Delete All Member Data
**Endpoint**: `DELETE /api/members/:memberId/data`

**Response**:
```json
{
  "success": true,
  "message": "All member data deleted successfully"
}
```

---

## Frontend Routes

### 1. Members Directory
**Route**: `GET /members`

**Purpose**: Display all members in a directory format

---

### 2. Search Members
**Route**: `GET /members/search?q=query`

**Purpose**: Search members by username, email, or name

---

### 3. Member Profile
**Route**: `GET /members/:memberId`

**Purpose**: Display individual member profile

---

### 4. Member Projects
**Route**: `GET /members/:memberId/projects`

**Purpose**: Display member's projects

---

### 5. Member Activity
**Route**: `GET /members/:memberId/activity`

**Purpose**: Display member's activity logs

---

### Admin Routes

### 1. Admin Dashboard
**Route**: `GET /members/admin/dashboard`

**Purpose**: Admin members management dashboard (Admin only)

---

### 2. Edit Member
**Route**: `GET /members/admin/:memberId/edit`

**Purpose**: Edit member page (Admin only)

---

### 3. Update Member
**Route**: `POST /members/admin/:memberId/update`

**Purpose**: Update member from form (Admin only)

---

### 4. Suspend Member
**Route**: `POST /members/admin/:memberId/suspend`

**Purpose**: Suspend member account (Admin only)

---

### 5. Activate Member
**Route**: `POST /members/admin/:memberId/activate`

**Purpose**: Activate member account (Admin only)

---

### 6. Delete Member
**Route**: `POST /members/admin/:memberId/delete`

**Purpose**: Delete member (Admin only)

---

### 7. Upgrade Plan
**Route**: `POST /members/admin/:memberId/upgrade`

**Purpose**: Upgrade member plan (Admin only)

---

### 8. Downgrade Plan
**Route**: `POST /members/admin/:memberId/downgrade`

**Purpose**: Downgrade member plan (Admin only)

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Member not found"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Unauthorized - Admin only"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error information"
}
```

---

## Rate Limiting
- Standard rate limit: 100 requests per 15 minutes per IP
- Admin operations: 50 requests per 15 minutes per IP

---

## Notes
- All timestamps are in ISO 8601 format (UTC)
- Member IDs must be valid MongoDB ObjectIds
- Passwords are hashed and never returned in responses
- Sensitive data (tokens, passwords) are excluded from all responses
