const express = require('express');
const cors = require('cors');
const path = require('path');
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
const snippetsRoutes = require('./Routes/snippets.routes');
const projectsRoutes = require('./Routes/projects.routes');
const collaborationRoutes = require('./Routes/collaboration.routes');
const achievementsRoutes = require('./Routes/achievements.routes');
const apiDocsRoutes = require('./Routes/api-docs.routes');
const passwordResetRoutes = require('./Routes/passwordReset.routes');
const otpRoutes = require('./Routes/otp.routes');
const memberRoutes = require('./Routes/member.routes');

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
app.use(express.static(path.join(__dirname, '../Frontend')));

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

// Maintenance middleware - check before other routes
app.use(maintenanceController.maintenanceMiddleware);

// DB Connect
DBConnect();

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
app.use('/api/snippets', snippetsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/docs', apiDocsRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api', memberRoutes);

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

// Catch-all handler for frontend routes
// app.get('*', (req, res) => {
//     // res.sendFile(path.join(__dirname, '../Frontend/views/index.html'));
//     res.sendStatus(404);
// });

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

// Maintenance server is now integrated into the main server

// Start the server
server.listen(port, () => {
    console.log(`🚀 Server is running on port ${port}`);
    console.log(`📡 WebSocket server ready`);
    console.log(`🔗 Health check: http://localhost:${port}/health`);
    console.log(`🔧 Maintenance mode integrated`);

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

    console.log(`🕒 Session cleanup scheduled (every 1 hour)`);
});

module.exports = server;
