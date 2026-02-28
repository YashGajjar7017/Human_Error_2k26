const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

/**
 * Enhanced Email Service with Retry Logic, HTML Templates, and Better Error Handling
 */
class EmailService {
    constructor() {
        this.maxRetries = 3;
        this.retryDelay = 2000; // 2 seconds
        this.transporter = null;
        this.initialized = false;
        this.initTransporter();
    }

    /**
     * Initialize email transporter with Gmail OAuth or APP Password
     */
    initTransporter() {
        try {
            // Check environment variables
            const emailUser = process.env.EMAIL_USER;
            const emailPass = process.env.EMAIL_PASS;

            if (!emailUser || !emailPass) {
                console.error('[EMAIL SERVICE] Missing EMAIL_USER or EMAIL_PASS in environment');
                console.error('[EMAIL SERVICE] Using fallback configuration');
                return false;
            }

            // Create transporter with Gmail configuration
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                secure: true,
                port: 465,
                auth: {
                    user: emailUser,
                    pass: emailPass
                },
                tls: {
                    rejectUnauthorized: false // For testing, set to true in production
                },
                connectionUrl: 'smtps://user:pass@smtp.gmail.com/?pool=true'
            });

            this.initialized = true;
            console.log('[EMAIL SERVICE] Initialized successfully');
            return true;
        } catch (error) {
            console.error('[EMAIL SERVICE] Initialization error:', error.message);
            return false;
        }
    }

    /**
     * Send email with retry logic
     */
    async sendMail(to, subject, htmlContent, textContent = null) {
        if (!this.initialized) {
            throw new Error('Email service not initialized. Check EMAIL_USER and EMAIL_PASS.');
        }

        let lastError = null;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const mailOptions = {
                    from: {
                        name: process.env.EMAIL_FROM_NAME || 'Human Error Platform',
                        address: process.env.EMAIL_USER
                    },
                    to: to,
                    subject: subject,
                    html: htmlContent,
                    text: textContent || this.stripHtml(htmlContent),
                    priority: 'high'
                };

                console.log(`[EMAIL SERVICE] Attempt ${attempt}/${this.maxRetries} - Sending to ${to}`);
                
                const info = await this.transporter.sendMail(mailOptions);
                
                console.log(`[EMAIL SERVICE] Email sent successfully. MessageID: ${info.messageId}`);
                
                return {
                    success: true,
                    messageId: info.messageId,
                    response: info.response,
                    attempt: attempt
                };
            } catch (error) {
                lastError = error;
                console.error(`[EMAIL SERVICE] Attempt ${attempt} failed:`, error.message);

                if (attempt < this.maxRetries) {
                    console.log(`[EMAIL SERVICE] Retrying in ${this.retryDelay}ms...`);
                    await this.delay(this.retryDelay);
                }
            }
        }

        throw new Error(`Failed to send email after ${this.maxRetries} attempts: ${lastError.message}`);
    }

    /**
     * Send OTP email with HTML template
     */
    async sendOTPEmail(email, otp, purpose = 'signup') {
        const htmlContent = this.getOTPTemplate(email, otp, purpose);
        const subject = this.getOTPSubject(purpose);
        
        return this.sendMail(email, subject, htmlContent);
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(email, resetLink, otp = null) {
        const htmlContent = this.getPasswordResetTemplate(email, resetLink, otp);
        const subject = 'Password Reset Request';
        
        return this.sendMail(email, subject, htmlContent);
    }

    /**
     * Send welcome email
     */
    async sendWelcomeEmail(email, username) {
        const htmlContent = this.getWelcomeTemplate(email, username);
        const subject = 'Welcome to Human Error Platform';
        
        return this.sendMail(email, subject, htmlContent);
    }

    /**
     * Send verification success email
     */
    async sendVerificationSuccessEmail(email, username) {
        const htmlContent = this.getVerificationSuccessTemplate(email, username);
        const subject = 'Email Verified Successfully';
        
        return this.sendMail(email, subject, htmlContent);
    }

    /**
     * Get OTP email template
     */
    getOTPTemplate(email, otp, purpose = 'signup') {
        const titles = {
            signup: 'Email Verification',
            password_reset: 'Password Reset',
            email_verification: 'Email Verification'
        };

        const messages = {
            signup: 'Please verify your email to complete your registration',
            password_reset: 'Click the link below to reset your password',
            email_verification: 'Please verify your email address'
        };

        const title = titles[purpose] || 'Verification Code';
        const message = messages[purpose] || 'Enter the code below';

        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; }
        .message { color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px; }
        .otp-box { 
            background: #f8f9fa; 
            border: 2px solid #667eea; 
            border-radius: 8px; 
            padding: 20px; 
            text-align: center; 
            margin: 25px 0;
        }
        .otp-code { 
            font-size: 36px; 
            font-weight: bold; 
            color: #667eea; 
            letter-spacing: 4px; 
            font-family: 'Courier New', monospace;
        }
        .timer { color: #888; font-size: 14px; margin-top: 10px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .warning p { margin: 0; color: #856404; font-size: 14px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #e9ecef; }
        .footer p { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
            <p>${message}</p>
        </div>
        <div class="content">
            <p class="message">Hello,</p>
            <p class="message">Use the verification code below to complete your ${purpose === 'password_reset' ? 'password reset' : 'signup'} process:</p>
            
            <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <div class="timer">Valid for 10 minutes</div>
            </div>

            <div class="warning">
                <p><strong>⚠️ Security Notice:</strong></p>
                <p>Never share this code with anyone. We will never ask for it via email.</p>
            </div>

            <p class="message">If you didn't request this code, please ignore this email or contact support.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Human Error Platform. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * Get password reset template
     */
    getPasswordResetTemplate(email, resetLink, otp = null) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; }
        .message { color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .button:hover { opacity: 0.9; }
        .code-box { background: #f8f9fa; border: 2px solid #f5576c; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0; }
        .code { font-size: 24px; font-weight: bold; color: #f5576c; font-family: 'Courier New', monospace; letter-spacing: 2px; }
        .warning { background: #ffe5e5; border-left: 4px solid #f5576c; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #e9ecef; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Reset Your Password</h1>
        </div>
        <div class="content">
            <p class="message">Hello,</p>
            <p class="message">We received a request to reset your password. Click the button below to create a new password:</p>
            
            <a href="${resetLink}" class="button">Reset Password</a>

            ${otp ? `<p class="message">Or use this code:</p>
            <div class="code-box">
                <div class="code">${otp}</div>
            </div>` : ''}

            <div class="warning">
                <p><strong>⚠️ Security Alert:</strong></p>
                <p>This link will expire in 1 hour. If you didn't request this, ignore this email.</p>
            </div>

            <p class="message">If the button above doesn't work, copy and paste the following URL into your browser:</p>
            <p style="word-break: break-all; color: #666; font-size: 12px;">${resetLink}</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Human Error Platform. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * Get welcome template
     */
    getWelcomeTemplate(email, username) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome!</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; }
        .message { color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px; }
        .features { margin: 25px 0; }
        .feature { display: flex; margin: 15px 0; }
        .feature-icon { font-size: 24px; margin-right: 15px; }
        .feature-text { color: #666; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #e9ecef; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Human Error Platform! 🎉</h1>
        </div>
        <div class="content">
            <p class="message">Hi <strong>${username}</strong>,</p>
            <p class="message">Your account has been successfully created. Get ready to level up your coding skills!</p>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">💻</div>
                    <div class="feature-text"><strong>Code & Compile:</strong> Write and compile code in multiple languages</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">🐛</div>
                    <div class="feature-text"><strong>Debug Tools:</strong> Advanced debugging with GDB integration</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">📚</div>
                    <div class="feature-text"><strong>Learn:</strong> Access tutorials and documentation</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">🏆</div>
                    <div class="feature-text"><strong>Achievements:</strong> Earn badges and track progress</div>
                </div>
            </div>

            <a href="${process.env.FRONTEND_URL || 'https://localhost:3000'}/dashboard" class="button">Go to Dashboard</a>

            <p class="message">If you have any questions, feel free to reach out to our support team.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Human Error Platform. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * Get verification success template
     */
    getVerificationSuccessTemplate(email, username) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verified</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f7fa; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; text-align: center; }
        .checkmark { font-size: 60px; margin: 20px 0; }
        .message { color: #333; font-size: 16px; line-height: 1.6; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #e9ecef; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Email Verified Successfully! ✓</h1>
        </div>
        <div class="content">
            <div class="checkmark">✅</div>
            <p class="message">Hi <strong>${username}</strong>,</p>
            <p class="message">Your email has been verified. Your account is now fully active!</p>
            <p class="message">You can now access all features of the Human Error Platform.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Human Error Platform. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * Helper methods
     */
    getOTPSubject(purpose) {
        const subjects = {
            signup: 'Verify Your Email - OTP Code',
            password_reset: 'Password Reset - OTP Code',
            email_verification: 'Email Verification - OTP Code'
        };
        return subjects[purpose] || 'Your OTP Code';
    }

    stripHtml(html) {
        return html.replace(/<[^>]*>/g, '');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Test email configuration
     */
    async testConnection() {
        if (!this.initialized) {
            return { success: false, message: 'Email service not initialized' };
        }

        try {
            await this.transporter.verify();
            return { success: true, message: 'Email service is working correctly' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

module.exports = new EmailService();
