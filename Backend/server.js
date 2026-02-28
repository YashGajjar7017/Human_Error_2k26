const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const process = require('process');
const { cleanupInactiveSessions } = require('./middleware/session.middleware');
const maintenanceController = require('./controller/maintenance.controller');
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8000;

// Import all routes
const authRoutes = require('./Routes/auth.routes');
const loginRoutes = require('./Routes/login.routes');
const signupRoutes = require('./Routes/SignupApi.routes');
const accountRoutes = require('./Routes/account.routes');
const adminRoutes = require('./Routes/adminApi.routes');
const classroomRoutes = require('./Routes/classroomApi.routes');
const sessionRoutes = require('./Routes/session.routes');
const webrtcRoutes = require('./Routes/webrtc.routes');
const compilerRoutes = require('./Routes/compiler.routes');
const enhancedUserRoutes = require('./Routes/enhanced-user.routes');
const analyticsRoutes = require('./Routes/analytics.routes');
const notificationRoutes = require('./Routes/notification.routes');
const enhancedWebrtcRoutes = require('./Routes/enhanced-webrtc.routes');
const maintenanceRoutes = require('./Routes/maintenance.routes');
const filemanagerRoutes = require('./Routes/filemanager.routes');
const editorRoutes = require('./Routes/editor.routes');
const snippetsRoutes = require('./Routes/snippets.routes');
const projectsRoutes = require('./Routes/projects.routes');
const collaborationRoutes = require('./Routes/collaboration.routes');
const achievementsRoutes = require('./Routes/achievements.routes');
const apiDocsRoutes = require('./Routes/api-docs.routes');
const passwordResetRoutes = require('./Routes/passwordReset.routes');
const otpRoutes = require('./Routes/otp.routes');
const memberRoutes = require('./Routes/member.routes');
const frontendMemberRoutes = require('../Frontend/Routes/Member.routes');
const publicUploadRoutes = require('./Routes/publicUpload.routes');
const securityRoutes = require('./Routes/security.routes');
const mlRoutes = require('./Routes/ml.routes');
const modeRoutes = require('./Routes/mode.routes');
const paymentRoutes = require('./Routes/payment.routes');
const userProfileRoutes = require('./Routes/user-profile.routes');
const validationRoutes = require('./Routes/validation.routes');
const debuggerRoutes = require('./Routes/debugger.routes');
const codeEngineRoutes = require('./Routes/codeEngine.routes');
const { router: routesFlowRouter, initializeRouteFlow } = require('./Routes/routes-flow.routes');
const sessionTrackingRoutes = require('./Routes/session-tracking.routes');
const userPreferencesRoutes = require('./Routes/user-preferences.routes');
const challengesRoutes = require('./Routes/challenges.routes');
const gamificationRoutes = require('./Routes/gamification.routes');
const { auth, authorize } = require('./middleware/auth.middleware');

// Import clock and github routes
const clockRoutes = require('../Frontend/Routes/clock.routes');
const githubRoutes = require('./Routes/github.routes');

// Import background services
const codeEngine = require('./service/codeEngine.service');
const backgroundWorker = require('./service/backgroundWorker.service');
const debuggerService = require('./service/debugger.service');

// DB Connect
const DBConnect = require('./DB/DBHandler');

// make an object of express
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// dotEnv config
require('dotenv').config();

// Trust proxy to handle forwarded headers correctly
app.set('trust proxy', true);

// Cross-origin-res
app.use(cors())

// Serve static files from Frontend directory
const config = require('../config/paths');
app.use(express.static(config.FRONTEND_PATH));

// Serve uploaded files for preview/download
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to parse JSON bodies with error handling
// Skip JSON parsing for the raw-login endpoint to allow our raw-body fallback handler
const jsonParser = express.json({
    limit: '10mb',
    verify: (req, res, buf, encoding) => {
        if (buf && buf.length) {
            try {
                JSON.parse(buf);
            } catch (e) {
                const error = new Error('Invalid JSON');
                error.status = 400;
                throw error;
            }
        }
    }
});

// Enable JSON parser middleware globally to fix undefined req.body data
// app.use(jsonParser);

// login auth
app.use((req, res, next) => {
    // Allow the raw login handler to take over parsing for this specific path
    if (req.path === '/api/auth/login' && req.method === 'POST') return next();
    if (req.path === '/api/login' && req.method === 'POST') return next();
    return jsonParser(req, res, next);
});

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));

// Session middleware for signup pages
app.use(session({
    secret: process.env.SESSION_SECRET || 'TokenCode@79182487',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    store: new session.MemoryStore()
}));

// API logging middleware
app.use('/api', (req, res, next) => {
    console.log(`API Request: ${req.method} ${req.originalUrl}`);
    next();
});

