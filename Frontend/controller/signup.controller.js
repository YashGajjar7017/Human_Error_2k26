const path = require('path');
const rootDir = require('../util/path');
const axios = require('axios');

// Backend configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';
const API_PREFIX = '/api/signup';

// Clean User Profile structure
const UserProfile = {
    username: null,
    email: null,
    statusCode: 200,
    token: null
};

// Token generator utility
const generateToken = (length = 15) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({length}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// Signup token generation
exports.SignUpToken = (req, res) => {
    try {
        const token = generateToken(15);
        UserProfile.token = token;
        console.log('Generated signup token:', token);
        res.redirect(`/Account/Signup/${token}`);
    } catch (error) {
        console.error('Error generating signup token:', error);
        res.status(500).json({ error: 'Failed to generate signup token' });
    }
};

// Serve signup page
exports.signUp = (req, res) => {
    try {
        const { SignUpToken } = req.params;
        console.log('Received signup token:', SignUpToken);
        
        if (SignUpToken && SignUpToken.length === 15) {
            const filePath = path.join(rootDir, 'views', 'Services', 'Signup.html');
            console.log('Serving signup page from:', filePath);
            res.sendFile(filePath);
        } else {
            console.log('Invalid signup token length:', SignUpToken?.length);
            res.status(401).json({ error: "Invalid signup token" });
        }
    } catch (error) {
        console.error('Error serving signup page:', error);
        res.status(500).json({ error: 'Failed to serve signup page' });
    }
};

// Validation function
const validateSignupData = (data) => {
    const errors = [];
    
    if (!data.username?.trim()) errors.push("Username is required");
    if (!data.email?.trim()) errors.push("Email is required");
    if (!data.password || data.password.length < 6) errors.push("Password must be at least 6 characters");
    if (data.password !== data.confirmPassword) errors.push("Passwords do not match");
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) errors.push("Invalid email format");
    
    return errors;
};

// Fixed post signup handler - calls backend API
exports.postSignUp = async (req, res) => {
    try {
        const userData = req.body;
        console.log('Processing signup for:', userData.email);
        
        // Validate input
        const validationErrors = validateSignupData(userData);
        if (validationErrors.length > 0) {
            console.log('Validation errors:', validationErrors);
            return res.status(400).json({ errors: validationErrors });
        }

        // Call backend API
        const response = await axios.post(`${BACKEND_URL}${API_PREFIX}/Account/Signup`, {
            username: userData.username,
            email: userData.email,
            password: userData.password,
            confirmPassword: userData.confirmPassword
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });

        console.log('Backend response:', response.status, response.data);

        if (response.data.success) {
            // Store user info for OTP verification
            UserProfile.username = userData.username;
            UserProfile.email = userData.email;
            
            res.cookie('Signup', true, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000
            });
            
            res.status(201).json({ 
                success: true, 
                message: response.data.message || 'Account created successfully',
                data: response.data.data,
                redirectUrl: `/Account/Signup/OTP/${UserProfile.token}`
            });
        } else {
            res.status(400).json({ 
                error: response.data.error || 'Signup failed'
            });
        }
    } catch (error) {
        console.error('Signup error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                error: 'Backend service unavailable. Please try again later.' 
            });
        }
        
        if (error.response) {
            res.status(error.response.status || 500).json({ 
                error: error.response.data?.error || error.response.data?.message || 'Signup failed'
            });
        } else if (error.request) {
            res.status(503).json({ 
                error: 'No response from server. Please try again later.' 
            });
        } else {
            res.status(500).json({ 
                error: 'An unexpected error occurred during signup'
            });
        }
    }
};

// OTP handler
const handleOTP = async (req, res, endpoint) => {
    try {
        const { otp1, otp2, otp3, otp4, otp5, otp6, email } = req.body;
        const otpCode = `${otp1}${otp2}${otp3}${otp4}${otp5}${otp6}`;
        
        console.log('Processing OTP verification for:', email);
        
        if (!otpCode || otpCode.length !== 6 || !/^\d{6}$/.test(otpCode)) {
            return res.status(400).json({ error: "Invalid OTP format. Please enter 6 digits." });
        }

        const verificationEmail = email || UserProfile.email;
        if (!verificationEmail) {
            return res.status(400).json({ error: "Email is required for OTP verification" });
        }

        // Call backend API for OTP verification
        const response = await axios.post(`${BACKEND_URL}${API_PREFIX}/Account/verifyOTP`, {
            email: verificationEmail,
            otp: otpCode
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });

        console.log('OTP verification response:', response.status, response.data);

        if (response.data.success) {
            res.cookie('User_Session', true, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            
            res.json({
                success: true,
                message: 'OTP verified successfully',
                redirectUrl: `/Account/Dashboard`
            });
        } else {
            res.status(400).json({ 
                error: response.data.error || 'OTP verification failed' 
            });
        }
    } catch (error) {
        console.error('OTP verification error:', error.message);
        
        if (error.response) {
            res.status(error.response.status || 500).json({ 
                error: error.response.data?.error || 'OTP verification failed' 
            });
        } else {
            res.status(500).json({ 
                error: 'OTP processing failed. Please try again.'
            });
        }
    }
};

// OTP page handler
exports.OTP = (req, res) => {
    try {
        const filePath = path.join(rootDir, 'views', 'Services', 'otp.html');
        console.log('Serving OTP page from:', filePath);
        res.sendFile(filePath);
    } catch (error) {
        console.error('Error serving OTP page:', error);
        res.status(500).json({ error: 'Failed to serve OTP page' });
    }
};

// OTP verification
exports.PostOTP = (req, res) => handleOTP(req, res, 'verifyOTP');

// Send OTP
exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email || !email.trim()) {
            return res.status(400).json({ error: "Email is required" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        console.log('Sending OTP to:', email);

        // Call backend API for sending OTP
        const response = await axios.post(`${BACKEND_URL}${API_PREFIX}/Account/SignupOTP`, {
            email: email
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });

        console.log('Send OTP response:', response.status, response.data);
        
        res.json({ 
            success: true, 
            message: response.data.message || "OTP sent successfully" 
        });
    } catch (error) {
        console.error('Send OTP error:', error.message);
        
        if (error.response) {
            res.status(error.response.status || 500).json({ 
                error: error.response.data?.error || 'Failed to send OTP'
            });
        } else {
            res.status(500).json({ 
                error: "Failed to send OTP. Please try again later."
            });
        }
    }
};

// Export clean interface
module.exports = {
    SignUpToken: exports.SignUpToken,
    signUp: exports.signUp,
    postSignUp: exports.postSignUp,
    OTP: exports.OTP,
    PostOTP: exports.PostOTP,
    sendOTP: exports.sendOTP,
    UserProfile: () => ({...UserProfile}),
    generateToken
};
