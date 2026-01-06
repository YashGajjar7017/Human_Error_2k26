# Project Route Documentation

## Complete Route Reference for Human_Error_2k26

This document provides a comprehensive overview of all API routes, frontend routes, and file structure for the Human_Error_2k26 project.

---

## 📁 Project Structure

```
Human_Error_2k26/
├── Backend/
│   ├── controller/           # Route controllers
│   ├── middleware/           # Express middleware
│   ├── models/               # Database models
│   ├── Routes/               # Route definitions
│   ├── util/                 # Utility functions
│   ├── DB/                   # Database handlers
│   ├── server.js             # Main Express server
│   └── package.json
├── Frontend/
│   ├── views/                # HTML pages
│   ├── controller/           # Frontend controllers
│   ├── Routes/               # Frontend routes
│   ├── Public/               # Static assets
│   ├── Services/             # API services
│   ├── models/               # Frontend models
│   └── index.js              # Frontend entry
├── CodePredictor/            # ML code prediction module
├── Config/                   # Configuration files
├── Docs/                     # Documentation
├── Electron/                 # Electron desktop app
├── Engine_TypeScript/        # TypeScript execution engine
├── Engine_Execution/         # GDB compiler setup
├── ML Training Dataset/      # ML training data
├── Peer_To_Peer_Connection/  # P2P connection module
├── React-Complier-Frontend/  # React frontend
├── Resources/                # Static resources
├── Scripts/                  # Utility scripts
└── README.md                 # This file
```

---

## 🔧 Backend API Routes

### Base URL: `/api`

### 1. Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/logout` | User logout | Yes |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/send-otp` | Send OTP for verification | No |
| POST | `/api/auth/verify-otp` | Verify OTP | No |
| GET | `/api/auth/health` | Health check | No |
| POST | `/api/auth/usrLogin` | Legacy login | No |
| POST | `/api/auth/regUser` | Legacy registration | No |
| POST | `/api/auth/authToken` | Token authentication | No |
| POST | `/api/auth/verifyEmail` | Verify email | No |
| POST | `/api/auth/SendOTPEmail` | Send OTP via email | No |
| GET | `/api/auth/userAccept` | User acceptance | No |
| POST | `/api/auth/regUserQR` | QR registration | No |
| GET | `/api/auth/UserProtected` | Protected route check | No |

### 2. Login Routes (`/api/login`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/login` | User login | No |

### 3. Signup Routes (`/api/signup`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/signup` | API documentation & health | No |
| GET | `/api/signup/:signupToken` | Validate signup token | No |
| POST | `/api/signup` | Register new user | No |
| POST | `/api/signup/otp` | Send OTP for verification | No |
| POST | `/api/signup/verify-otp` | Verify OTP & create account | No |
| POST | `/api/signup/admin/force-verify` | Admin force verify (admin only) | Yes |

### 4. Member Routes (`/api/members`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/members` | Get all members | No* |
| GET | `/api/members/stats` | Get members statistics | No* |
| GET | `/api/members/:memberId` | Get member by ID | No* |
| GET | `/api/members/:memberId/profile` | Get detailed profile | No* |
| GET | `/api/members/:memberId/activity` | Get activity logs | No* |
| GET | `/api/members/:memberId/projects` | Get member projects | No* |
| GET | `/api/members/:memberId/compilations` | Get compilation history | No* |
| GET | `/api/members/search/:query` | Search members | No* |
| GET | `/api/members/me` | Get current member profile | Yes |
| POST | `/api/members` | Create new member (admin) | Yes* |
| POST | `/api/members/:memberId/upgrade` | Upgrade member plan | Yes* |
| POST | `/api/members/:memberId/downgrade` | Downgrade member plan | Yes* |
| POST | `/api/members/:memberId/suspend` | Suspend member | Yes* |
| POST | `/api/members/:memberId/activate` | Activate member | Yes* |
| PATCH | `/api/members/:memberId` | Update member (partial) | Yes* |
| PUT | `/api/members/:memberId/profile` | Update profile (full) | Yes* |
| PATCH | `/api/members/:memberId/settings` | Update settings | Yes* |
| DELETE | `/api/members/:memberId` | Delete member (admin) | Yes* |
| DELETE | `/api/members/:memberId/data` | Delete all member data | Yes* |

