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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

// Serve login popup
app.get('/popup', (req, res) => {
    const popupHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Login | Human Error</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .popup { max-width: 400px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; }
        input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
        button { width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background: #0056b3; }
        .error { color: red; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="popup">
        <h2>Login</h2>
        <form id="loginForm">
            <div class="form-group">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Login</button>
        </form>
        <div id="error" class="error"></div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('error');

            try {
                const response = await fetch('/api/auth/popup-login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (data.success) {
                    // Send success data to parent window
                    window.opener.postMessage({
                        type: 'LOGIN_SUCCESS',
                        token: data.token,
                        user: data.user
                    }, '*');
                    window.close();
                } else {
                    errorDiv.textContent = data.message || 'Login failed';
                }
            } catch (error) {
                console.error('Login error:', error);
                errorDiv.textContent = 'An error occurred during login. Please try again.';
            }
        });
    </script>
</body>
</html>`;
    res.send(popupHtml);
});

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
