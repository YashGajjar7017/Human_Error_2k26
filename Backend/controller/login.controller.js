const User = require('../models/User.model.js');
const Login = require('../models/Login.model.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login user
exports.login = async (req, res) => {
    try {
        console.log('Login request received. Request body:', req.body);
        console.log('Request headers:', req.headers);
        console.log('Login request received:', { username: req.body.username, password: '***' });

        const { username, password } = req.body;

        if (!username || !password) {
            console.log('Login failed: Missing username or password');
            // Log failed login attempt
            await Login.create({
                userId: null, // No user found
                success: false,
                ipAddress: req.ip || req.connection.remoteAddress || req.socket.remoteAddress,
                userAgent: req.get('User-Agent'),
                failureReason: 'invalid_credentials'
            });
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
            // Log failed login attempt
            await Login.create({
                userId: null, // No user found
                success: false,
                ipAddress: req.ip || req.connection.remoteAddress || req.socket.remoteAddress,
                userAgent: req.get('User-Agent'),
                failureReason: 'invalid_credentials'
            });
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        console.log('User found:', user.username, user.email);

        // Check password - handle both hashed and unhashed passwords for backward compatibility
        let isPasswordValid = false;
        try {
            isPasswordValid = await user.comparePassword(password);
        } catch (error) {
            // If comparison fails, check if password is stored in plain text (legacy users)
            if (user.password === password) {
                isPasswordValid = true;
                // Hash the password for future logins
                user.password = password;
                await user.save();
                console.log('Password hashed for legacy user:', user.username);
            }
        }

        if (!isPasswordValid) {
            console.log('Login failed: Invalid password for user:', user.username);
            // Log failed login attempt
            await Login.create({
                userId: user._id,
                success: false,
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                failureReason: 'invalid_credentials'
            });
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        console.log('Password valid for user:', user.username);

        // Check if email is verified
        if (!user.emailVerified) {
            console.log('Login failed: Email not verified for user:', user.username);
            // Log failed login attempt
            await Login.create({
                userId: user._id,
                success: false,
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                failureReason: 'email_not_verified'
            });
            return res.status(401).json({
                success: false,
                message: 'Please verify your email address before logging in.'
            });
        }

        // Generate tokens
        const token = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // Update refresh token in database
        user.refreshToken = refreshToken;
        await user.save();

        // Log successful login attempt
        await Login.create({
            userId: user._id,
            success: true,
            ipAddress: req.ip || req.connection.remoteAddress || req.socket.remoteAddress,
            userAgent: req.get('User-Agent')
        });

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
