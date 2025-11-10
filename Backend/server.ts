import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import socketIo, { Server as SocketIOServer, Socket } from 'socket.io';
import session from 'express-session';
import { config } from 'dotenv';
import { cleanupInactiveSessions } from './middleware/session.middleware';
import maintenanceController from './controller/maintenance.controller';

const app: Application = express();
const server = http.createServer(app);
const port: string | number = process.env.PORT || 8000;

// Import all routes
import authRoutes from './Routes/auth.routes';
import signupRoutes from './Routes/SignupApi.routes';
import accountRoutes from './Routes/account.routes';
import adminRoutes from './Routes/adminApi.routes';
import classroomRoutes from './Routes/classroomApi.routes';
import sessionRoutes from './Routes/session.routes';
import webrtcRoutes from './Routes/webrtc.routes';
import compilerRoutes from './Routes/compiler.routes';
import enhancedUserRoutes from './Routes/enhanced-user.routes';
import analyticsRoutes from './Routes/analytics.routes';
import notificationRoutes from './Routes/notification.routes';
import enhancedWebrtcRoutes from './Routes/enhanced-webrtc.routes';
import maintenanceRoutes from './Routes/maintenance.routes';
import filemanagerRoutes from './Routes/filemanager.routes';
import snippetsRoutes from './Routes/snippets.routes';
import projectsRoutes from './Routes/projects.routes';
import collaborationRoutes from './Routes/collaboration.routes';
import achievementsRoutes from './Routes/achievements.routes';
import apiDocsRoutes from './Routes/api-docs.routes';
import passwordResetRoutes from './Routes/passwordReset.routes';
import otpRoutes from './Routes/otp.routes';

// DB Connect
import DBConnect from './DB/DBHandler';

// make an object of express
const io: SocketIOServer = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// dotEnv config
config();

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
    verify: (req: Request, res: Response, buf: Buffer, encoding: string) => {
        if (buf && buf.length) {
            try {
                JSON.parse(buf.toString());
            } catch (e) {
                const error = new Error('Invalid JSON');
                (error as any).status = 400;
                throw error;
            }
        }
    }
});
// app.use(jsonParser);

// login auth
app.use((req: Request, res: Response, next: NextFunction) => {
    // Allow the raw login handler to take over parsing for this specific path
    if (req.path === '/api/auth/login' && req.method === 'POST') return next();
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
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    console.log(`API Request: ${req.method} ${req.originalUrl}`, req.body);
    next();
});

const rawBody = express.raw({ type: '*/*', limit: '10mb' });
app.post('/api/auth/login', rawBody, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authController = require('./controller/auth.controller');
        let parsedBody: any = {};
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

// Maintenance middleware - check before other routes
app.use(maintenanceController.maintenanceMiddleware);

// DB Connect
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

// Socket.IO for WebRTC signaling
io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-session', (data: any) => {
        const { sessionId, userId } = data;
        socket.join(sessionId);
        socket.to(sessionId).emit('user-joined', userId);
    });

    socket.on('webrtc-signal', (data: any) => {
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
process.on("uncaughtException", (err: Error) => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
});

process.on("unhandledRejection", (reason: any, promise: Promise<any>) => {
    console.error("Unhandled Rejection:", reason);
    process.exit(1);
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
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
app.use('/api/*', function (req: Request, res: Response, next: NextFunction) {
    res.status(404).json({
        error: 'API Route not found',
        path: req.originalUrl,
        message: 'The requested API endpoint does not exist'
    });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status((err as any).status || 500).json({
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

export default server;
