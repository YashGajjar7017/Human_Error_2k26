# Testing Guide - OTP Verification System

## Overview

This guide covers testing the complete OTP verification system in the Electron app with database-backed verification methods.

## Test Environment Setup

### Prerequisites

- Node.js 16+
- MongoDB running
- Backend server configured
- Electron app dependencies installed

### Start Services

1. **Start MongoDB**

```bash
# Docker (recommended)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or local MongoDB service
mongod
```

2. **Start Backend Server**

```bash
cd Backend
npm install
npm start
```

3. **Start Electron App**

```bash
cd Electron
npm install
npm run dev
```

## Test Cases

### Test 1: OTP Send Functionality

**Objective**: Verify OTP is generated and sent correctly

**Steps**:

1. Navigate to OTP page
2. Enter valid email: `test@example.com`
3. Click "Send OTP"

**Expected Result**:

- ✅ Success message appears
- ✅ OTP code visible in backend logs
- ✅ Email appears masked: `te***@example.com`
- ✅ Resend button disabled for 60 seconds
- ✅ Step changes from "email" to "verify"

**Backend Verification**:

```javascript
// Check OTP in MongoDB
db.otps.findOne({ email: "test@example.com" })

// Should show:
{
  _id: ObjectId(...),
  email: "test@example.com",
  otp: "123456",  // Sample
  purpose: "verification",
  isVerified: false,
  attempts: 0,
  expiresAt: ISODate("2024-01-07T12:10:00Z")
}
```

### Test 2: OTP Verification - Valid Code

**Objective**: Verify correct OTP is accepted

**Steps**:

1. Copy OTP from backend logs (e.g., "123456")
2. Enter each digit in OTP fields
3. Click "Verify OTP"

**Expected Result**:

- ✅ All 6 digits accepted
- ✅ Auto-focus works between fields
- ✅ Success message shows
- ✅ Redirects to signup page
- ✅ `verifiedEmail` stored in localStorage

**Database Verification**:

```javascript
// Check verified OTP
db.otps.findOne({ email: "test@example.com", isVerified: true })

// Should show:
{
  isVerified: true,
  verifiedAt: ISODate("2024-01-07T..."),
  verificationMethod: "otp_code",
  userExists: false,
  signupExists: true
}
```

### Test 3: OTP Verification - Invalid Code

**Objective**: Verify invalid OTP is rejected

**Steps**:

1. Enter wrong OTP: "000000"
2. Click "Verify OTP"

**Expected Result**:

- ✅ Error message appears
- ✅ Attempt counter: "4 attempts remaining"
- ✅ OTP fields stay active for retry
- ✅ Database increments attempts

**Database Check**:

```javascript
db.otps.findOne({ email: "test@example.com" });
// attempts should be: 1
```

### Test 4: OTP Expiration

**Objective**: Verify expired OTP is rejected

**Steps**:

1. Wait for OTP to expire (10 minutes)
2. Enter any 6-digit code
3. Click "Verify OTP"

**Expected Result**:

- ✅ Error: "OTP has expired"
- ✅ User prompted to request new OTP
- ✅ Expired OTP deleted from database

### Test 5: Max Attempts Exceeded

**Objective**: Verify system after 5 failed attempts

**Steps**:

1. Enter wrong OTP 5 times
2. Attempt 6th verification

**Expected Result**:

- ✅ Error: "Too many failed attempts"
- ✅ OTP record deleted
- ✅ User must request new OTP
- ✅ Resend button becomes active

### Test 6: Resend OTP

**Objective**: Verify OTP can be resent

**Steps**:

1. After first OTP send, wait 1 second
2. Click "Resend OTP"
3. Wait for timer

**Expected Result**:

- ✅ New OTP generated
- ✅ Previous OTP invalidated
- ✅ 60-second timer starts
- ✅ Timer counts down correctly
- ✅ New code visible in logs

### Test 7: Paste OTP Functionality

**Objective**: Verify clipboard paste works

**Steps**:

1. Copy OTP: "123456"
2. Click first OTP input
3. Paste (Ctrl+V or Cmd+V)

**Expected Result**:

- ✅ All 6 digits populate
- ✅ Focus moves to last field
- ✅ Verify button becomes clickable

### Test 8: Email Validation

**Objective**: Verify email format validation

**Test Cases**:

- ❌ "invalid" → Error: "valid email address"
- ❌ "test@" → Error: "valid email address"
- ❌ "@example.com" → Error: "valid email address"
- ✅ "test@example.com" → Success

### Test 9: Rate Limiting

**Objective**: Verify rate limiting on OTP send

**Steps**:

1. Send OTP for same email 5 times rapidly
2. Attempt 6th send

**Expected Result**:

- ✅ First 5: Success
- ❌ 6th: Rate limit error
- ✅ Error message: "Too many OTP requests"

### Test 10: Multi-Method Database Verification

**Objective**: Verify advanced verification methods work

**Setup**:

```bash
# Manually test the endpoint
curl -X POST http://localhost:5000/api/otp/verify-advanced \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456",
    "purpose": "verification"
  }'
```

**Expected Response**:

```json
{
  "success": true,
  "message": "OTP verified successfully with database confirmation",
  "data": {
    "email": "test@example.com",
    "verified": true,
    "method": "multi_verify",
    "verificationDetails": {
      "otpMatched": true,
      "userExists": false,
      "signupExists": true,
      "verifiedAt": "2024-01-07T...",
      "purpose": "verification"
    }
  }
}
```

### Test 11: Verification Status Check