const rawBody = express.raw({ type: '*/*', limit: '10mb' });
app.post('/api/auth/login', rawBody, async (req, res, next) => {
    try {
        const authController = require('./controller/auth.controller');
        let parsedBody = {};
        const raw = req.body && req.body.length ? req.body.toString('utf8') : '';

        // Debug logging to help trace incoming payload issues
        console.log('--- raw-login handler invoked ---');
        console.log('Headers:', req.headers);
        console.log('Raw length:', req.body ? req.body.length : 0);
        console.log('Raw string (first 2000 chars):', raw.slice(0, 2000));

        if (raw) {
            // Try JSON
            try {
                parsedBody = JSON.parse(raw);
            } catch (e) {
                // Fallback: try URL-encoded (e.g., form submits or incorrect fetch)
                const qs = require('querystring');
                try {
                    parsedBody = qs.parse(raw);
                } catch (e2) {
                    parsedBody = {};
                }
            }
        }

        console.log('Parsed body:', parsedBody);

        // Attach parsed body and call controller
        req.body = parsedBody;
        return authController.login(req, res, next);
    } catch (err) {
        console.error('Raw login handler error:', err);
        return res.status(500).json({ success: false, message: 'Login handler error' });
    }
});

app.post('/api/login', rawBody, async (req, res, next) => {
    try {
        const loginController = require('./controller/login.controller');
        let parsedBody = {};
        const raw = req.body && req.body.length ? req.body.toString('utf8') : '';

        if (raw) {
            // Try JSON
            try {
                parsedBody = JSON.parse(raw);
            } catch (e) {
                // Fallback: try URL-encoded
                const qs = require('querystring');
                try {
                    parsedBody = qs.parse(raw);
                } catch (e2) {
                    parsedBody = {};
                }
            }
        }

        req.body = parsedBody;
        return loginController.login(req, res, next);
    } catch (err) {
        console.error('Raw login handler error for /api/login:', err);
        return res.status(500).json({ success: false, message: 'Login handler error' });
    }
});

// Maintenance login route - before maintenance middleware to allow admin access during maintenance
app.post('/api/maintenance/login', rawBody, async (req, res, next) => {
    try {
        const maintenanceController = require('./controller/maintenance.controller');
        let parsedBody = {};
        const raw = req.body && req.body.length ? req.body.toString('utf8') : '';

        if (raw) {
            // Try JSON
            try {
                parsedBody = JSON.parse(raw);
            } catch (e) {
                // Fallback: try URL-encoded
                const qs = require('querystring');
                try {
                    parsedBody = qs.parse(raw);
                } catch (e2) {
                    parsedBody = {};
                }
            }
        }

        req.body = parsedBody;
        return maintenanceController.maintenanceLogin(req, res, next);
    } catch (err) {
        console.error('Maintenance login handler error:', err);
        return res.status(500).json({ success: false, message: 'Maintenance login handler error' });
    }
});

// Maintenance middleware - check before other routes
app.use(maintenanceController.maintenanceMiddleware);

// DB Connect
// DBConnect(); // Commented out for testing