### 5. Classroom Routes (`/api/classrooms`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/Account/classroom` | Create classroom | Yes* |
| POST | `/api/Account/classroom/:Token` | Classroom by token | Yes* |
| GET | `/api/classrooms` | Get all classrooms | No* |
| GET | `/api/classrooms/:id` | Get classroom by ID | No* |
| POST | `/api/classrooms` | Create classroom (admin) | Yes |
| PUT | `/api/classrooms/:id` | Update classroom (admin) | Yes |
| DELETE | `/api/classrooms/:id` | Delete classroom (admin) | Yes |
| POST | `/api/classrooms/add-student` | Add student (admin) | Yes |
| POST | `/api/classrooms/remove-student` | Remove student (admin) | Yes |
| GET | `/api/classrooms/instructor/:instructorId` | Get instructor classrooms | Yes |
| GET | `/api/classrooms/student/:studentId` | Get student classrooms | Yes |
| GET | `/api/classrooms/:id/share` | Get share link | No* |
| POST | `/api/classrooms/join/:code` | Join classroom | No* |

### 6. Session Routes (`/api/sessions`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/sessions/create` | Create new session | Yes |
| GET | `/api/sessions/:sessionId` | Get session details | No* |
| POST | `/api/sessions/:sessionId/join` | Join session | Yes |
| PUT | `/api/sessions/:sessionId/update` | Update session code | Yes |
| GET | `/api/sessions/:sessionId/share` | Get share code | No* |
| GET | `/api/sessions/:sessionId/share/link` | Get share link | No* |
| GET | `/api/sessions/:sessionId/share/qr` | Get QR code | No* |
| GET | `/api/sessions/active` | Get active sessions | No* |
| POST | `/api/sessions/:sessionId/code/save` | Save code | Yes |
| GET | `/api/sessions/:sessionId/code/get` | Get code | No* |
| POST | `/api/sessions/:sessionId/cursor/update` | Update cursor position | Yes |
| GET | `/api/sessions/:sessionId/participants` | Get participants | No* |
| POST | `/api/sessions/:sessionId/chat/message` | Send chat message | Yes |
| GET | `/api/sessions/:sessionId/chat/messages` | Get chat history | No* |
| POST | `/api/sessions/:sessionId/webrtc/offer` | WebRTC offer | Yes |
| POST | `/api/sessions/:sessionId/webrtc/answer` | WebRTC answer | Yes |
| POST | `/api/sessions/:sessionId/webrtc/ice-candidate` | ICE candidate | Yes |
| DELETE | `/api/sessions/:sessionId/end` | End session | Yes |
| POST | `/api/sessions/:sessionId/leave` | Leave session | Yes |

### 7. WebRTC Routes (`/api/webrtc`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/webrtc/signal/:sessionId` | Send WebRTC signal | Yes |
| GET | `/api/webrtc/signals/:sessionId` | Get session signals | Yes* |
| GET | `/api/webrtc/quality/:sessionId` | Get connection quality | Yes* |
| POST | `/api/webrtc/record/:sessionId` | Control recording | Yes |
| GET | `/api/webrtc/stats/:sessionId` | Get session stats | Yes* |
| GET | `/api/webrtc/participants/:sessionId` | Get participants | Yes* |
| POST | `/api/webrtc/screen-share/:sessionId/start` | Start screen share | Yes |
| POST | `/api/webrtc/screen-share/:sessionId/stop` | Stop screen share | Yes |
| POST | `/api/webrtc/media/:sessionId/mute` | Mute media | Yes |
| POST | `/api/webrtc/media/:sessionId/unmute` | Unmute media | Yes |
| GET | `/api/webrtc/ice-servers` | Get ICE server config | No |
| GET | `/api/webrtc/health/:sessionId` | Health check | Yes* |
| POST | `/api/webrtc/error/:sessionId` | Report error | Yes |
| POST | `/api/webrtc/bandwidth/:sessionId/adjust` | Adjust bandwidth | Yes |
| POST | `/api/webrtc/chat/:sessionId/message` | Send chat message | Yes |
| GET | `/api/webrtc/chat/:sessionId/history` | Get chat history | Yes* |
| POST | `/api/webrtc/file-transfer/:sessionId/initiate` | Initiate file transfer | Yes |
| POST | `/api/webrtc/file-transfer/:sessionId/accept` | Accept file transfer | Yes |
| POST | `/api/webrtc/recording/:sessionId/schedule` | Schedule recording | Yes |
| GET | `/api/webrtc/recording/:sessionId/status` | Get recording status | Yes* |
| POST | `/api/webrtc/migrate/:sessionId/prepare` | Prepare migration | Yes |
| POST | `/api/webrtc/migrate/:sessionId/complete` | Complete migration | Yes |
| GET | `/api/webrtc/analytics/:sessionId` | Get analytics | Yes* |
| GET | `/api/webrtc/playback/:sessionId/recordings` | Get recordings | Yes* |
| GET | `/api/webrtc/playback/:sessionId/recording/:recordingId` | Get specific recording | Yes* |
| POST | `/api/webrtc/recovery/:sessionId/reconnect` | Reconnect | Yes |
| POST | `/api/webrtc/recovery/:sessionId/force-sync` | Force sync | Yes |
| POST | `/api/webrtc/adapt/:sessionId/network-change` | Network adaptation | Yes |
| POST | `/api/webrtc/security/:sessionId/encrypt` | Enable encryption | Yes |
| POST | `/api/webrtc/multi-stream/:sessionId/add` | Add multi-stream | Yes |
| POST | `/api/webrtc/audio/:sessionId/noise-suppression` | Noise suppression | Yes |
| POST | `/api/webrtc/video/:sessionId/virtual-background` | Virtual background | Yes |

