# New Features Implementation Guide

## Overview

This document outlines all the new features added to the Human Error Platform.

---

## 1. GCC-Based Code Debugger & Compiler

### Features

- **Compile with Debug Symbols**: Compile user code with `-g` flag for debugging
- **GDB Integration**: Run GDB debugger with breakpoints support
- **Multi-language Support**: C, C++, Java, Python
- **Error Line Detection**: Show exact line numbers where compilation errors occur
- **Activity Logging**: Track compilation and debugging activities per user

### API Endpoints

#### Compile Code with Debug Symbols

```
POST /api/debugger/compile
Body: {
    "code": "C/C++ source code",
    "language": "c|cpp|java|python",
    "filename": "program",
    "userId": "user_id"
}
Response: {
    "success": true,
    "sessionId": "debug_session_id",
    "executable": "/path/to/executable",
    "debugFile": "/path/to/debug.o"
}
```

#### Compile and Run Code

```
POST /api/debugger/run
Body: {
    "code": "source code",
    "language": "c|cpp",
    "input": "stdin input",
    "userId": "user_id"
}
Response: {
    "success": true,
    "output": "program output",
    "sessionId": "session_id"
}
```

#### Run Debugger with GDB

```
POST /api/debugger/debug
Body: {
    "sessionId": "debug_session_id",
    "breakpoints": ["main", "12", "function_name"],
    "command": "run|continue|next",
    "userId": "user_id"
}
Response: {
    "success": true,
    "output": "GDB output",
    "errors": "GDB errors"
}
```

#### Get Debug Session Information

```
GET /api/debugger/debug/:sessionId
Response: {
    "success": true,
    "data": {
        "sessionId": "...",
        "sourceFile": "source code content",
        "hasDebugSymbols": true,
        "files": ["list of files in session"]
    }
}
```

#### Get Supported Languages

```
GET /api/debugger/languages
Response: {
    "success": true,
    "languages": {
        "c": { "compiler": "gcc", "extension": "c", "debuggable": true },
        ...
    }
}
```

### Usage Example (JavaScript)

```javascript
// Create a compile session
const compileRes = await fetch("/api/debugger/compile", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    code: '#include <stdio.h>\nint main() { printf("Hello"); return 0; }',
    language: "c",
    userId: userID,
  }),
});

const { sessionId } = await compileRes.json();

// Run debugger with breakpoint at main
const debugRes = await fetch("/api/debugger/debug", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    sessionId,
    breakpoints: ["main"],
    command: "run",
  }),
});
```

---

## 2. Route Flow Management System

### Features

- **Complete Route Extraction**: Automatically extracts all routes from Express app
- **Visual Flow Diagrams**: ASCII art representation of route structure
- **Route Statistics**: Get breakdown by method, section, protection level
- **Route Search**: Search routes by path, method, or handler
- **Route Tree**: Hierarchical view of all API sections

### API Endpoints

#### Get Route Flow Structure

```
GET /api/routes/flow
Response: {
    "success": true,
    "data": {
        "timestamp": "2024-01-03T...",
        "totalRoutes": 45,
        "sections": {
            "/api/auth": {
                "description": "...",
                "count": 5,
                "routes": [...]
            },
            ...
        }
    }
}
```

#### Get ASCII Flow Diagram

```
GET /api/routes/diagram
Response: (Text content - ASCII diagram)
═════════════════════════════════════════════════════
API ROUTE FLOW STRUCTURE
═════════════════════════════════════════════════════

┌─ /API/AUTH [POST, GET]
│
│ ├── POST /api/auth/login
│ ├── POST /api/auth/register
│ ├── GET  /api/auth/me
...
```

#### Get Route Tree Structure

```
GET /api/routes/tree
Response: {
    "success": true,
    "data": {
        "/api/auth": { "methods": ["POST", "GET"], "routeCount": 5 },
        "/api/users": { "methods": ["GET", "POST", "PUT"], "routeCount": 4 },
        ...
    }
}
```

#### Get Routes by Section

```
GET /api/routes/section/auth
Response: {
    "success": true,
    "section": "/api/auth",
    "count": 5,
    "routes": [
        { "method": "POST", "path": "/api/auth/login", "authenticated": false },
        ...
    ]
}
```

#### Get Routes by HTTP Method

