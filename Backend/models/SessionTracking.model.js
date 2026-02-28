const mongoose = require('mongoose');

/**
 * User Session Tracking Schema
 * Tracks user sessions, cookies, and behavioral data
 */
const sessionTrackingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        sessionId: {
            type: String,
            unique: true,
            required: true,
            index: true
        },
        deviceInfo: {
            userAgent: String,
            platform: String,
            browser: String,
            browserVersion: String,
            os: String,
            osVersion: String,
            deviceType: {
                type: String,
                enum: ['desktop', 'mobile', 'tablet', 'unknown'],
                default: 'unknown'
            },
            deviceId: String,
            screenResolution: String,
            language: String
        },
        ipAddress: {
            type: String,
            index: true
        },
        location: {
            country: String,
            state: String,
            city: String,
            timezone: String,
            coordinates: {
                type: {
                    type: String,
                    enum: ['Point'],
                    default: 'Point'
                },
                coordinates: [Number] // [longitude, latitude]
            }
        },
        sessionData: {
            startTime: {
                type: Date,
                default: Date.now
            },
            lastActivityTime: {
                type: Date,
                default: Date.now
            },
            endTime: Date,
            duration: Number, // in milliseconds
            isActive: {
                type: Boolean,
                default: true
            }
        },
        cookies: {
            sessionCookie: {
                value: String,
                expiresAt: Date,
                httpOnly: Boolean,
                secure: Boolean,
                sameSite: String
            },
            trackingCookie: {
                value: String,
                expiresAt: Date
            },
            preferenceCookie: mongoose.Schema.Types.Mixed
        },
        behavior: {
            pageViews: [{
                url: String,
                path: String,
                referrer: String,
                timestamp: { type: Date, default: Date.now },
                timeSpent: Number, // in seconds
                scrollDepth: Number, // percentage
                interactions: Number // clicks, forms, etc.
            }],
            events: [{
                eventType: {
                    type: String,
                    enum: ['click', 'form_submit', 'search', 'navigation', 'download', 'error', 'custom'],
                    required: true
                },
                eventName: String,
                elementId: String,
                elementClass: String,
                elementText: String,
                timestamp: { type: Date, default: Date.now },
                metadata: mongoose.Schema.Types.Mixed
            }],
            searches: [{
                query: String,
                results: Number,
                timestamp: { type: Date, default: Date.now },
                resultClicked: Boolean
            }],
            errors: [{
                type: String,
                message: String,
                timestamp: { type: Date, default: Date.now },
                stackTrace: String,
                url: String
            }],
            conversions: [{
                type: String,
                value: mongoose.Schema.Types.Mixed,
                timestamp: { type: Date, default: Date.now }
            }]
        },
        authentication: {
            loginMethod: {
                type: String,
                enum: ['email', 'oauth', 'saml', 'mfa'],
                required: true
            },
            mfaUsed: Boolean,
            mfaMethod: String,
            loginTimestamp: Date,
            logoutTimestamp: Date,
            authenticationDuration: Number
        },
        security: {
            ipAddressChanged: Boolean,
            newDeviceDetected: Boolean,
            suspiciousActivity: Boolean,
            failedLoginAttempts: Number,
            blockedAttempts: Number,
            riskScore: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            }
        },
        performance: {
            pageLoadTime: Number, // in milliseconds
            apiResponseTime: Number,
            cpuUsage: Number,
            memoryUsage: Number,
            networkLatency: Number,
            fps: Number,
            slowRequests: [{
                url: String,
                duration: Number,
                timestamp: Date
            }]
        },
        engagement: {
            totalInteractions: Number,
            clickCount: Number,
            formSubmissions: Number,
            scrollEvents: Number,
            timeOnPage: Number,
            bounceRate: Number,
            engagementScore: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            }
        }
    },
    {
        timestamps: true,
        indexes: [
            { userId: 1, 'sessionData.startTime': -1 },
            { 'location.coordinates': '2dsphere' },
            { 'security.riskScore': -1 }
        ]
    }
);

/**
 * User Behavior Analytics Schema
 * Aggregated analytics for user behavior
 */
const userBehaviorAnalyticsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true
        },
        summary: {
            totalSessions: { type: Number, default: 0 },
            totalSessionDuration: { type: Number, default: 0 },
            averageSessionDuration: { type: Number, default: 0 },
            totalPageViews: { type: Number, default: 0 },
            averagePageLoadTime: { type: Number, default: 0 },
            averageEngagementScore: { type: Number, default: 0 },
            lastActiveDate: Date,
            firstVisitDate: Date
        },
        trends: {
            sessionTrend: [
                {
                    date: Date,
                    count: Number,
                    totalDuration: Number
                }
            ],
            engagementTrend: [
                {
                    date: Date,
                    score: Number,
                    interactions: Number
                }
            ],
            deviceTrend: mongoose.Schema.Types.Mixed,
            locationTrend: [
                {
                    location: String,
                    sessionCount: Number,
                    percentage: Number
                }
            ]
        },
        preferences: {
            preferredLanguage: String,
            preferredTheme: {
                type: String,
                enum: ['light', 'dark', 'auto'],
                default: 'auto'
            },
            preferredTimezone: String,
            notificationPreferences: mongoose.Schema.Types.Mixed
        },
        riskAssessment: {
            averageRiskScore: { type: Number, default: 0 },
            suspiciousActivities: { type: Number, default: 0 },
            blockedActivities: { type: Number, default: 0 },
            lastRiskEvent: Date,
            riskStatus: {
                type: String,
                enum: ['low', 'medium', 'high', 'critical'],
                default: 'low'
            }
        },
        predictions: {
            churnProbability: { type: Number, default: 0 },
            conversionProbability: { type: Number, default: 0 },
            nextLikelyAction: String,
            estimatedLifetimeValue: mongoose.Schema.Types.Mixed
        }
    },
    {
        timestamps: true
    }
);

// Indexes for performance
sessionTrackingSchema.index({ userId: 1, 'sessionData.startTime': -1 });
sessionTrackingSchema.index({ ipAddress: 1 });
sessionTrackingSchema.index({ 'location.coordinates': '2dsphere' });
sessionTrackingSchema.index({ 'security.riskScore': -1 });

const SessionTracking = mongoose.model('SessionTracking', sessionTrackingSchema);
const UserBehaviorAnalytics = mongoose.model('UserBehaviorAnalytics', userBehaviorAnalyticsSchema);

module.exports = {
    SessionTracking,
    UserBehaviorAnalytics
};