### 8. Compiler Routes (`/api/compiler`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/compiler/compile` | Compile C/C++ file | No* |
| POST | `/api/compiler/compile-content` | Compile code content | No* |
| POST | `/api/compiler/debug` | Debug file | No* |
| GET | `/api/compiler/info` | Get compiler info | No |
| GET | `/api/compiler/version` | Get compiler version | No |
| POST | `/api/compiler/compile/python` | Compile Python | No* |
| POST | `/api/compiler/compile/java` | Compile Java | No* |
| POST | `/api/compiler/compile/javascript` | Execute JavaScript | No* |
| POST | `/api/compiler/compile/typescript` | Compile TypeScript | No* |
| POST | `/api/compiler/compile/go` | Compile Go | No* |
| POST | `/api/compiler/compile/rust` | Compile Rust | No* |
| POST | `/api/compiler/detect-language` | Detect language | No |
| POST | `/api/compiler/format` | Format code | No |
| POST | `/api/compiler/lint` | Lint code | No |
| GET | `/api/compiler/languages` | Get supported languages | No |
| POST | `/api/compiler/compile/native` | Native compile (C/C++) | No* |

### 9. Debugger Routes (`/api/debugger`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/debugger` | API documentation | No |
| POST | `/api/debugger/compile` | Compile with debug symbols | No* |
| POST | `/api/debugger/run` | Compile and run | No* |
| POST | `/api/debugger/debug` | Run debugger (GDB) | No* |
| GET | `/api/debugger/debug/:sessionId` | Get debug info | Yes* |
| GET | `/api/debugger/languages` | Get supported languages | No |
| POST | `/api/debugger/cleanup` | Cleanup sessions (admin) | Yes |

### 10. Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin` | Admin dashboard | Yes |
| GET | `/api/admin/config` | Get admin config | Yes |
| PUT | `/api/admin/config` | Update admin config | Yes |
| GET | `/api/admin/maintenance/status` | Get maintenance status | Yes |
| POST | `/api/admin/maintenance/enable` | Enable maintenance | Yes |
| POST | `/api/admin/maintenance/disable` | Disable maintenance | Yes |
| PUT | `/api/admin/maintenance/message` | Update message | Yes |
| POST | `/api/admin/maintenance/allowed-ip/add` | Add allowed IP | Yes |
| DELETE | `/api/admin/maintenance/allowed-ip/remove` | Remove allowed IP | Yes |
| GET | `/api/admin/dashboard` | Admin dashboard | Yes |
| GET | `/api/admin/users` | Get all users | Yes |
| DELETE | `/api/admin/users/:id` | Delete user | Yes |
| GET | `/api/admin/settings` | Get settings | Yes |
| PUT | `/api/admin/settings` | Save settings | Yes |
| GET | `/api/admin/analytics` | Get analytics | Yes |
| GET | `/api/admin/logs` | Get logs | Yes |

### 11. Member Routes (Legacy - `/api/member`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/member` | Get member info | Yes |
| POST | `/api/member` | Create member | Yes |
| PUT | `/api/member` | Update member | Yes |
| DELETE | `/api/member` | Delete member | Yes |
| GET | `/api/member/list` | List members | Yes |
| GET | `/api/member/search/:query` | Search members | Yes |
| GET | `/api/member/profile` | Get profile | Yes |
| POST | `/api/member/profile/update` | Update profile | Yes |

