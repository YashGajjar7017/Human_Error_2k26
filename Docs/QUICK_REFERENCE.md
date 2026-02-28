# Quick Reference Guide - All New Features

## 🔧 Feature List

| Feature              | Status      | Location                                    | API Route               |
| -------------------- | ----------- | ------------------------------------------- | ----------------------- |
| GCC Debugger         | ✅ Complete | `Backend/controller/debugger.controller.js` | `/api/debugger`         |
| Route Flow Manager   | ✅ Complete | `Backend/util/RouteFlowManager.js`          | `/api/routes`           |
| Enhanced OTP Service | ✅ Complete | `Backend/util/EmailService.js`              | `/api/otp`              |
| Modern OTP Page      | ✅ Complete | `Frontend/views/OTP_Modern.html`            | `/otp`                  |
| Session Tracking     | ✅ Complete | `Backend/models/SessionTracking.model.js`   | `/api/session-tracking` |

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install ua-parser-js --save
```

### 2. Configure Email (.env)

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM_NAME=Human Error Platform
```

### 3. Start Server

```bash
npm start
```

---

## 📝 API Quick Reference

### Debugger

```bash
# Compile code
POST /api/debugger/compile
{ "code": "...", "language": "c|cpp|java|python" }

# Compile & run
POST /api/debugger/run
{ "code": "...", "input": "stdin" }

# Run debugger
POST /api/debugger/debug
{ "sessionId": "...", "breakpoints": ["main"] }

# Get languages
GET /api/debugger/languages
```

### Route Flow

```bash
# Full structure
GET /api/routes/flow

# ASCII diagram
GET /api/routes/diagram

# Statistics
GET /api/routes/stats

# Search
GET /api/routes/search?q=auth
```

### OTP

```bash
# Send OTP
POST /api/otp/send
{ "email": "user@example.com" }

# Verify OTP
POST /api/otp/verify
{ "email": "user@example.com", "otp": "123456" }

# Resend OTP
POST /api/otp/resend
{ "email": "user@example.com" }

# Get status
GET /api/otp/status?email=user@example.com
```

### Session Tracking

```bash
# Create session
POST /api/session-tracking/create
{ "userId": "user_id" }

# Track page view
POST /api/session-tracking/page-view
{ "sessionId": "...", "url": "..." }

# Track event
POST /api/session-tracking/event
{ "sessionId": "...", "eventType": "click" }

# End session
POST /api/session-tracking/end
{ "sessionId": "..." }

# Get analytics
GET /api/session-tracking/analytics/:userId
```

---

## 🧪 Test Commands

### Test All Features

```bash
#!/bin/bash

# Debugger
curl -X POST http://localhost:8000/api/debugger/compile \
  -H "Content-Type: application/json" \
  -d '{"code":"#include<stdio.h>\nint main(){printf(\"test\");}", "language":"c"}'

# Routes
curl http://localhost:8000/api/routes/stats

# OTP
curl -X POST http://localhost:8000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Session
curl -X POST http://localhost:8000/api/session-tracking/create \
  -H "Content-Type: application/json" \
  -d '{"userId":"USER_ID"}'
```

---

## 📚 Documentation Files

1. **NEW_FEATURES_IMPLEMENTATION.md** - Complete detailed docs
2. **IMPLEMENTATION_SUMMARY.md** - Integration summary
3. **SETUP_FEATURES.sh** - Configuration script
4. **QUICK_REFERENCE.md** - This file

---

## ⚙️ Configuration

### Email Setup for Gmail

1. Go to Google Account Security
2. Enable 2-Factor Authentication
3. Generate App Password for "Mail"
4. Copy the 16-character password
5. Add to .env as EMAIL_PASS

### GCC Installation

```bash
# Ubuntu/Debian
sudo apt-get install build-essential

# macOS
xcode-select --install

# Windows
# Install MinGW or Visual Studio Build Tools
```

---

## 🔍 Monitoring Logs

Watch for feature logs:

```bash
npm start | grep -E '\[SESSION\]|\[OTP\]|\[ROUTE FLOW\]|\[DEBUGGER\]|\[EMAIL'
```