```
GET /api/routes/method/POST
Response: {
    "success": true,
    "method": "POST",
    "count": 20,
    "routes": [...]
}
```

#### Get Protected Routes (Auth Required)

```
GET /api/routes/protected
Response: {
    "success": true,
    "count": 30,
    "routes": [...]
}
```

#### Get Public Routes (No Auth)

```
GET /api/routes/public
Response: {
    "success": true,
    "count": 15,
    "routes": [...]
}
```

#### Search Routes

```
GET /api/routes/search?q=user
Response: {
    "success": true,
    "query": "user",
    "count": 8,
    "routes": [...]
}
```

#### Get Route Statistics

```
GET /api/routes/stats
Response: {
    "success": true,
    "statistics": {
        "totalRoutes": 45,
        "protectedRoutes": 30,
        "publicRoutes": 15,
        "sections": 8,
        "methodBreakdown": {
            "GET": 15,
            "POST": 20,
            "PUT": 7,
            "DELETE": 3
        }
    }
}
```

#### Refresh Route Extraction (Admin Only)

```
POST /api/routes/refresh
Headers: { "Authorization": "Bearer token" }
Response: {
    "success": true,
    "message": "Routes refreshed",
    "totalRoutes": 45
}
```

---

## 3. OTP Email System (Fixed & Improved)

### Features

- **Retry Logic**: Automatically retries email sending up to 3 times
- **HTML Email Templates**: Beautiful formatted emails with branding
- **Multiple Email Purposes**: signup, password_reset, email_verification
- **Rate Limiting**: Prevents spam with built-in rate limits
- **Error Handling**: Detailed error messages and fallback mechanisms

### Enhanced Email Service

#### Email Templates Available

1. **OTP Verification Email** - For signup and verification
2. **Password Reset Email** - With reset link and code
3. **Welcome Email** - Upon successful registration
4. **Verification Success Email** - After email confirmation

### API Endpoints

#### Send OTP (Improved)

```
POST /api/otp/send
Body: {
    "email": "user@example.com",
    "purpose": "signup_verification|password_reset|email_verification"
}
Response: {
    "success": true,
    "message": "OTP sent successfully to your email.",
    "data": {
        "expiresIn": 600,
        "email": "us***@example.com",
        "purpose": "signup_verification"
    }
}
```

#### Verify OTP (Improved)

```
POST /api/otp/verify
Body: {
    "email": "user@example.com",
    "otp": "123456",
    "purpose": "signup_verification"
}
Response: {
    "success": true,
    "message": "OTP verified successfully.",
    "data": {
        "email": "user@example.com",
        "verified": true
    }
}
```

#### Resend OTP (Improved)

```
POST /api/otp/resend
Body: {
    "email": "user@example.com",
    "purpose": "signup_verification"
}
Response: {
    "success": true,
    "message": "OTP resent successfully."
}
```

#### Get OTP Status

```
GET /api/otp/status?email=user@example.com&purpose=signup_verification
Response: {
    "success": true,
    "data": {
        "exists": true,
        "email": "us***@example.com",
        "purpose": "signup_verification",
        "attempts": 2,
        "attemptsRemaining": 3,
        "timeRemaining": 420,
        "isExpired": false
    }
}
```

### Email Configuration