### 12. Session Tracking Routes (`/api/session-tracking`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/session-tracking` | API documentation | No |
| POST | `/api/session-tracking/create` | Create session | Yes* |
| POST | `/api/session-tracking/page-view` | Track page view | Yes* |
| POST | `/api/session-tracking/event` | Track user event | Yes* |
| POST | `/api/session-tracking/end` | End session | Yes* |
| GET | `/api/session-tracking/details/:sessionId` | Get session details | Yes* |
| GET | `/api/session-tracking/user/:userId` | Get user sessions | Yes |
| GET | `/api/session-tracking/analytics/:userId` | Get behavior analytics | Yes |
| POST | `/api/session-tracking/error` | Track error | Yes* |

### 13. OTP Routes (`/api/otp`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/otp` | API documentation | No |
| POST | `/api/otp/send` | Send OTP | No |
| POST | `/api/otp/verify` | Verify OTP | No |
| POST | `/api/otp/resend` | Resend OTP | No |

### 14. Password Reset Routes (`/api/password-reset`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/password-reset` | API documentation | No |
| POST | `/api/password-reset/request` | Request reset OTP | No |
| POST | `/api/password-reset/verify-otp` | Verify reset OTP | No |
| POST | `/api/password-reset/reset` | Reset password | No |

### 15. User Profile Routes (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/profile` | Get current user profile | Yes |
| PUT | `/api/users/profile` | Update profile | Yes |
| GET | `/api/users/:id` | Get user by ID | No* |
| PUT | `/api/users/:id` | Update user (admin) | Yes |
| DELETE | `/api/users/:id` | Delete user (admin) | Yes |

### 16. Validation Routes (`/api/validate`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/validate/email` | Validate email | No |
| POST | `/api/validate/username` | Validate username | No |
| POST | `/api/validate/password` | Validate password | No |
| POST | `/api/validate/signup-data` | Validate signup data | No |

### 17. Snippets Routes (`/api/snippets`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/snippets` | Get user snippets | Yes |
| GET | `/api/snippets/public` | Get public snippets | Yes |
| GET | `/api/snippets/:id` | Get specific snippet | Yes |
| POST | `/api/snippets` | Create snippet | Yes |
| PUT | `/api/snippets/:id` | Update snippet | Yes |
| DELETE | `/api/snippets/:id` | Delete snippet | Yes |
| POST | `/api/snippets/:id/fork` | Fork snippet | Yes |
| POST | `/api/snippets/:id/like` | Like snippet | Yes |
| GET | `/api/snippets/stats/overview` | Get stats | Yes |
| GET | `/api/snippets/tags/popular` | Get popular tags | Yes |
| GET | `/api/snippets/languages` | Get languages | No |

### 18. Projects Routes (`/api/projects`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/projects` | Get user projects | Yes |
| GET | `/api/projects/public` | Get public projects | Yes |
| GET | `/api/projects/:id` | Get specific project | Yes |
| POST | `/api/projects` | Create project | Yes |
| PUT | `/api/projects/:id` | Update project | Yes |
| DELETE | `/api/projects/:id` | Delete project | Yes |
| POST | `/api/projects/:id/members` | Add member | Yes |
| DELETE | `/api/projects/:id/members/:memberId` | Remove member | Yes |
| POST | `/api/projects/:id/fork` | Fork project | Yes |
| POST | `/api/projects/:id/star` | Star project | Yes |
| GET | `/api/projects/stats/overview` | Get stats | Yes |
| GET | `/api/projects/languages` | Get languages | No |

### 19. Collaboration Routes (`/api/collaboration`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/collaboration/sessions` | Create session | Yes |
| GET | `/api/collaboration/sessions` | Get sessions | Yes |
| GET | `/api/collaboration/sessions/:id` | Get session | Yes |
| PUT | `/api/collaboration/sessions/:id` | Update session | Yes |
| POST | `/api/collaboration/sessions/:id/join` | Join session | Yes |
| POST | `/api/collaboration/sessions/:id/leave` | Leave session | Yes |
| POST | `/api/collaboration/comments` | Add comment | Yes |
| GET | `/api/collaboration/sessions/:sessionId/comments` | Get comments | Yes |
| PUT | `/api/collaboration/comments/:id/resolve` | Resolve comment | Yes |
| POST | `/api/collaboration/reviews` | Create code review | Yes |
| GET | `/api/collaboration/reviews` | Get code reviews | Yes |
| POST | `/api/collaboration/reviews/:id/feedback` | Submit feedback | Yes |

