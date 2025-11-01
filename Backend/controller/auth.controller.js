const User = require('../models/User.model.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const axios = require('axios');
const { mongoose, Schema } = require('mongoose');

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || process.env.EMAILID,
        pass: process.env.EMAIL_PASS || process.env.PASSWORD
    }
});

// In-memory store for users and their OTP secret keys (for demonstration purposes)
let emailVerificationCodes = {};
let activeTokens = {};
let users = {};

// Export activeTokens for use in other modules
module.exports.activeTokens = activeTokens;

// Helper function to generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper function to send email
const sendEmail = async (email, subject, text) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject,
            text
        });
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
};

// Register new user
exports.register = async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Validation
        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        // Generate verification OTP
        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.otp = otp;
        user.otpExpiresAt = otpExpiresAt;
        await user.save();

        // Send verification email
        await sendEmail(
            email,
            'Verify Your Email',
            `Your verification OTP is: ${otp}. This OTP is valid for 10 minutes.`
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email for verification.',
            data: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        console.log('Login request received. Request body:', req.body);
        console.log('Request headers:', req.headers);

        const { username, password } = req.body;

        if (!username || !password) {
            console.log('Login failed: Missing username or password');
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Find user by username or email
        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        });

        if (!user) {
            console.log('Login failed: User not found for username/email:', username);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        console.log('User found:', user.username, user.email);

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            console.log('Login failed: Invalid password for user:', user.username);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        console.log('Password valid for user:', user.username);

        // Generate tokens
        const token = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Update refresh token in database
        user.refreshToken = refreshToken;
        await user.save();

        console.log('Login successful for user:', user.username);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
};

// Send OTP for verification
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        user.otp = otp;
        user.otpExpiresAt = otpExpiresAt;
        await user.save();

        // Send OTP email
        await sendEmail(
            email,
            'Email Verification OTP',
            `Your OTP is: ${otp}. This OTP is valid for 10 minutes.`
        );

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully'
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP'
        });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if OTP is valid
        if (user.otp !== otp || user.otpExpiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Mark email as verified
        user.isEmailVerified = true;
        user.otp = null;
        user.otpExpiresAt = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP'
        });
    }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user details'
        });
    }
};

// Logout user
exports.logout = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.refreshToken = null;
            await user.save();
        }

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to logout'
        });
    }
};

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
        const user = await User.findOne({ username });

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
        const existingUser = await User.findOne({
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
        const newUser = new User({
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
exports.verifyEmail = async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ message: 'Email and verification code are required' });
    }

    if (emailVerificationCodes[email] === code) {
        delete emailVerificationCodes[email]; // Clear the code after successful verification
        // Update user isVerified
        const user = await User.findOne({ email });
        if (user) {
            user.isVerified = true;
            await user.save();
        }
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

// Serve popup login HTML
exports.servePopup = (req, res) => {
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
                    if (data.message === 'Invalid credentials') {
                        // Send message to parent to redirect to signup
                        window.opener.postMessage({
                            type: 'LOGIN_FAILED_INVALID_CREDENTIALS'
                        }, '*');
                        window.close();
                    } else {
                        errorDiv.textContent = data.message || 'Login failed';
                    }
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
};

// Handle popup login
exports.popupLogin = async (req, res) => {
    try {
        console.log('Popup login request received. Request body:', req.body);

        const { username, password } = req.body;

        if (!username || !password) {
            console.log('Popup login failed: Missing username or password');
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Find user by username or email
        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        });

        if (!user) {
            console.log('Popup login failed: User not found for username/email:', username);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        console.log('User found:', user.username, user.email);

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            console.log('Popup login failed: Invalid password for user:', user.username);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        console.log('Password valid for user:', user.username);

        // Generate tokens
        const token = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Update refresh token in database
        user.refreshToken = refreshToken;
        await user.save();

        console.log('Popup login successful for user:', user.username);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Popup login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
};
