# Quick Reference - Human Error Electron App

## 🚀 Get Started in 30 Seconds

```bash
cd Electron
npm install
npm run dev
```

## 📍 Key Files

| File                 | Purpose                   |
| -------------------- | ------------------------- |
| `src/pages/OTP.jsx`  | **Gorgeous OTP UI** ⭐    |
| `src/styles/OTP.css` | **Modern OTP styling** ⭐ |
| `main.js`            | Electron main process     |
| `preload.js`         | IPC security layer        |
| `package.json`       | Dependencies & scripts    |

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server + backend + app
npm run dev:hot         # With hot reload
npm run start:debug     # With debugger

# Building
npm run build:prod      # Build for production
npm run electron:build  # Create installer

# Backend (from Backend folder)
npm start               # Start Node.js backend
```

## 🎨 OTP Features

- ✨ Gorgeous modern UI with gradient background
- 🎯 Auto-focus between 6 input fields
- 📋 Clipboard paste support
- ⏱️ 60-second resend timer
- 🔄 Step-by-step flow (email → verify)
- 📧 Email masking for privacy
- ❌ Clear error messages
- ✅ Smooth animations

## 🔐 API Endpoints

```javascript
// Send OTP
POST /api/otp/send
body: { email, purpose }

// Verify OTP
POST /api/otp/verify
body: { email, otp, purpose }

// Advanced Verification
POST /api/otp/verify-advanced
body: { email, otp, purpose }

// Get Status
GET /api/otp/status/:email
```

## 💻 Electron API

```javascript
// Window controls
window.electronAPI.minimizeWindow();
window.electronAPI.maximizeWindow();
window.electronAPI.closeWindow();

// Storage
window.electronAPI.storeSet("key", value);
window.electronAPI.storeGet("key");

// Files
await window.electronAPI.openFile(options);
await window.electronAPI.saveFile(options);

// API calls
await window.electronAPI.callAPI(method, endpoint, data);
```

## 📂 Folder Structure

```
Electron/
├── src/
│   ├── pages/          - Page components
│   ├── styles/         - CSS files
│   ├── components/     - Reusable UI
│   ├── hooks/          - Custom hooks
│   ├── context/        - React context
│   └── utils/          - Utilities
├── main.js             - Electron process
├── preload.js          - Security layer
└── package.json        - Dependencies
```

## 🛠️ Environment Setup

### Prerequisites

- Node.js 16+
- npm or yarn
- MongoDB (for backend)

### Installation

```bash
cd Electron
npm install
cd ../Backend
npm install
```

### Start Services

```bash
# Terminal 1: Start backend
cd Backend
npm start

# Terminal 2: Start Electron app
cd Electron
npm run dev
```

## 📝 OTP Flow

1. **User enters email** → Validates format
2. **Click Send OTP** → Backend generates code
3. **Code sent to email** → EmailService handles
4. **User enters 6 digits** → UI validates
5. **Click Verify** → Multi-method DB verification:
   - Direct OTP lookup
   - OTP value match
   - User existence check
   - Signup record check
   - Database update
6. **Verified!** → Redirect to signup

## 🧪 Testing

### Manual Test Flow

1. Navigate to OTP page
2. Enter email: `test@example.com`
3. Click "Send OTP"
4. Check backend logs for OTP code
5. Enter the code (6 digits)
6. Click "Verify"
7. See success message

### Test Invalid OTP

- Enter wrong code
- See error with remaining attempts
- Can retry up to 5 times

### Test Resend

- Click "Resend OTP" after 60 seconds
- Gets new OTP code

## 🐛 Debugging

### Enable DevTools

```bash
npm run start:debug
```

### Check Logs

- Frontend: DevTools Console (F12)
- Backend: Terminal output

### Common Issues

- Port 5173 in use? Change in `vite.config.js`
- Backend not running? Start with `cd Backend && npm start`
- Dependencies missing? Run `npm install`

## 📊 Database

### MongoDB Collections

```javascript
// OTP collection structure
{
  email: "user@example.com",
  otp: "123456",
  purpose: "verification",
  isVerified: true,
  attempts: 0,
  expiresAt: ISODate("2024-01-07T..."),
  verifiedAt: ISODate("2024-01-07T..."),
  verificationMethod: "otp_code",
  userExists: true,
  signupExists: true
}
```

## 🔒 Security

✅ Context isolation: YES
✅ Node integration: NO
✅ Sandbox: YES
✅ Rate limiting: YES (5 per 15 min)
✅ Attempt tracking: YES (max 5)
✅ OTP expiration: YES (10 min)
✅ Input validation: YES

## 📱 Responsive Design

- Desktop: Full features (1400x900)
- Tablet: Adjusted layout (< 768px)
- Mobile: Single column, touch optimized (< 600px)

## 🚀 Production Build

```bash
# Build for production
npm run build:prod

# Create installers
npm run electron:build

# Output
dist_electron/
├── human-error-app-1.0.0.exe      (Windows)
├── human-error-1.0.0.dmg          (macOS)
└── human-error-1.0.0.AppImage     (Linux)
```

## 📚 Documentation Files

| File              | Content                         |
| ----------------- | ------------------------------- |
| README.md         | Project overview                |
| SETUP.md          | Detailed setup guide            |
| TESTING.md        | Test cases & procedures         |
| IMPLEMENTATION.md | Complete implementation details |

## 💡 Tips

- Use `npm run dev:hot` for faster development
- DevTools: Press F12 in app
- Check backend logs for API issues
- Use Postman for API testing
- MongoDB Compass for database inspection

## 🎯 What's Working

✅ React frontend fully integrated
✅ Electron window management
✅ OTP sending and verification
✅ Multi-method database verification
✅ User authentication flow
✅ Responsive UI
✅ Error handling
✅ Rate limiting
✅ Database operations

## 🔗 URLs

- Frontend (Vite): http://localhost:5173
- Backend API: http://localhost:5000
- MongoDB: mongodb://localhost:27017

## 📞 Need Help?

1. Check SETUP.md for installation issues
2. See TESTING.md for test procedures
3. Check backend logs for API errors
4. Use DevTools for frontend debugging
5. Run `npm run dev:hot` for HMR

---

**Quick Start**: `cd Electron && npm install && npm run dev`
