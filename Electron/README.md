# Human Error - Electron Desktop Application

A modern, secure desktop application built with Electron and React for code compilation, learning, and collaboration.

## Features

### 🎨 Modern UI/UX

- **Gorgeous OTP Interface**: Beautiful, animated OTP verification screen with smooth transitions
- **Responsive Design**: Works seamlessly on all screen sizes
- **Dark Mode Ready**: Modern glassmorphic design with gradient backgrounds
- **Smooth Animations**: Fluid transitions and interactive elements

### 🔐 Security Features

- **Multi-Method OTP Verification**:
  - Direct database lookup
  - OTP value verification
  - User existence checking
  - Backup verification strategies
  - Rate limiting (5 OTP requests per 15 minutes)
- **Secure Token Management**: JWT-based authentication
- **Sandboxed Renderer Process**: Context isolation enabled
- **Environment-based Security**: Different security levels for dev/prod

### 💻 Desktop Integration

- **Native Window Management**: Window controls (minimize, maximize, close)
- **Persistent Storage**: Using Electron Store for app state
- **File Dialogs**: Native file open/save dialogs
- **IPC Communication**: Secure main-renderer communication
- **Backend Integration**: Built-in Node.js backend server management

### 🚀 Performance

- **Hot Module Replacement**: Fast development with HMR
- **Code Splitting**: Optimized bundle with vendor chunks
- **Lazy Loading**: Routes and components loaded on demand

## Project Structure

```
Electron/
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── OTP.jsx           # Modern OTP verification
│   │   └── Dashboard.jsx
│   ├── components/            # Reusable components
│   ├── styles/
│   │   ├── index.css          # Global styles
│   │   ├── Auth.css           # Auth pages
│   │   ├── OTP.css            # OTP gorgeous styling
│   │   └── Dashboard.css
│   ├── hooks/                 # Custom React hooks
│   ├── context/               # React context
│   ├── utils/                 # Utility functions
│   ├── App.jsx                # Main app component
│   └── main.jsx               # React entry point
├── main.js                    # Electron main process
├── preload.js                 # Secure preload script
├── index.html                 # HTML template
├── vite.config.js             # Vite configuration
├── package.json
└── README.md

Backend/
├── Routes/
│   └── otp.routes.js          # Enhanced with advanced verification
├── controller/
│   └── otp-improved.controller.js  # New multi-method verification
└── ...
```

## Installation

### Prerequisites

- Node.js 16+
- npm or yarn

### Setup

1. **Navigate to Electron folder**

```bash
cd Electron
```

2. **Install dependencies**

```bash
npm install
```

3. **Install backend dependencies** (from project root)

```bash
cd Backend
npm install
```

## Development

### Start Development Server

```bash
npm run dev
```

This will:

- Start the Vite dev server on http://localhost:5173
- Start the backend server
- Launch Electron app automatically

### With Hot Reload

```bash
npm run dev:hot
```

### Debug Mode

```bash
npm run start:debug
```

Opens DevTools automatically for debugging.

## Building

### Production Build

```bash
npm run build
```

### Package Electron App

```bash
npm run electron:build
```

Generates distributable packages for your platform.

## API Integration

### OTP Verification Flow

#### Send OTP

```javascript
const response = await window.electronAPI.callAPI("POST", "/api/otp/send", {
  email: "user@example.com",
  purpose: "verification",
});
```

#### Verify OTP (Advanced Multi-Method)

```javascript
const response = await window.electronAPI.callAPI(
  "POST",
  "/api/otp/verify-advanced",
  {
    email: "user@example.com",
    otp: "123456",
    purpose: "verification",
  }
);
```

#### Get Verification Status

```javascript
const response = await window.electronAPI.callAPI(
  "GET",
  "/api/otp/status/user@example.com",
  null
);
```

### Backend OTP Controller

The enhanced OTP controller provides:

- **generateOTP()**: Secure 6-digit OTP generation
- **sendOTPImproved()**: Email-based OTP delivery with improved error handling
- **verifyOTPImproved()**: Standard verification with attempt tracking
- **verifyOTPWithDBBackup()**: Multi-method verification with database backup strategies
- **getOTPVerificationStatus()**: Check verification status
- **resendOTPImproved()**: Rate-limited OTP resend

#### Multi-Method Verification Details

1. **Direct Database Lookup**: Queries OTP collection with multiple conditions
2. **OTP Value Verification**: Compares provided OTP with stored value
3. **User Existence Check**: Verifies user exists in User collection
4. **Signup Record Check**: For signup purpose, checks Signup collection
5. **Verification Status Update**: Marks OTP as verified with metadata

## OTP Features

### Security

- 10-minute expiration
- 6-digit codes
- Rate limiting (5 attempts per 15 minutes for verification)
- Attempt tracking (5 attempts maximum)
- Masked email display for privacy

### User Experience

- Beautiful animated UI
- Auto-focus between input fields
- Clipboard paste support
- Resend timer (60 seconds)
- Clear error messages with attempt counter
- Success feedback with smooth transitions

### Verification Methods

The system implements multiple verification strategies:

```javascript
// Standard verification
POST /api/otp/verify

// Advanced verification with DB backup
POST /api/otp/verify-advanced

// Check status
GET /api/otp/status/:email
```

## Electron API

### Window Controls

```javascript
window.electronAPI.minimizeWindow();
window.electronAPI.maximizeWindow();
window.electronAPI.closeWindow();
```

### Storage

```javascript
window.electronAPI.storeSet("key", value);
const value = window.electronAPI.storeGet("key");
```

### File Operations

```javascript
const filePath = await window.electronAPI.openFile(options);
const savePath = await window.electronAPI.saveFile(options);
```

### API Calls

```javascript
const response = await window.electronAPI.callAPI(method, endpoint, data);
```

## Environment Variables

Create `.env` file in Electron folder:

```env
VITE_API_URL=http://localhost:5000
NODE_ENV=development
ELECTRON_DEBUG=true
```

## Debugging

### Enable DevTools

```bash
npm run start:debug
```

### Console Logging

Frontend logs are visible in DevTools console.
Backend logs are printed to terminal.

### IPC Debugging

Check `main.js` for IPC event handling.

## Troubleshooting

### App won't start

- Ensure backend is running: `cd Backend && npm start`
- Check if port 5173 is available
- Check if port 5000 (backend) is available

### OTP not sending

- Verify email service configuration in Backend/.env
- Check Backend logs for Email Service errors
- Ensure MongoDB connection is working

### Build issues

- Clear node_modules: `rm -rf node_modules && npm install`
- Clear build artifacts: `npm run build`
- Check Node.js version: `node --version`

## Performance Optimization

- Code splitting for vendor libraries
- Lazy loading of routes
- Optimized CSS with autoprefixer
- Minified production builds
- Efficient state management

## Security Best Practices

✅ Context isolation enabled
✅ Node integration disabled
✅ Sandbox enabled
✅ Secure preload script
✅ CORS configured
✅ Input validation
✅ Rate limiting implemented
✅ XSS protection
✅ CSRF token support ready

## Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open pull request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues and questions, please refer to the project documentation or open an issue in the repository.

---

**Human Error Desktop App** - Making code learning and collaboration seamless.