// Mount all routes with proper prefixes
app.use('/api/auth', authRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/account', accountRoutes); // Fixed: Removed duplicate /auth/signup path
app.use('/api/signup', signupRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/webrtc', webrtcRoutes);
app.use('/api/enhanced-webrtc', enhancedWebrtcRoutes);
app.use('/api/compiler', compilerRoutes);
app.use('/api/enhanced-users', enhancedUserRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/files', filemanagerRoutes);
app.use('/api/editor', editorRoutes);
app.use('/api/snippets', snippetsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/docs', apiDocsRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/mode', modeRoutes);
app.use('/api/users', userProfileRoutes);
app.use('/api/validate', validationRoutes);
app.use('/api/debugger', debuggerRoutes);
app.use('/api/code-engine', codeEngineRoutes);
app.use('/api/routes', routesFlowRouter);
app.use('/api/session-tracking', sessionTrackingRoutes);
app.use('/api', memberRoutes);
app.use('/', frontendMemberRoutes);
app.use(publicUploadRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/preferences', userPreferencesRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/clock', clockRoutes);
app.use('/api/github', githubRoutes);
// Mode management route (web/electron)
// app.use('/api/mode', modeRoutes);

// Socket.IO for WebRTC signaling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-session', (data) => {
        const { sessionId, userId } = data;
        socket.join(sessionId);
        socket.to(sessionId).emit('user-joined', userId);
    });

    socket.on('webrtc-signal', (data) => {
        const { sessionId, to, from, signal } = data;
        if (to) {
            socket.to(sessionId).emit('webrtc-signal', { from, to, signal });
        } else {
            socket.to(sessionId).emit('webrtc-signal', { from, signal });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Error handling
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection:", reason);
    process.exit(1);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Serve React production build (if present) and fallback to index.html for client-side routing
const buildCandidates = [
    path.join(__dirname, '../React-Complier-Frontend/dist'),
    config.REACT_FRONTEND_PATH ? path.join(config.REACT_FRONTEND_PATH, 'dist') : null,
    path.join(config.FRONTEND_PATH, 'react-app', 'dist')
];
let servedBuild = null;
for (const p of buildCandidates) {
    if (fs.existsSync(p)) {
        servedBuild = p;
        break;
    }
}
if (servedBuild) {
    app.use(express.static(servedBuild));
    app.get('*', (req, res, next) => {
        if (req.originalUrl.startsWith('/api')) return next();
        res.sendFile(path.join(servedBuild, 'index.html'));
    });
} else {
    // Catch-all handler for frontend routes when no SPA build exists
    app.get('*', (req, res) => {
        res.sendStatus(404);
    });
}

// Serve frontend SPA index to support client-side routing (one-way SPA navigation)
app.get('*', (req, res, next) => {
    if (req.method !== 'GET') return next();
    const indexPath = path.join(config.FRONTEND_PATH, 'views', 'index.html');
    try {
        if (fs.existsSync(indexPath)) {
            return res.sendFile(indexPath);
        }
    } catch (err) {
        console.error('Error serving SPA index:', err);
    }
    next();
});

// 404 handler for API routes
app.use('/api/*', function (req, res, next) {
    res.status(404).json({
        error: 'API Route not found',
        path: req.originalUrl,
        message: 'The requested API endpoint does not exist'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// Admin: list all server routes for auditing
app.get('/api/debug/routes', auth, authorize('admin'), (req, res) => {
    try {
        const routes = [];
        app._router.stack.forEach((middleware) => {
            if (middleware.route) { // routes registered directly on the app
                const method = Object.keys(middleware.route.methods)[0];
                routes.push({ path: middleware.route.path, method });
            } else if (middleware.name === 'router') { // router middleware
                middleware.handle.stack.forEach((handler) => {
                    if (handler.route) {
                        const method = Object.keys(handler.route.methods)[0];
                        routes.push({ path: handler.route.path, method });
                    }
                });
            }
        });

        // Deduplicate and sort
        const unique = Array.from(new Map(routes.map(r => [r.method + ' ' + r.path, r])).values()).sort((a,b) => (a.path > b.path ? 1 : -1));
        res.json({ success: true, count: unique.length, routes: unique });
    } catch (err) {
        console.error('Failed to list routes:', err);
        res.status(500).json({ success: false, error: 'Failed to list routes' });
    }
});

// Maintenance server is now integrated into the main server

// Start the server
server.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
    console.log(`📡 WebSocket server ready`);
    console.log(`🔗 Health check: http://localhost:${port}/health`);
    console.log(`🔧 Maintenance mode integrated`);
    console.log(`⚙️  Code Engine initialized`);
    console.log(`👷 Background Worker initialized with ${backgroundWorker.maxWorkers} workers`);
    console.log(`🕒 Clock API initialized`);
    console.log(`🐙 GitHub API initialized`);
    console.log(`🐛 Enhanced Debugger initialized`);

    // Start periodic session cleanup (every 1 hour)
    setInterval(async () => {
        try {
            const cleanedCount = await cleanupInactiveSessions();
            if (cleanedCount > 0) {
                console.log(`🧹 Cleaned up ${cleanedCount} inactive sessions`);
            }
        } catch (error) {
            console.error('❌ Error during session cleanup:', error);
        }
    }, 60 * 60 * 1000); // 1 hour in milliseconds

    // Clean up expired code execution sessions (every 30 minutes)
    setInterval(async () => {
        try {
            await codeEngine.cleanupExpiredSessions();
            console.log(`🧹 Code Engine: Cleaned up expired sessions`);
        } catch (error) {
            console.error('❌ Error during code engine cleanup:', error);
        }
    }, 30 * 60 * 1000); // 30 minutes

    // Clean up old background worker tasks (every 1 hour)
    setInterval(async () => {
        try {
            await backgroundWorker.clearOldTasks();
            console.log(`🧹 Background Worker: Cleaned up old tasks`);
        } catch (error) {
            console.error('❌ Error during worker cleanup:', error);
        }
    }, 60 * 60 * 1000); // 1 hour

    // Listen to code engine events
    codeEngine.on('code:success', ({ sessionId }) => {
        console.log(`✅ Code Engine: Execution success - ${sessionId}`);
    });

    codeEngine.on('code:error', ({ sessionId, error }) => {
        console.log(`❌ Code Engine: Execution failed - ${sessionId}: ${error}`);
    });

    // Listen to background worker events
    backgroundWorker.on('task:complete', ({ taskId, duration }) => {
        console.log(`✅ Worker: Task completed - ${taskId} (${duration}ms)`);
    });

    backgroundWorker.on('task:error', ({ taskId, error }) => {
        console.log(`❌ Worker: Task failed - ${taskId}: ${error}`);
    });

    // Listen to debugger events
    debuggerService.on('debug:started', ({ sessionId }) => {
        console.log(`🐛 Debugger: Session started - ${sessionId}`);
    });

    debuggerService.on('debug:paused', ({ sessionId, reason }) => {
        console.log(`⏸️  Debugger: Paused - ${sessionId} (${reason})`);
    });

    console.log(`🕒 Session cleanup scheduled (every 1 hour)`);
    console.log(`🕒 Code Engine cleanup scheduled (every 30 minutes)`);
    console.log(`🕒 Worker cleanup scheduled (every 1 hour)`);

    // Initialize route flow manager
    try {
        initializeRouteFlow(app);
        console.log(`📋 Route flow manager initialized`);
    } catch (error) {
        console.error('❌ Error initializing route flow manager:', error);
    }
});

module.exports = server;
