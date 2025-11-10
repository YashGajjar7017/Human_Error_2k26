import express, { Request, Response, NextFunction, Application } from 'express';
import cors from 'cors';
import session from 'express-session';
import path from 'path';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from 'dotenv';

const storeData = new session.MemoryStore();
const PORT: string | number = process.env.PORT || 3000;

// const that express routes
const adminData = require('./Routes/admin.routes');
const engineExp = require('./Routes/engine.routes');
const loginRoutes = require('./Routes/login.routes');
const signUpRoutes = require('./Routes/signup.routes');
const usrData = require('./Routes/User.routes');
const classroom = require('./Routes/classroom.routes');
const mailServer = require('./Routes/MailServer.routes');
const pdfSaver = require('./Routes/FileServices.routes');
const AccountHandling = require('./Routes/Account.routes');
const SessionHandling = require('./Routes/Session.routes');
const notificationsRoutes = require('./Routes/notifications.routes');
const filesRoutes = require('./Routes/files.routes');
const snippetsRoutes = require('./Routes/snippets.routes');
const projectsRoutes = require('./Routes/projects.routes');
const dashboardRoutes = require('./Routes/dashboard.routes');

// make an object of express
const app = express();

//Require to use .env package 
require('dotenv').config();

// Proxy are going to host only trusted
app.enable('trust proxy');

// Cross-origin-res
app.use(cors());

// body-parser (built-in express.json() is preferred)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// session initialise - must be before routes
app.use(session({
    secret: process.env.SESSION_SECRET || 'TokenCode@79182487',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    store: storeData
}));

// Static files
app.use(express.static(path.join(__dirname, 'Services')));
app.use(express.static(path.join(__dirname, 'Lib')));
app.use(express.static(path.join(__dirname, 'Public')));
app.use(express.static(path.join(__dirname, 'src')));
app.use(express.static(path.join(__dirname, 'views')));

// Proxy API requests to backend server
app.use('/api', createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/api' // Keep /api prefix
    }
}));

// |-----------Routes handler-------------|
app.use(engineExp);
app.use('/Account',loginRoutes);
app.use('/Account',AccountHandling);
app.use('/Account',SessionHandling);
app.use('/Account',signUpRoutes);
app.use('/Account',usrData);
app.use('/classroom',classroom);
app.use('/Admin/Api', adminData);
app.use('/User',pdfSaver);
app.use('/notifications', notificationsRoutes);
app.use('/files', filesRoutes);
app.use('/snippets', snippetsRoutes);
app.use('/projects', projectsRoutes);
app.use('/dashboard', dashboardRoutes);
app.use(mailServer);

// Home page route with dashboard access link
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// 404 error : putting at last after all the request are check
app.use(function (req: Request, res: Response, next: NextFunction) {
    res.setHeader('Content-Type', 'text/html');
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Frontend server running on port ${PORT}`);
});

export default app;
