const { SessionTracking, UserBehaviorAnalytics } = require('../models/SessionTracking.model');
const User = require('../models/User.model');
const crypto = require('crypto');
const UAParser = require('ua-parser-js');

/**
 * Session Tracking Controller
 * Manages user sessions, cookies, and behavioral tracking
 */
class SessionTrackingController {
    /**
     * Create a new session
     */
    async createSession(req, res) {
        try {
            const { userId } = req.body;
            const userAgent = req.get('user-agent') || '';
            const ipAddress = this.getClientIP(req);

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'User ID is required'
                });
            }

            // Parse device info
            const parser = new UAParser(userAgent);
            const deviceInfo = parser.getResult();

            // Generate session ID
            const sessionId = crypto.randomBytes(32).toString('hex');

            // Create session cookie
            const sessionCookie = {
                value: sessionId,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax'
            };

            // Create tracking cookie
            const trackingCookie = {
                value: crypto.randomBytes(16).toString('hex'),
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
            };

            const sessionTracking = new SessionTracking({
                userId,
                sessionId,
                deviceInfo: {
                    userAgent,
                    platform: deviceInfo.os.name,
                    browser: deviceInfo.browser.name,
                    browserVersion: deviceInfo.browser.version,
                    os: deviceInfo.os.name,
                    osVersion: deviceInfo.os.version,
                    deviceType: this.getDeviceType(deviceInfo.device.type),
                    deviceId: this.generateDeviceId(ipAddress, userAgent),
                    language: req.get('accept-language') || 'unknown'
                },
                ipAddress,
                cookies: {
                    sessionCookie,
                    trackingCookie
                },
                authentication: {
                    loginMethod: 'email',
                    loginTimestamp: new Date(),
                    mfaUsed: false
                },
                sessionData: {
                    startTime: new Date(),
                    isActive: true
                }
            });

            await sessionTracking.save();

            console.log(`[SESSION] Created session ${sessionId} for user ${userId}`);

            res.json({
                success: true,
                message: 'Session created successfully',
                data: {
                    sessionId,
                    cookies: {
                        sessionCookie: sessionCookie.value,
                        trackingCookie: trackingCookie.value
                    }
                }
            });

        } catch (error) {
            console.error('[SESSION] Error creating session:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create session'
            });
        }
    }

    /**
     * Track page view
     */
    async trackPageView(req, res) {
        try {
            const { sessionId, url, path, referrer, timeSpent = 0, scrollDepth = 0 } = req.body;

            if (!sessionId || !url) {
                return res.status(400).json({
                    success: false,
                    error: 'Session ID and URL are required'
                });
            }

            const session = await SessionTracking.findOne({ sessionId });
            if (!session) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found'
                });
            }

            session.behavior.pageViews.push({
                url,
                path,
                referrer,
                timeSpent,
                scrollDepth,
                interactions: 0
            });

            session.sessionData.lastActivityTime = new Date();
            await session.save();

            res.json({
                success: true,
                message: 'Page view tracked'
            });

        } catch (error) {
            console.error('[SESSION] Error tracking page view:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to track page view'
            });
        }
    }

    /**
     * Track user event
     */
    async trackEvent(req, res) {
        try {
            const { sessionId, eventType, eventName, elementId, elementClass, elementText, metadata } = req.body;

            if (!sessionId || !eventType) {
                return res.status(400).json({
                    success: false,
                    error: 'Session ID and event type are required'
                });
            }

            const session = await SessionTracking.findOne({ sessionId });
            if (!session) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found'
                });
            }

            session.behavior.events.push({
                eventType,
                eventName,
                elementId,
                elementClass,
                elementText,
                metadata,
                timestamp: new Date()
            });

            session.engagement.clickCount = (session.engagement.clickCount || 0) + 1;
            session.sessionData.lastActivityTime = new Date();

            await session.save();

            res.json({
                success: true,
                message: 'Event tracked'
            });

        } catch (error) {
            console.error('[SESSION] Error tracking event:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to track event'
            });
        }
    }

    /**
     * End session
     */
    async endSession(req, res) {
        try {
            const { sessionId } = req.body;

            if (!sessionId) {
                return res.status(400).json({
                    success: false,
                    error: 'Session ID is required'
                });
            }

            const session = await SessionTracking.findOne({ sessionId });
            if (!session) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found'
                });
            }

            session.sessionData.endTime = new Date();
            session.sessionData.isActive = false;
            session.sessionData.duration = 
                session.sessionData.endTime - session.sessionData.startTime;

            session.authentication.logoutTimestamp = new Date();

            await session.save();

            // Update user behavior analytics
            await this.updateBehaviorAnalytics(session.userId, session);

            console.log(`[SESSION] Ended session ${sessionId}`);

            res.json({
                success: true,
                message: 'Session ended successfully'
            });

        } catch (error) {
            console.error('[SESSION] Error ending session:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to end session'
            });
        }
    }

    /**
     * Get session details
     */
    async getSessionDetails(req, res) {
        try {
            const { sessionId } = req.params;

            const session = await SessionTracking.findOne({ sessionId })
                .populate('userId', 'email username');

            if (!session) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found'
                });
            }

            res.json({
                success: true,
                data: {
                    sessionId: session.sessionId,
                    user: session.userId,
                    deviceInfo: session.deviceInfo,
                    location: session.location,
                    sessionData: session.sessionData,
                    behavior: {
                        pageViewCount: session.behavior.pageViews.length,
                        eventCount: session.behavior.events.length,
                        lastPageView: session.behavior.pageViews[session.behavior.pageViews.length - 1]
                    },
                    engagement: session.engagement
                }
            });

        } catch (error) {
            console.error('[SESSION] Error getting session details:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get session details'
            });
        }
    }

    /**
     * Get user sessions
     */
    async getUserSessions(req, res) {
        try {
            const { userId } = req.params;
            const { limit = 10, skip = 0 } = req.query;

            const sessions = await SessionTracking.find({ userId })
                .sort({ 'sessionData.startTime': -1 })
                .limit(parseInt(limit))
                .skip(parseInt(skip))
                .select('sessionId deviceInfo sessionData authentication');

            const total = await SessionTracking.countDocuments({ userId });

            res.json({
                success: true,
                data: {
                    sessions,
                    total,
                    limit: parseInt(limit),
                    skip: parseInt(skip)
                }
            });

        } catch (error) {
            console.error('[SESSION] Error getting user sessions:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get user sessions'
            });
        }
    }

    /**
     * Get user behavior analytics
     */
    async getBehaviorAnalytics(req, res) {
        try {
            const { userId } = req.params;

            const analytics = await UserBehaviorAnalytics.findOne({ userId });

            if (!analytics) {
                return res.status(404).json({
                    success: false,
                    error: 'Analytics not found'
                });
            }

            res.json({
                success: true,
                data: analytics
            });

        } catch (error) {
            console.error('[SESSION] Error getting analytics:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get analytics'
            });
        }
    }

    /**
     * Track error
     */
    async trackError(req, res) {
        try {
            const { sessionId, type, message, stackTrace, url } = req.body;

            if (!sessionId || !type) {
                return res.status(400).json({
                    success: false,
                    error: 'Session ID and error type are required'
                });
            }

            const session = await SessionTracking.findOne({ sessionId });
            if (!session) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found'
                });
            }

            session.behavior.errors.push({
                type,
                message,
                stackTrace,
                url,
                timestamp: new Date()
            });

            session.security.suspiciousActivity = true;
            session.sessionData.lastActivityTime = new Date();

            await session.save();

            res.json({
                success: true,
                message: 'Error tracked'
            });

        } catch (error) {
            console.error('[SESSION] Error tracking error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to track error'
            });
        }
    }

    /**
     * Helper methods
     */

    getClientIP(req) {
        return (
            req.headers['x-forwarded-for']?.split(',')[0].trim() ||
            req.headers['x-real-ip'] ||
            req.socket.remoteAddress ||
            req.connection.remoteAddress ||
            'unknown'
        );
    }

    getDeviceType(type) {
        const types = {
            'mobile': 'mobile',
            'tablet': 'tablet',
            'desktop': 'desktop'
        };
        return types[type] || 'unknown';
    }

    generateDeviceId(ipAddress, userAgent) {
        return crypto
            .createHash('sha256')
            .update(`${ipAddress}${userAgent}`)
            .digest('hex');
    }

    async updateBehaviorAnalytics(userId, session) {
        try {
            let analytics = await UserBehaviorAnalytics.findOne({ userId });

            if (!analytics) {
                analytics = new UserBehaviorAnalytics({
                    userId,
                    summary: {
                        totalSessions: 0,
                        firstVisitDate: new Date()
                    }
                });
            }

            analytics.summary.totalSessions += 1;
            analytics.summary.totalSessionDuration += session.sessionData.duration || 0;
            analytics.summary.averageSessionDuration = 
                analytics.summary.totalSessionDuration / analytics.summary.totalSessions;
            analytics.summary.totalPageViews += session.behavior.pageViews.length;
            analytics.summary.lastActiveDate = new Date();

            await analytics.save();
            console.log(`[ANALYTICS] Updated analytics for user ${userId}`);
        } catch (error) {
            console.error('[ANALYTICS] Error updating analytics:', error);
        }
    }
}

module.exports = new SessionTrackingController();