### 20. Achievements Routes (`/api/achievements`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/achievements` | Get all achievements | No |
| GET | `/api/achievements/categories` | Get categories | No |
| GET | `/api/achievements/user` | Get user achievements | Yes |
| GET | `/api/achievements/user/progress` | Get user progress | Yes |
| GET | `/api/achievements/user/stats` | Get user stats | Yes |
| POST | `/api/achievements/check` | Check & award achievements | Yes |
| GET | `/api/achievements/leaderboard` | Get leaderboard | No |

### 21. Notifications Routes (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications` | Get user notifications | Yes |
| GET | `/api/notifications/unread-count` | Get unread count | Yes |
| POST | `/api/notifications` | Create notification | Yes |
| PUT | `/api/notifications/:id/read` | Mark as read | Yes |
| PUT | `/api/notifications/read-all` | Mark all as read | Yes |
| DELETE | `/api/notifications/:id` | Delete notification | Yes |
| DELETE | `/api/notifications/read/delete` | Delete read notifications | Yes |
| GET | `/api/notifications/types` | Get notification types | No |
| POST | `/api/notifications/broadcast` | Broadcast (admin) | Yes |

### 22. File Manager Routes (`/api/files`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/files/list` | List files | Yes |
| POST | `/api/files/upload` | Upload file | Yes |
| GET | `/api/files/download/:filename` | Download file | Yes* |
| DELETE | `/api/files/:filename` | Delete file | Yes |
| PUT | `/api/files/:filename` | Rename file | Yes |
| POST | `/api/files/create-dir` | Create directory | Yes |
| DELETE | `/api/files/delete-dir/:dirname` | Delete directory | Yes |

### 23. Editor Routes (`/api/editor`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/editor/list` | List directory | Yes |
| POST | `/api/editor/read` | Read file | Yes |
| POST | `/api/editor/write` | Write file | Yes |
| POST | `/api/editor/sync` | Sync updates | Yes |

### 24. Security Routes (`/api/security`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/security/store-jwt` | Store JWT | Yes |

### 25. ML Routes (`/api/ml`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/ml/predict` | Get code prediction | Yes |
| GET | `/api/ml/status` | Get ML status | Yes |

### 26. Mode Routes (`/api/mode`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/mode` | Get current mode | No |
| POST | `/api/mode/set` | Set mode | Yes |

### 27. Payment Routes (`/api/payments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payments/create-intent` | Create payment intent | Yes |
| POST | `/api/payments/create-checkout` | Create checkout session | Yes |
| POST | `/api/payments/webhook` | Payment webhook | No |

### 28. Maintenance Routes (`/api/maintenance`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/maintenance/status` | Get maintenance status | No |
| POST | `/api/maintenance/login` | Maintenance login | No |

### 29. Analytics Routes (`/api/analytics`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics` | Get analytics | Yes* |

### 30. Account Routes (`/api/account`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/account/update-password` | Update password | Yes |
| POST | `/api/account/delete` | Delete account | Yes |

### 31. Public Upload Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/public-upload` | Upload public file | No |
| GET | `/public/:uploadId` | Access public upload | No |

### 32. API Docs Routes (`/api/docs`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/docs` | API documentation | No |

### 33. Route Flow Routes (`/api/routes`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/routes/flow` | Get route flow structure | No* |
| GET | `/api/routes/diagram` | Get ASCII flow diagram | No* |
| GET | `/api/routes/tree` | Get route tree | No* |
| GET | `/api/routes/section/:section` | Get routes by section | No* |
| GET | `/api/routes/method/:method` | Get routes by method | No* |
| GET | `/api/routes/protected` | Get protected routes | Yes |
| GET | `/api/routes/public` | Get public routes | No |
| GET | `/api/routes/search` | Search routes | No* |
| GET | `/api/routes/stats` | Get route statistics | No* |
| POST | `/api/routes/refresh` | Refresh routes (admin) | Yes |

### 34. Debug Routes (`/api/debug`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/debug/routes` | List all routes (admin) | Yes |

---

## 🌐 Frontend Routes

