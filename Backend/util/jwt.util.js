const jwt = require('jsonwebtoken');

/**
 * JWT Utility Functions
 * Provides comprehensive JWT token verification and validation utilities
 */

class JWTUtil {
    constructor() {
        this.secret = process.env.JWT_SECRET || 'your-secret-key';
        this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    }

    /**
     * Verify JWT token with comprehensive validation
     * @param {string} token - JWT token to verify
     * @param {object} options - Verification options
     * @returns {object} - Decoded token payload or error
     */
    verifyToken(token, options = {}) {
        try {
            const {
                secret = this.secret,
                ignoreExpiration = false,
                maxAge = null,
                issuer = null,
                audience = null,
                algorithms = ['HS256']
            } = options;

            const verifyOptions = {
                ignoreExpiration,
                algorithms
            };

            if (maxAge) verifyOptions.maxAge = maxAge;
            if (issuer) verifyOptions.issuer = issuer;
            if (audience) verifyOptions.audience = audience;

            const decoded = jwt.verify(token, secret, verifyOptions);
            
            return {
                success: true,
                payload: decoded,
                valid: true,
                expired: false,
                error: null
            };
        } catch (error) {
            return {
                success: false,
                payload: null,
                valid: false,
                expired: error.name === 'TokenExpiredError',
                error: {
                    name: error.name,
                    message: error.message,
                    expiredAt: error.expiredAt || null
                }
            };
        }
    }

    /**
     * Verify refresh token
     * @param {string} refreshToken - Refresh token to verify
     * @returns {object} - Verification result
     */
    verifyRefreshToken(refreshToken) {
        return this.verifyToken(refreshToken, {
            secret: this.refreshSecret,
            maxAge: '7d'
        });
    }

    /**
     * Verify token and check user existence
     * @param {string} token - JWT token
     * @param {object} UserModel - Mongoose user model
     * @returns {object} - User and token info
     */
    async verifyTokenWithUser(token, UserModel) {
        const verification = this.verifyToken(token);
        
        if (!verification.success) {
            return verification;
        }

        try {
            const user = await UserModel.findById(verification.payload.id || verification.payload._id);
            
            if (!user) {
                return {
                    success: false,
                    payload: null,
                    valid: false,
                    expired: false,
                    error: {
                        name: 'UserNotFoundError',
                        message: 'User not found',
                        expiredAt: null
                    }
                };
            }

            // Check user status
            if (user.status === 'banned' || user.status === 'inactive') {
                return {
                    success: false,
                    payload: null,
                    valid: false,
                    expired: false,
                    error: {
                        name: 'AccountDisabledError',
                        message: 'Account is disabled',
                        expiredAt: null
                    }
                };
            }

            return {
                success: true,
                payload: verification.payload,
                user: user,
                valid: true,
                expired: false,
                error: null
            };
        } catch (error) {
            return {
                success: false,
                payload: null,
                valid: false,
                expired: false,
                error: {
                    name: 'DatabaseError',
                    message: error.message,
                    expiredAt: null
                }
            };
        }
    }

    /**
     * Decode token without verification
     * @param {string} token - JWT token to decode
     * @returns {object} - Decoded payload
     */
    decodeToken(token) {
        try {
            const decoded = jwt.decode(token, { complete: true });
            return {
                success: true,
                payload: decoded.payload,
                header: decoded.header,
                valid: true,
                error: null
            };
        } catch (error) {
            return {
                success: false,
                payload: null,
                header: null,
                valid: false,
                error: {
                    name: error.name,
                    message: error.message
                }
            };
        }
    }

    /**
     * Check if token is about to expire
     * @param {string} token - JWT token
     * @param {number} thresholdMinutes - Minutes before expiration to consider as "about to expire"
     * @returns {object} - Expiration info
     */
    checkTokenExpiration(token, thresholdMinutes = 15) {
        const verification = this.verifyToken(token);
        
        if (!verification.success) {
            return {
                ...verification,
                aboutToExpire: false,
                timeLeft: null
            };
        }

        const exp = verification.payload.exp;
        if (!exp) {
            return {
                ...verification,
                aboutToExpire: false,
                timeLeft: null
            };
        }

        const now = Math.floor(Date.now() / 1000);
        const timeLeft = exp - now;
        const aboutToExpire = timeLeft <= (thresholdMinutes * 60);

        return {
            ...verification,
            aboutToExpire,
            timeLeft: Math.max(0, timeLeft),
            expiresIn: Math.max(0, timeLeft)
        };
    }

    /**
     * Validate token format
     * @param {string} token - JWT token string
     * @returns {object} - Validation result
     */
    validateTokenFormat(token) {
        if (!token || typeof token !== 'string') {
            return {
                valid: false,
                error: 'Token must be a non-empty string'
            };
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            return {
                valid: false,
                error: 'Invalid JWT format - must have 3 parts'
            };
        }

        try {
            // Check if each part is base64url encoded
            parts.forEach(part => {
                Buffer.from(part, 'base64url');
            });

            return {
                valid: true,
                error: null
            };
        } catch (error) {
            return {
                valid: false,
                error: 'Invalid base64url encoding in token'
            };
        }
    }

    /**
     * Create a new token with custom payload
     * @param {object} payload - Token payload
     * @param {object} options - Token options
     * @returns {string} - JWT token
     */
    createToken(payload, options = {}) {
        const {
            secret = this.secret,
            expiresIn = '1h',
            issuer = null,
            audience = null,
            subject = null,
            algorithm = 'HS256'
        } = options;

        const signOptions = { expiresIn, algorithm };
        
        if (issuer) signOptions.issuer = issuer;
        if (audience) signOptions.audience = audience;
        if (subject) signOptions.subject = subject;

        return jwt.sign(payload, secret, signOptions);
    }

    /**
     * Create refresh token
     * @param {object} payload - Token payload
     * @param {object} options - Token options
     * @returns {string} - Refresh token
     */
    createRefreshToken(payload, options = {}) {
        return this.createToken(payload, {
            ...options,
            secret: this.refreshSecret,
            expiresIn: '7d'
        });
    }

    /**
     * Extract token from request headers
     * @param {object} req - Express request object
     * @returns {string|null} - Token or null if not found
     */
    extractTokenFromHeader(req) {
        const authHeader = req.header('Authorization');
        if (!authHeader) return null;

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

        return parts[1];
    }

    /**
     * Extract token from query parameters
     * @param {object} req - Express request object
     * @param {string} paramName - Query parameter name (default: 'token')
     * @returns {string|null} - Token or null if not found
     */
    extractTokenFromQuery(req, paramName = 'token') {
        return req.query[paramName] || null;
    }

    /**
     * Extract token from cookies
     * @param {object} req - Express request object
     * @param {string} cookieName - Cookie name (default: 'jwt')
     * @returns {string|null} - Token or null if not found
     */
    extractTokenFromCookie(req, cookieName = 'jwt') {
        return req.cookies[cookieName] || null;
    }

    /**
     * Comprehensive token extraction from all sources
     * @param {object} req - Express request object
     * @returns {object} - Object containing token and source
     */
    extractToken(req) {
        // Try headers first
        const headerToken = this.extractTokenFromHeader(req);
        if (headerToken) {
            return { token: headerToken, source: 'header' };
        }

        // Try query parameters
        const queryToken = this.extractTokenFromQuery(req);
        if (queryToken) {
            return { token: queryToken, source: 'query' };
        }

        // Try cookies
        const cookieToken = this.extractTokenFromCookie(req);
        if (cookieToken) {
            return { token: cookieToken, source: 'cookie' };
        }

        return { token: null, source: null };
    }
}

module.exports = JWTUtil;