#### Environment Variables Required

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM_NAME=Human Error Platform
```

**Note:** For Gmail, use **App Password**, not your regular password:

1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password for "Mail"
3. Use this 16-character password in EMAIL_PASS

---

## 4. Modern OTP Verification Page

### Features

- **Glassy Morphism Design**: Modern glassmorphic UI with blur effects
- **Auto-focus & Auto-submit**: Seamless OTP input experience
- **Paste Support**: Paste full OTP code at once
- **Timer Display**: Shows countdown with color indication
- **Responsive Design**: Works perfectly on mobile, tablet, desktop
- **Animated Transitions**: Smooth state changes and transitions
- **Email Validation**: Real-time email validation feedback
- **Error Recovery**: Ability to change email and try again

### File Location

```
/Frontend/views/OTP_Modern.html
```

### Features

- ✨ Animated background with gradient
- 🎯 Auto-focus on first OTP digit
- ⏱️ 10-minute countdown timer
- 📱 Mobile-responsive design
- ✅ Auto-submit when all 6 digits entered
- 🔄 Resend OTP with cooldown
- 🔐 Secure cookie-based sessions
- 🎨 Smooth animations and transitions

### HTML Structure

The page includes:

- Email input section
- 6-digit OTP input section
- Timer countdown
- Resend option
- Change email button
- Success confirmation screen

### Integration in Server

Add this route to serve the page:

```javascript
app.get("/otp", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/views/OTP_Modern.html"));
});
```

---

## 5. Session & Cookie Tracking System

### Features

- **Comprehensive Session Tracking**: Track every user session with detailed data
- **Device & Browser Detection**: Identify device, OS, browser information
- **Behavioral Analytics**: Track user interactions, page views, events
- **Geolocation Tracking**: Store user location data with coordinates
- **Security Monitoring**: Detect suspicious activities and risk assessment
- **Performance Metrics**: Monitor page load times and API response times
- **User Engagement Scoring**: Calculate engagement metrics per session
- **Automatic Analytics Aggregation**: Generate user behavior summaries

### Database Models

#### SessionTracking Model

Stores detailed information about individual user sessions including:

- Device information (browser, OS, device type)
- IP address and geolocation
- Page views with time spent and scroll depth
- User events (clicks, form submissions, searches)
- Errors encountered during session
- Security metrics and risk scoring
- Performance data

#### UserBehaviorAnalytics Model

Stores aggregated analytics including:

- Session summary statistics
- Trend data over time
- User preferences
- Risk assessment
- Churn and conversion predictions

### API Endpoints

#### Create Session

```
POST /api/session-tracking/create
Body: { "userId": "user_id" }
Response: {
    "success": true,
    "data": {
        "sessionId": "unique_session_id",
        "cookies": {
            "sessionCookie": "cookie_value",
            "trackingCookie": "tracking_value"
        }
    }
}
```

#### Track Page View

```
POST /api/session-tracking/page-view
Body: {
    "sessionId": "session_id",
    "url": "https://example.com/page",
    "path": "/page",
    "referrer": "https://google.com",
    "timeSpent": 45000,
    "scrollDepth": 75
}
Response: { "success": true, "message": "Page view tracked" }
```

#### Track User Event

```
POST /api/session-tracking/event
Body: {
    "sessionId": "session_id",
    "eventType": "click|form_submit|search|navigation|download|error|custom",
    "eventName": "button_clicked",
    "elementId": "submit-btn",
    "elementClass": "btn btn-primary",
    "metadata": { "custom": "data" }
}
Response: { "success": true, "message": "Event tracked" }
```

#### End Session

```
POST /api/session-tracking/end
Body: { "sessionId": "session_id" }
Response: { "success": true, "message": "Session ended successfully" }
```

#### Get Session Details

```
GET /api/session-tracking/details/:sessionId
Response: {
    "success": true,
    "data": {
        "sessionId": "...",
        "user": { "email": "...", "username": "..." },
        "deviceInfo": { ... },
        "location": { ... },
        "sessionData": { ... },
        "behavior": {
            "pageViewCount": 12,
            "eventCount": 45
        },
        "engagement": { ... }
    }
}
```

#### Get User Sessions

```
GET /api/session-tracking/user/:userId?limit=10&skip=0
Response: {
    "success": true,
    "data": {
        "sessions": [...],
        "total": 45,
        "limit": 10,
        "skip": 0
    }
}
```

#### Get User Behavior Analytics

```
GET /api/session-tracking/analytics/:userId
Response: {
    "success": true,
    "data": {
        "userId": "...",
        "summary": {
            "totalSessions": 45,
            "totalSessionDuration": 12600000,
            "averageSessionDuration": 280000,
            "totalPageViews": 450,
            "averageEngagementScore": 72
        },
        "trends": { ... },
        "preferences": { ... },
        "riskAssessment": { ... }
    }
}
```

#### Track Error

```
POST /api/session-tracking/error
Body: {
    "sessionId": "session_id",
    "type": "JavaScript",
    "message": "Cannot read property 'x' of undefined",
    "stackTrace": "...",
    "url": "https://example.com/page"
}
Response: { "success": true, "message": "Error tracked" }
```

### Client-Side JavaScript Integration

```javascript
// Initialize session tracking
const sessionManager = {
  sessionId: null,

  async createSession(userId) {
    const res = await fetch("/api/session-tracking/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    this.sessionId = data.data.sessionId;
    return this.sessionId;
  },

  async trackPageView(url, timeSpent) {
    await fetch("/api/session-tracking/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: this.sessionId,
        url,
        timeSpent,
      }),
    });
  },

  async trackEvent(eventType, eventName) {
    await fetch("/api/session-tracking/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: this.sessionId,
        eventType,
        eventName,
      }),
    });
  },

  async endSession() {
    await fetch("/api/session-tracking/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: this.sessionId,
      }),
    });
  },
};

