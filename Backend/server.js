const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

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

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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


// DB Connect
const DBConnect = require('./DB/DBHandler');
DBConnect();

// Mount all routes with proper prefixes
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes); // Fixed: Removed duplicate /auth/signup path
app.use('/api/signup', signupRoutes);

// Add GET route for /Maintenance to serve maintenance page
app.get('/Maintenance', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/views/Services/Maintenance.html'));
});

// Add GET route for /other/login/index.html to serve login page
app.get('/other/login/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/other/login/index.html'));
});

// Add GET route for /Account/Signup to fix route not found error
app.get('/Account/Signup', (req, res) => {
    res.json({
        success: true,
        message: 'Account Signup API',
        endpoints: {
            signup: {
                method: 'POST',
                path: '/api/account/Account/Signup',
                description: 'Register a new user account',
                body: {
                    username: 'string (required)',
                    email: 'string (required, valid email)',
                    password: 'string (required, min 6 chars)',
                    confirmPassword: 'string (required, must match password)'
                }
            },
            sendOtp: {
                method: 'POST',
                path: '/api/account/Account/SignupOTP',
                description: 'Send OTP to email for verification',
                body: {
                    email: 'string (required, valid email)'
                }
            },
            verifyOtp: {
                method: 'POST',
                path: '/api/account/Account/verifyOTP',
                description: 'Verify OTP sent to email',
                body: {
                    email: 'string (required, valid email)',
                    otp: 'string (required, 6 digits)'
                }
            }
        }
    });
});
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

// Serve static files
app.use('/compiler/temp', express.static(path.join(__dirname, 'compiler', 'temp')));
app.use(express.static(path.join(__dirname, '../Frontend')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use(function (req, res, next) {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        message: 'The requested endpoint does not exist'
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
});

module.exports = server;
