const path = require('path');
const bcrypt = require('bcryptjs');
const rootDir = require('../util/path');
const axios = require('axios');
const session = require('express-session');

// API configuration - using relative paths to go through proxy
const API_BASE_URL = '/api';

// token class
function AlphaNumericGenerator(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let TokenPass = '';
    for (let i = 0; i < length; i++) {
        TokenPass += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return TokenPass;
}

// Fetch_Function: Updated to use proper API endpoints
async function FetchData(endpoint, data, headers = {}) {
    try {
        const config = {
            headers: {
                "Content-Type": "application/json",
                ...headers
            }
        };
        const response = await axios.post(`${API_BASE_URL}/${endpoint}`, data, config);
        return response.data;
    } catch (error) {
        console.error("API Error:", error.response?.data || error.message);
        throw error;
    }
}

// Fetching Userdata from files:
exports.userIDGenerator = (req, res, next) => {
    res.redirect(`/Account/login/${AlphaNumericGenerator(15)}`);
};

// Login - Serve login page
exports.Getlogin = async (req, res, next) => {
    const token = req.params.usrID;
    res.status(200);
    res.cookie('session_id', token);
    res.setHeader('Content-Type', 'text/html');

    if (token.length === 15) {
        res.sendFile(path.join(rootDir, 'views', '/Services/login.html'));
    } else {
        res.redirect('/404');
    }
};

// Login Post - Use backend API for proper authentication
exports.Postlogin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
    }

    try {
        // Call backend login API
        const response = await FetchData('auth/login', { username, password });

        if (response.success) {
            // Set session data
            req.session.authenticated = true;
            req.session.user = {
                id: response.user.id,
                username: response.user.username,
                email: response.user.email,
                role: response.user.role,
                token: response.token
            };

            // Set token in cookie for client-side access
            res.cookie('auth_token', response.token, {
                httpOnly: false, // Allow client-side access
                secure: false, // Set to true in production with HTTPS
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });

            res.json({
                success: true,
                message: 'Login successful',
                user: req.session.user,
                token: response.token
            });
        } else {
            res.status(401).json({
                success: false,
                message: response.message || 'Login failed'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
};

// user Content - Updated authentication flow
exports.AuthUser = (req, res, next) => {
    const { usr, pass, auth } = req.params;
    
    if (auth === 'true') {
        res.redirect('/loginID=True');
        console.log('Login successful for user:', usr);
    } else {
        res.redirect('/loginID=False');
        console.log('Login failed for user:', usr);
    }
};

// loginID - Updated response
exports.loginID = (req, res, next) => {
    const { loginID } = req.params;
    console.log("Login attempt with ID:", loginID);
    res.json({ 
        success: true,
        loginID: loginID,
        message: 'Login ID processed'
    });
};

// logout - Updated to use backend API
exports.logout = async (req, res, next) => {
    try {
        const token = req.session?.user?.token;

        if (token) {
            await FetchData('auth/logout', {}, {
                'Authorization': `Bearer ${token}`
            });
        }

        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
            }
            res.clearCookie('auth_token');
            res.redirect('/');
        });
    } catch (e) {
        console.log(`Logout error: ${e}`);
        req.session.destroy(() => {
            res.clearCookie('auth_token');
            res.redirect('/');
        });
    }
};

// Forgot password - Updated flow
exports.forgotPass = (req, res, next) => {
    const OTP = req.params.OTP;
    res.sendFile(path.join(rootDir, 'views', '/Services/forgotPassword.html'));
    
    if (OTP) {
        setTimeout(() => {
            res.redirect(`/otp`);
        }, 10000);
    } else {
        console.error('OTP not provided');
    }
};

// Utility functions
exports.checkAuth = (req, res) => {
    if (req.session.authenticated && req.session.user) {
        res.json({
            authenticated: true,
            user: req.session.user
        });
    } else {
        res.json({
            authenticated: false
        });
    }
};

exports.refreshToken = async (req, res) => {
    const { token } = req.body;

    try {
        const response = await FetchData('auth/refresh-token', { token });
        res.json(response);
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token invalid or expired'
        });
    }
};
