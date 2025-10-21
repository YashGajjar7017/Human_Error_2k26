const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const nodemailer = require('nodemailer');
const axios = require('axios');
const crypto = require('crypto');
const { mongoose, Schema } = require('mongoose')
const UserLogin = require('../models/UserLogin.models.js');

//Require to use .env package 
require('dotenv').config();

// In-memory store for users and their OTP secret keys (for demonstration purposes)
let emailVerificationCodes = {};
let activeTokens = {};
let users = {};

// Export activeTokens for use in other modules
module.exports.activeTokens = activeTokens;

// Setup a dummy transporter for sending OTP via email (optional)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAILID,
        pass: process.env.PASSWORD,
    },
});

// Route: Authenticate (JWT verification)
exports.authToken = (req, res, next) => {
    const token = req.body.token;

    if (!token) {
        return res.status(400).json({ message: 'Token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        // Check if the token is still active
        if (!activeTokens[token]) {
            return res.status(401).json({ message: 'Token not active' });
        }

        res.status(200).json({ message: 'Authenticated successfully', user: decoded });
    });
};

// credentials => user
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization') && req.header('Authorization').startsWith('Bearer ') 
    ? req.header('Authorization').replace('Bearer ', '') 
    : null;

    if (!token) {
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token' });
    }
};

// login
exports.usrLogin = async (req, res, next) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Find user by username
        const user = await UserLogin.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Check password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        // Store token in active tokens
        activeTokens[token] = true;

        res.status(200).json({ 
            message: 'Login successful', 
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// Register
exports.regUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    try {
        // Check if user already exists
        const existingUser = await UserLogin.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                message: existingUser.email === email ? 'Email already in use' : 'Username already taken' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new user
        const newUser = new UserLogin({ 
            username, 
            email, 
            password: hashedPassword 
        });

        await newUser.save();

        // Generate verification code
        const verificationCode = crypto.randomBytes(3).toString('hex');
        emailVerificationCodes[email] = verificationCode;

        // Send verification email
        await transporter.sendMail({
            from: process.env.EMAILID,
            to: email,
            subject: 'Verify your email address',
            text: `Your verification code is: ${verificationCode}`
        });

        res.status(201).json({ 
            message: 'Registration successful. Check your email to verify your account.',
            userId: newUser._id 
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Registration failed' });
    }
};

// api => user
exports.userAccept = (req, res, next) => {
    const { usr } = req.query;
    
    if (!usr) {
        return res.status(400).json({ message: 'Username parameter is required' });
    }

    const UsrFetcher = [
        {
            id: 1,
            username: usr,
            password: '$2a$10$I1k7ygOd1pv3zQy3Bz9mO0R6qAZ8Vs35Irm6mkvq2NesocTBqzL6C' // hashed 'password123'
        }
    ];
    
    return res.json(UsrFetcher);
};

// Route to generate OTP secret (when the user registers)
exports.regUserQR = (req, res, next) => {
    const { username, email } = req.body;

    if (!username || !email) {
        return res.status(400).json({ message: 'Username and email are required' });
    }

    // Generate a new OTP secret for the user
    const secret = speakeasy.generateSecret({ name: username });
    users[username] = { email, secret: secret.base32 };

    // Generate QR code
    qrcode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
        if (err) {
            console.error('QR generation error:', err);
            return res.status(500).json({ error: 'Error generating QR code' });
        }

        res.json({
            message: 'Registration successful',
            qrCodeUrl: dataUrl,
            secret: secret.base32
        });
    });
};

// A protected route
exports.UserProtected = [verifyToken, (req, res, next) => {
    res.json({ message: 'This is a protected route', user: req.user });
}];

// Route to verify OTP (user login)
exports.verifyOTP = (req, res, next) => {
    const { username, otp } = req.body;

    if (!username || !otp) {
        return res.status(400).json({ message: 'Username and OTP are required' });
    }

    const user = users[username];
    if (!user) {
        return res.status(400).json({ error: 'User not found' });
    }

    const isVerified = speakeasy.totp.verify({
        secret: user.secret,
        encoding: 'base32',
        token: otp,
        window: 2 // Allow 2 time steps for clock skew
    });

    if (isVerified) {
        return res.status(200).json({ message: 'OTP verified, login successful' });
    } else {
        return res.status(400).json({ error: 'Invalid OTP' });
    }
};

// Route: Verify email
exports.verifyEmail = (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ message: 'Email and verification code are required' });
    }

    if (emailVerificationCodes[email] === code) {
        delete emailVerificationCodes[email]; // Clear the code after successful verification
        return res.status(200).json({ message: 'Email verified successfully' });
    } else {
        return res.status(400).json({ message: 'Invalid verification code' });
    }
};

// Send Email OTP:
exports.SendOTPEmail = (req, res, next) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    const user = users[username];
    if (!user) {
        return res.status(400).json({ error: 'User not found' });
    }

    const otp = speakeasy.totp({ 
        secret: user.secret, 
        encoding: 'base32',
        step: 300 // 5 minutes validity
    });

    const mailOptions = {
        from: process.env.EMAILID,
        to: user.email,
        subject: 'Your OTP for login',
        text: `Your OTP is: ${otp}. This OTP is valid for 5 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Email sending error:', error);
            return res.status(500).json({ error: 'Error sending email' });
        }
        res.status(200).json({ message: 'OTP sent to email' });
    });
};

// Logout route
exports.logout = (req, res) => {
    const token = req.header('Authorization') && req.header('Authorization').startsWith('Bearer ') 
        ? req.header('Authorization').replace('Bearer ', '') 
        : null;

    if (token && activeTokens[token]) {
        delete activeTokens[token];
    }

    res.status(200).json({ message: 'Logged out successfully' });
};

// Health check route
exports.healthCheck = (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'login-api'
    });
};
