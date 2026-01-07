# Electron App Setup & Implementation Guide

## Overview

This is a complete desktop application built with Electron and React, featuring a gorgeous modern UI with advanced OTP verification and database-backed security.

## What's Included

### ✨ Modern Frontend

- **React 18.2** with Hooks
- **React Router DOM** for navigation
- **Vite** for fast development and optimized builds
- **Modern CSS** with gradients, animations, and glassmorphic design
- **Responsive UI** that works on all screen sizes

### 🔐 Advanced OTP System

- **Gorgeous UI**: Animated OTP input with auto-focus
- **Multi-Method Verification**: 5 different database verification strategies
- **Rate Limiting**: Prevents brute force attacks
- **Attempt Tracking**: Tracks failed verification attempts
- **Resend Feature**: 60-second cooldown timer
- **Error Handling**: Clear, user-friendly error messages

### 🎯 Backend Integration

- **Electron Main Process**: Manages app lifecycle and backend server
- **IPC Communication**: Secure main-renderer process communication
- **API Integration**: Built-in fetch-based API calls with error handling
- **Electron Store**: Persistent application state storage

### 🖥️ Desktop Features

- **Window Management**: Minimize, maximize, close controls
- **File Dialogs**: Native file open/save dialogs
- **Development Tools**: Integrated DevTools for debugging
- **Responsive**: Works on Windows, macOS, and Linux

## Quick Start

### 1. Navigate to Electron Folder

```bash
cd /workspaces/Human_Error_2k26/Electron
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development

```bash
npm run dev
```

This will:

- Start Vite dev server (http://localhost:5173)
- Start backend server (http://localhost:5000)
- Launch Electron app automatically

### 4. Test OTP Functionality

1. Go to OTP page
2. Enter your email
3. Click "Send OTP"
4. Check console/backend logs for OTP code
5. Enter the 6-digit code
6. Click "Verify OTP"

## Project Structure

```
Electron/
├── src/
│   ├── pages/
│   │   ├── Login.jsx          - Login page
│   │   ├── Signup.jsx         - Registration page
│   │   ├── OTP.jsx            - GORGEOUS OTP verification ⭐
│   │   └── Dashboard.jsx      - Main dashboard
│   ├── styles/
│   │   ├── index.css          - Global styles
│   │   ├── Auth.css           - Auth pages styling
│   │   ├── OTP.css            - OTP gorgeous styling ⭐
│   │   └── Dashboard.css      - Dashboard styling
│   ├── components/            - Reusable components
│   ├── hooks/                 - Custom React hooks
│   ├── context/               - React Context
│   ├── utils/                 - Utility functions
│   ├── App.jsx                - Main app component
│   └── main.jsx               - React entry point
├── main.js                    - Electron main process ⭐
├── preload.js                 - Secure preload script ⭐
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Key Files

### main.js (Electron Main Process)

Features:

- Manages app window creation
- Starts backend server
- Handles IPC communication
- Provides file dialogs
- Manages app menu

### preload.js (Security Layer)

Exposes safe APIs:

- Window controls
- Storage operations
- File dialogs
- API communication

### src/pages/OTP.jsx (Gorgeous OTP UI)

Features:

- Beautiful animated interface
- Auto-focus input fields
- Clipboard paste support
- Resend timer
- Error/success messages
- Multi-step flow (email → verify)

### Backend Routes (otp.routes.js)

New endpoints:

- `POST /api/otp/send` - Send OTP
- `POST /api/otp/verify` - Verify OTP
- `POST /api/otp/verify-advanced` - Advanced verification ⭐
- `GET /api/otp/status/:email` - Check status

### Backend Controller (otp-improved.controller.js)

New methods:

- `verifyOTPWithDBBackup()` - Multi-method verification ⭐
- `getOTPVerificationStatus()` - Status checking
- Database backup verification strategies

## API Examples

### 1. Send OTP

```javascript
const response = await window.electronAPI.callAPI('POST', '/api/otp/send', {
  email: 'user@example.com',
  purpose: 'verification'
});

// Success response:
{
  success: true,
  message: "OTP sent successfully to your email.",
  data: {
    expiresIn: 600,
    email: "us***@example.com",
    purpose: "verification"
  }
}
```

### 2. Verify OTP (Advanced)

```javascript
const response = await window.electronAPI.callAPI('POST', '/api/otp/verify-advanced', {
  email: 'user@example.com',
  otp: '123456',
  purpose: 'verification'
});

// Success response:
{
  success: true,
  message: "OTP verified successfully with database confirmation",
  data: {
    email: "user@example.com",
    verified: true,
    method: "multi_verify",
    verificationDetails: {
      otpMatched: true,
      userExists: true,
      signupExists: true,
      verifiedAt: "2024-01-07T...",
      purpose: "verification"
    }
  }
}
```

### 3. Get Verification Status

