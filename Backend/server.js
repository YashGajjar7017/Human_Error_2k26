const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const process = require('process');

const port = process.env.PORT || 8000;

// dotEnv config
require('dotenv').config();

// make an object of express
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Cross-origin-res
app.use(cors())

// Import maintenance controller for middleware
const maintenanceController = require('./controller/maintenance.controller');

// Import session cleanup function
const { cleanupInactiveSessions } = require('./middleware/session.middleware');

// Serve static files from Frontend directory
app.use(express.static(path.join(__dirname, '../Frontend')));

// Middleware to parse JSON bodies with error handling
app.use(express.json({
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
}));

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
    console.log(`API Request: ${req.method} ${req.originalUrl}`, req.body);
    next();
});

// Maintenance middleware - check before other routes
app.use(maintenanceController.maintenanceMiddleware);

// Import all routes
const authRoutes = require('./Routes/auth.routes');
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


// DB Connect
const DBConnect = require('./DB/DBHandler');
DBConnect();

// Mount all routes with proper prefixes
app.use('/api/auth', authRoutes);
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

// Admin panel API routes are now handled by the adminRoutes router

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
