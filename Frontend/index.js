const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const storeData = new session.MemoryStore();
const PORT = process.env.PORT || 3000;

// const that express routes
const adminData = require('./Routes/admin.routes');
const engineExp = require('./Routes/engine.routes');
const loginRoutes = require('./Routes/login.routes');
const signUpRoutes = require('./Routes/signup.routes');
const usrData = require('./Routes/User.routes');
const shopRoutes = require('./Routes/shop.routes');
const classroom = require('./Routes/classroom.routes');
const mailServer = require('./Routes/MailServer.routes');
const pdfSaver = require('./Routes/convertPDF.routes');

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
app.use(express.static(path.join(__dirname, 'Lib')));
app.use(express.static(path.join(__dirname, 'other')));
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
app.use(loginRoutes);
app.use(usrData);
app.use(classroom);
app.use(shopRoutes);
app.use(mailServer);
app.use(signUpRoutes);
app.use(pdfSaver);
app.use('/admin', adminData);

// 404 error : putting at last after all the request are check
app.use(function (req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.status(404).sendFile(path.join(__dirname, 'other', '404.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Frontend server running on port ${PORT}`);
});

module.exports = app;