Log prefixes:

- `[SESSION]` - Session tracking
- `[OTP]` - OTP operations
- `[ROUTE FLOW]` - Route management
- `[DEBUGGER]` - Code compilation/debugging
- `[EMAIL SERVICE]` - Email operations
- `[ANALYTICS]` - Analytics updates

---

## 🔐 Security Features

- ✅ Rate limiting (5 OTP per 15 min)
- ✅ Session cookies: httpOnly, Secure, SameSite
- ✅ Risk scoring for anomalies
- ✅ Failed attempt tracking
- ✅ Admin-only endpoints protected
- ✅ Masked emails in responses

---

## 📊 Database Models

### SessionTracking

```javascript
{
    userId,
    sessionId,
    deviceInfo: { browser, os, deviceType, ... },
    ipAddress,
    location: { country, coordinates, ... },
    sessionData: { startTime, endTime, duration, ... },
    behavior: { pageViews, events, errors, ... },
    engagement: { clickCount, engagementScore, ... },
    security: { riskScore, suspiciousActivity, ... }
}
```

### UserBehaviorAnalytics

```javascript
{
    userId,
    summary: { totalSessions, avgDuration, ... },
    trends: { sessionTrend, engagementTrend, ... },
    preferences: { language, theme, ... },
    riskAssessment: { avgRiskScore, ... }
}
```

---

## 💾 Files Added/Modified

### New Files (9)

- ✅ `Backend/controller/debugger.controller.js`
- ✅ `Backend/controller/otp-improved.controller.js`
- ✅ `Backend/controller/session-tracking.controller.js`
- ✅ `Backend/Routes/debugger.routes.js`
- ✅ `Backend/Routes/routes-flow.routes.js`
- ✅ `Backend/Routes/session-tracking.routes.js`
- ✅ `Backend/util/EmailService.js`
- ✅ `Backend/util/RouteFlowManager.js`
- ✅ `Backend/models/SessionTracking.model.js`
- ✅ `Frontend/views/OTP_Modern.html`

### Modified Files (1)

- ✅ `Backend/server.js` (added route imports and registrations)

### Documentation (4)

- ✅ `Docs/NEW_FEATURES_IMPLEMENTATION.md`
- ✅ `IMPLEMENTATION_SUMMARY.md`
- ✅ `SETUP_FEATURES.sh`
- ✅ `QUICK_REFERENCE.md`

---

## 🎯 Feature Highlights

### Debugger

- GDB integration for C/C++
- Breakpoint support
- Line-by-line error detection
- Activity logging

### Route Manager

- Auto-extracts 45+ routes
- Visual ASCII diagrams
- Search & filter
- Admin refresh

### OTP System

- 3x automatic retry
- Beautiful HTML emails
- Masked email privacy
- Rate limiting

### OTP Page

- Glassmorphic design
- Auto-focus inputs
- Paste support
- Smooth animations

### Session Tracking

- Comprehensive behavior
- Device detection
- Location tracking
- Risk scoring
- Engagement metrics

---

## 🆘 Troubleshooting

### Email Not Working

- ✓ Check EMAIL_USER & EMAIL_PASS
- ✓ Use Gmail App Password
- ✓ Check browser console

### Debugger Errors

- ✓ Verify GCC installed
- ✓ Check code syntax
- ✓ Review error lines

### Session Issues

- ✓ Check sessionId format
- ✓ Verify user ID
- ✓ Check MongoDB

---

## 📞 Support

Each API endpoint has documentation:

- `GET /api/debugger/` - API docs
- `GET /api/routes/` - API docs
- `GET /api/otp/` - API docs
- `GET /api/session-tracking/` - API docs

---

## ✨ Next Steps

1. ✅ Review documentation files
2. ✅ Configure email service
3. ✅ Install ua-parser-js
4. ✅ Start server & test
5. ✅ Monitor logs
6. ✅ Integrate with frontend

---

**Status:** ✅ ALL FEATURES COMPLETE & TESTED

_Last Updated: January 3, 2024_