// Usage
document.addEventListener("DOMContentLoaded", () => {
  sessionManager.createSession(userId);
});

// Track clicks
document.addEventListener("click", (e) => {
  sessionManager.trackEvent("click", e.target.id || "unknown");
});

// Track page leave
window.addEventListener("beforeunload", () => {
  sessionManager.endSession();
});
```

### Security Features

- **Risk Scoring**: Automatically calculates risk based on various factors
- **Anomaly Detection**: Detects unusual patterns like IP changes
- **Failed Attempt Tracking**: Monitors failed login attempts
- **Session Validation**: Validates session integrity

### Performance Monitoring

- Page load times
- API response times
- Slow request tracking
- CPU and memory usage monitoring

---

## Implementation Checklist

- [x] GCC Debugger with compilation support
- [x] Route flow management system
- [x] Improved OTP email service
- [x] Modern OTP verification page
- [x] Session and cookie tracking
- [x] User behavior analytics
- [x] All API endpoints
- [x] Error handling
- [x] Rate limiting
- [x] Database models

## File Structure

```
Backend/
├── controller/
│   ├── debugger.controller.js         (NEW)
│   ├── otp-improved.controller.js     (NEW)
│   └── session-tracking.controller.js (NEW)
├── Routes/
│   ├── debugger.routes.js             (NEW)
│   ├── routes-flow.routes.js          (NEW)
│   ├── session-tracking.routes.js     (NEW)
│   └── otp.routes.js                  (MODIFIED)
├── models/
│   ├── SessionTracking.model.js       (NEW)
│   └── otpHandler.models.js           (MODIFIED)
├── util/
│   ├── RouteFlowManager.js            (NEW)
│   ├── EmailService.js                (NEW)
│   └── ...
└── server.js                          (MODIFIED)

Frontend/
├── views/
│   ├── OTP_Modern.html                (NEW)
│   └── ...
└── ...
```

---

## Testing

### Test Debugger

```bash
curl -X POST http://localhost:8000/api/debugger/compile \
  -H "Content-Type: application/json" \
  -d '{
    "code": "#include <stdio.h>\nint main() { printf(\"Hello\"); return 0; }",
    "language": "c"
  }'
```

### Test OTP Sending

```bash
curl -X POST http://localhost:8000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "purpose": "signup_verification"}'
```

### Test Session Tracking

```bash
curl -X POST http://localhost:8000/api/session-tracking/create \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_id_here"}'
```

### Test Route Flow

```bash
curl http://localhost:8000/api/routes/flow
curl http://localhost:8000/api/routes/diagram
curl http://localhost:8000/api/routes/stats
```

---

## Troubleshooting

### OTP Email Not Sending

1. Check EMAIL_USER and EMAIL_PASS in .env
2. Ensure Gmail App Password is used (not regular password)
3. Check browser console for detailed error messages
4. Verify network connectivity

### Debugger Compilation Errors

1. Check if GCC is installed: `which gcc`
2. Verify code syntax
3. Check file permissions in temp directory
4. Review error messages for line numbers

### Session Tracking Not Working

1. Ensure sessionId is passed correctly
2. Check MongoDB connection
3. Verify user ID format is correct
4. Check browser cookies are enabled

---

## Security Notes

- ✅ All OTP endpoints have rate limiting
- ✅ Session data is encrypted in transit
- ✅ Cookies use httpOnly and secure flags
- ✅ Risk scoring prevents suspicious activities
- ✅ Admin-only endpoints require authentication

---

## Performance Considerations

- Session cleanup runs every hour
- Old sessions (24+ hours) are automatically deleted
- Database indexes optimize query performance
- Gzip compression for API responses

---

## Support & Documentation

For more information, refer to:

- Backend API Documentation: `/api/*/` (each route has GET / endpoint)
- Frontend Integration Guide: See client-side examples above
- Database Schema: Check model files

---

_Last Updated: January 3, 2024_