### Base URL: `/`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Home page (index.html) |
| GET | `/index.html` | Home page |
| GET | `/login` | Login page |
| GET | `/login.html` | Login page |
| GET | `/login_W.html` | Login page (alternate) |
| GET | `/login_test.html` | Login test page |
| GET | `/login_1.html` | Login page v1 |
| GET | `/login_overlay.html` | Login overlay |
| GET | `/Signup` | Signup page |
| GET | `/Signup.html` | Signup page |
| GET | `/SignupApi` | Signup API page |
| GET | `/forgotPassword` | Forgot password page |
| GET | `/forgotPassword.html` | Forgot password page |
| GET | `/resetPassword` | Reset password page |
| GET | `/resetPassword.html` | Reset password page |
| GET | `/otp` | OTP verification page |
| GET | `/otp.html` | OTP page |
| GET | `/otp_1.html` | OTP page v1 |
| GET | `/OTP_Modern.html` | Modern OTP page |
| GET | `/Dashboard_User` | User dashboard |
| GET | `/Dashboard_User.html` | User dashboard |
| GET | `/Dashboard_admin` | Admin dashboard |
| GET | `/Dashboard_admin.html` | Admin dashboard |
| GET | `/Dashboard_error` | Error dashboard |
| GET | `/Dashboard_error.html` | Error dashboard |
| GET | `/dashboard_W.html` | Dashboard (alternate) |
| GET | `/classroom` | Classroom page |
| GET | `/classroom.html` | Classroom page |
| GET | `/classroom_W.html` | Classroom (alternate) |
| GET | `/editor` | Code editor |
| GET | `/editor.html` | Code editor |
| GET | `/collaboration` | Collaboration page |
| GET | `/collaboration.html` | Collaboration page |
| GET | `/session` | Session page |
| GET | `/session.html` | Session page |
| GET | `/achievements` | Achievements page |
| GET | `/achievements.html` | Achievements page |
| GET | `/analytics` | Analytics page |
| GET | `/analytics.html` | Analytics page |
| GET | `/security` | Security settings |
| GET | `/security.html` | Security settings |
| GET | `/membership` | Membership page |
| GET | `/membership.html` | Membership page |
| GET | `/contactUs` | Contact page |
| GET | `/contactUs.html` | Contact page |
| GET | `/theme` | Theme settings |
| GET | `/theme.html` | Theme settings |
| GET | `/Maintenance` | Maintenance page |
| GET | `/Maintenance.html` | Maintenance page |
| GET | `/api-docs` | API documentation |
| GET | `/api-docs.html` | API documentation |
| GET | `/404` | 404 page |
| GET | `/404.html` | 404 page |
| GET | `/404_1.html` | 404 page v1 |

### Frontend Member Routes (`/members`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/members` | Members directory |
| GET | `/members/search` | Search members |
| GET | `/members/:memberId` | Member profile |
| GET | `/members/:memberId/projects` | Member projects |
| GET | `/members/:memberId/activity` | Member activity |
| GET | `/members/admin/dashboard` | Admin dashboard |
| GET | `/members/admin/:memberId/edit` | Edit member (admin) |

---

## 🔐 Authentication Middleware

All routes marked as requiring authentication use the following middleware:

```javascript
const { auth } = require('../middleware/auth.middleware');
```

### Protected Routes
Routes requiring admin authorization use:
```javascript
const { auth, authorize } = require('../middleware/auth.middleware');
router.use(authorize('admin'));
```

---

## 📊 HTTP Methods Summary

| Method | Count | Description |
|--------|-------|-------------|
| GET | ~80 | Retrieve data |
| POST | ~60 | Create data, submit forms |
| PUT | ~15 | Full update |
| PATCH | ~5 | Partial update |
| DELETE | ~10 | Remove data |

---

## 🚀 Quick Start

### Run Backend Server
```bash
cd Backend
npm install
npm start
```

### Run Frontend
```bash
cd Frontend
npm install
npm start
```

---

## 📝 Notes

- Routes marked with `*` have additional access control based on ownership, visibility, or role
- All `/api/*` routes return JSON responses
- Frontend routes serve HTML pages
- Socket.IO handles real-time WebRTC signaling on connection events
- Session cleanup runs every 1 hour

---

## 🔗 Related Documentation

- [Quick Reference](../Docs/QUICK_REFERENCE.md)
- [Implementation Summary](../Docs/IMPLEMENTATION_SUMMARY.md)
- [Member API Documentation](../Docs/MEMBER_API_DOCS.md)
- [Route Flow Manager](../Backend/util/RouteFlowManager.js)

---

**Last Updated:** 2024
**Project:** Human_Error_2k26