**Objective**: Verify status endpoint works

**Steps**:

```bash
# Get verification status
curl http://localhost:5000/api/otp/status/test@example.com
```

**Expected Response**:

```json
{
  "success": true,
  "verified": true,
  "data": {
    "email": "test@example.com",
    "purpose": "verification",
    "verifiedAt": "2024-01-07T...",
    "verificationMethod": "otp_code",
    "userExists": false,
    "signupExists": true
  }
}
```

### Test 12: Email Change Flow

**Objective**: Verify changing email during verification

**Steps**:

1. Enter email 1, send OTP
2. Click "Change Email"
3. Enter email 2, send new OTP

**Expected Result**:

- ✅ Step changes back to email
- ✅ Email field editable again
- ✅ New OTP generated for email 2
- ✅ Email 1 OTP invalidated

### Test 13: Auto-Focus Behavior

**Objective**: Verify proper focus management

**Steps**:

1. Click first OTP field
2. Type "1"
3. Verify focus moves to field 2
4. Type "2"
5. Continue...

**Expected Result**:

- ✅ Focus moves automatically after each digit
- ✅ Can tab between fields
- ✅ Can backspace to previous field
- ✅ All fields properly focused

## API Endpoint Testing

### Endpoint: POST /api/otp/send

```bash
# Test 1: Valid email
curl -X POST http://localhost:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","purpose":"verification"}'

# Test 2: Invalid email
curl -X POST http://localhost:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","purpose":"verification"}'

# Test 3: Missing purpose
curl -X POST http://localhost:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

### Endpoint: POST /api/otp/verify

```bash
curl -X POST http://localhost:5000/api/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "otp":"123456",
    "purpose":"verification"
  }'
```

### Endpoint: POST /api/otp/verify-advanced

```bash
curl -X POST http://localhost:5000/api/otp/verify-advanced \
  -H "Content-Type: application/json" \
  -d '{
    "email":"user@example.com",
    "otp":"123456",
    "purpose":"verification"
  }'
```

### Endpoint: GET /api/otp/status/:email

```bash
curl http://localhost:5000/api/otp/status/user@example.com
```

## Database Inspection

### MongoDB Queries

```javascript
// Check all OTPs
db.otps.find({});

// Check OTP for specific email
db.otps.findOne({ email: "test@example.com" });

// Check verified OTPs
db.otps.find({ isVerified: true });

// Check OTP stats
db.otps.aggregate([
  {
    $group: {
      _id: "$purpose",
      count: { $sum: 1 },
      verified: {
        $sum: { $cond: ["$isVerified", 1, 0] },
      },
    },
  },
]);
```

## Performance Testing

### Load Testing OTP Send

```javascript
// Send 10 OTPs to different emails
for (let i = 0; i < 10; i++) {
  fetch("http://localhost:5000/api/otp/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `user${i}@example.com`,
      purpose: "verification",
    }),
  });
}
```

### Rate Limit Testing

```bash
# This should succeed 5 times, fail on 6th
for i in {1..6}; do
  echo "Request $i:"
  curl -X POST http://localhost:5000/api/otp/send \
    -H "Content-Type: application/json" \
    -d '{"email":"ratelimit@example.com","purpose":"verification"}'
  sleep 1
done
```

## Error Scenarios

| Scenario             | Expected Error           | HTTP Status |
| -------------------- | ------------------------ | ----------- |
| Missing email        | Email is required        | 400         |
| Invalid email format | valid email address      | 400         |
| Invalid OTP format   | 6-digit number           | 400         |
| Expired OTP          | OTP has expired          | 400         |
| Wrong OTP            | Invalid OTP              | 401         |
| Max attempts         | Too many failed attempts | 429         |
| Rate limited         | Too many OTP requests    | 429         |
| No OTP found         | OTP not found            | 404         |

## Success Criteria Checklist

- [ ] OTP sends successfully
- [ ] Email validation works
- [ ] OTP verifies with correct code
- [ ] Wrong OTP rejected with counter
- [ ] Max attempts triggered after 5
- [ ] OTP expires after 10 minutes
- [ ] Resend works with 60s timer
- [ ] Paste functionality works
- [ ] Auto-focus works correctly
- [ ] Database records created/updated
- [ ] Rate limiting works
- [ ] Advanced verification methods all work
- [ ] Status endpoint returns correct data
- [ ] Email change flow works
- [ ] Error messages are clear
- [ ] UI is responsive and animated

## Automated Testing

### Unit Tests (Optional)

Create `Electron/src/__tests__/otp.test.js`:

```javascript
import { describe, it, expect } from "vitest";
import OTP from "../pages/OTP";

describe("OTP Component", () => {
  it("should render OTP form", () => {
    // Test rendering
  });

  it("should validate email", () => {
    // Test email validation
  });

  it("should handle OTP input", () => {
    // Test OTP input handling
  });

  it("should handle OTP submission", () => {
    // Test OTP submission
  });
});
```

Run tests:

```bash
npm test
```

## Continuous Monitoring

### Logs to Check

1. **Frontend (DevTools Console)**

   - API call responses
   - State changes
   - Error messages

2. **Backend (Terminal)**

   - OTP generation logs
   - Email sending logs
   - Database operations
   - Errors

3. **MongoDB Logs**
   - Write operations
   - Query performance
   - Index usage

### Metrics to Track

- OTP send success rate
- OTP verification success rate
- Average verification time
- Error frequency
- Rate limit hits
- Expired OTP count

---

**Test thoroughly and report any issues!** ✅