```javascript
const response = await window.electronAPI.callAPI('GET', '/api/otp/status/user@example.com', null);

// Response:
{
  success: true,
  verified: true,
  data: {
    email: "user@example.com",
    purpose: "verification",
    verifiedAt: "2024-01-07T...",
    verificationMethod: "otp_code",
    userExists: true,
    signupExists: true
  }
}
```

## OTP Verification Flow

### Step-by-Step

1. **User enters email** → Validates email format
2. **Click Send OTP** → Backend generates 6-digit code
3. **OTP sent to email** → EmailService sends code
4. **User receives code** → Email notification
5. **Enter 6 digits** → UI validates input
6. **Click Verify** → Multiple verification methods run:
   - Direct database lookup
   - OTP value comparison
   - User existence check
   - Signup record verification
   - Attempt tracking
7. **Verification confirmed** → Response includes detailed verification info
8. **Redirect to signup** → User continues registration

### Database Verification Methods

The `verifyOTPWithDBBackup` method uses:

1. **Method 1: Direct OTP Lookup**

   ```javascript
   await OTP.findOne({
     email: { $eq: email },
     purpose: { $eq: purpose },
     isVerified: { $eq: false },
     expiresAt: { $gt: new Date() },
   });
   ```

2. **Method 2: OTP Value Match**

   ```javascript
   const isOTPValid = otpRecord.otp === otp.trim();
   ```

3. **Method 3: User Existence**

   ```javascript
   const userExists = await User.exists({ email: email });
   ```

4. **Method 4: Signup Record**

   ```javascript
   const signupRecord = await Signup.findOne({ email: email });
   ```

5. **Method 5: Database Update**
   ```javascript
   await OTP.findByIdAndUpdate(otpRecord._id, {
     isVerified: true,
     verifiedAt: new Date(),
     verificationMethod: "otp_code",
     userExists: userExists,
     signupExists: !!signupRecord,
   });
   ```

## Configuration

### Environment Variables

Create `.env` in Electron folder:

```env
VITE_API_URL=http://localhost:5000
NODE_ENV=development
ELECTRON_DEBUG=true
```

### Backend Configuration

Ensure Backend/.env has:

```env
MONGODB_URI=your_mongodb_connection
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
JWT_SECRET=your_secret_key
```

## Building for Production

### Build Vite App

```bash
npm run build:prod
```

### Package Electron App

```bash
npm run electron:build
```

This creates:

- Windows: `.exe` and `.nsis` installers
- macOS: `.dmg` package
- Linux: `.AppImage` and `.deb` packages

## Testing

### Manual Testing Checklist

- [ ] Start app: `npm run dev`
- [ ] Navigate to OTP page
- [ ] Test email validation
- [ ] Test OTP send functionality
- [ ] Verify OTP in logs/terminal
- [ ] Enter OTP digits
- [ ] Test auto-focus between inputs
- [ ] Test paste functionality
- [ ] Test resend with timer
- [ ] Verify successful authentication
- [ ] Test error handling
- [ ] Check database verification

### Backend Testing

```bash
# Send OTP
curl -X POST http://localhost:5000/api/otp/send \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","purpose":"verification"}'

# Verify OTP
curl -X POST http://localhost:5000/api/otp/verify-advanced \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456","purpose":"verification"}'

# Get Status
curl http://localhost:5000/api/otp/status/test@example.com
```

## Troubleshooting

### Issue: App won't start

**Solution:**

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Check ports
lsof -i :5173  # Vite
lsof -i :5000  # Backend
```

### Issue: OTP not sending

**Solution:**

1. Check Backend logs for email errors
2. Verify email service in Backend/.env
3. Check MongoDB connection
4. Look for CORS issues

### Issue: Build fails

**Solution:**

```bash
# Clear build cache
npm run build -- --force

# Check Node version
node --version  # Should be 16+
```

## Performance Tips

✅ Code splitting for vendor libraries
✅ Lazy loading of routes
✅ Optimized CSS with media queries
✅ Minified production builds
✅ Efficient state management

## Security

✅ Context isolation: YES
✅ Node integration: DISABLED
✅ Sandbox: ENABLED
✅ HTTPS preload: YES
✅ Input validation: YES
✅ Rate limiting: YES (5 OTP per 15 min)
✅ Attempt tracking: YES
✅ Environment isolation: YES

## Next Steps

1. **Customize Branding**

   - Update app name in package.json
   - Add app icon (icon.png)
   - Customize colors in CSS

2. **Add Features**

   - More pages/components
   - Additional API endpoints
   - File compilation features

3. **Deploy**

   - Set up CI/CD pipeline
   - Build for all platforms
   - Create release packages

4. **Monitor**
   - Track errors
   - Monitor OTP verification success rate
   - Analytics integration

## Documentation

- [Electron Docs](https://www.electronjs.org/docs)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)

---

**Ready to develop!** Start with `npm run dev` 🚀
