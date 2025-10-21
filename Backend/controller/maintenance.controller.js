const path = require('path');
const fs = require('fs');
const rootDir = require('../util/path');

// Maintenance configuration
const MAINTENANCE_CONFIG = {
    filePath: path.join(rootDir, 'maintenance.json'),
    defaultConfig: {
        enabled: false,
        message: "System is under maintenance. Please check back later.",
        startTime: null,
        endTime: null,
        allowedIPs: [],
        allowedRoutes: ['/health', '/api/health', '/maintenance/status']
    }
};

// Maintenance state management
class MaintenanceManager {
    constructor() {
        this.config = this.loadConfig();
    }

    loadConfig() {
        try {
            if (fs.existsSync(MAINTENANCE_CONFIG.filePath)) {
                const data = fs.readFileSync(MAINTENANCE_CONFIG.filePath, 'utf8');
                return { ...MAINTENANCE_CONFIG.defaultConfig, ...JSON.parse(data) };
            }
            return MAINTENANCE_CONFIG.defaultConfig;
        } catch (error) {
            console.error('Error loading maintenance config:', error);
            return MAINTENANCE_CONFIG.defaultConfig;
        }
    }

    saveConfig() {
        try {
            fs.writeFileSync(MAINTENANCE_CONFIG.filePath, JSON.stringify(this.config, null, 2));
            return true;
        } catch (error) {
            console.error('Error saving maintenance config:', error);
            return false;
        }
    }

    isUnderMaintenance(req) {
        if (!this.config.enabled) return false;
        
        // Check allowed IPs
        if (this.config.allowedIPs.length > 0) {
            const clientIP = req.ip || req.connection.remoteAddress;
            if (this.config.allowedIPs.includes(clientIP)) return false;
        }
        
        // Check allowed routes
        if (this.config.allowedRoutes.includes(req.path)) return false;
        
        return true;
    }

    getMaintenanceInfo() {
        return {
            enabled: this.config.enabled,
            message: this.config.message,
            startTime: this.config.startTime,
            endTime: this.config.endTime,
            allowedIPs: this.config.allowedIPs,
            allowedRoutes: this.config.allowedRoutes
        };
    }

    enableMaintenance(message = null, startTime = null, endTime = null, allowedIPs = [], allowedRoutes = []) {
        this.config.enabled = true;
        this.config.message = message || this.config.message;
        this.config.startTime = startTime || new Date().toISOString();
        this.config.endTime = endTime || null;
        this.config.allowedIPs = allowedIPs;
        this.config.allowedRoutes = [...MAINTENANCE_CONFIG.defaultConfig.allowedRoutes, ...allowedRoutes];
        return this.saveConfig();
    }

    disableMaintenance() {
        this.config.enabled = false;
        this.config.startTime = null;
        this.config.endTime = null;
        return this.saveConfig();
    }

    updateMessage(message) {
        this.config.message = message;
        return this.saveConfig();
    }

    addAllowedIP(ip) {
        if (!this.config.allowedIPs.includes(ip)) {
            this.config.allowedIPs.push(ip);
            return this.saveConfig();
        }
        return true;
    }

    removeAllowedIP(ip) {
        this.config.allowedIPs = this.config.allowedIPs.filter(ip => ip !== ip);
        return this.saveConfig();
    }
}

const maintenanceManager = new MaintenanceManager();

// Controller functions
exports.getMaintenanceStatus = (req, res) => {
    res.json({
        success: true,
        data: maintenanceManager.getMaintenanceInfo()
    });
};

exports.enableMaintenance = (req, res) => {
    const { message, startTime, endTime, allowedIPs, allowedRoutes } = req.body;
    
    const success = maintenanceManager.enableMaintenance(
        message,
        startTime,
        endTime,
        allowedIPs || [],
        allowedRoutes || []
    );
    
    res.json({
        success,
        message: success ? 'Maintenance mode enabled' : 'Failed to enable maintenance mode'
    });
};

exports.disableMaintenance = (req, res) => {
    const success = maintenanceManager.disableMaintenance();
    
    res.json({
        success,
        message: success ? 'Maintenance mode disabled' : 'Failed to disable maintenance mode'
    });
};

exports.updateMaintenanceMessage = (req, res) => {
    const { message } = req.body;
    
    const success = maintenanceManager.updateMessage(message);
    
    res.json({
        success,
        message: success ? 'Maintenance message updated' : 'Failed to update message'
    });
};

exports.addAllowedIP = (req, res) => {
    const { ip } = req.body;
    
    const success = maintenanceManager.addAllowedIP(ip);
    
    res.json({
        success,
        message: success ? `IP ${ip} added to allowed list` : 'Failed to add IP'
    });
};

exports.removeAllowedIP = (req, res) => {
    const { ip } = req.body;
    
    const success = maintenanceManager.removeAllowedIP(ip);
    
    res.json({
        success,
        message: success ? `IP ${ip} removed from allowed list` : 'Failed to remove IP'
    });
};

// Middleware for checking maintenance mode
exports.maintenanceMiddleware = (req, res, next) => {
    if (maintenanceManager.isUnderMaintenance(req)) {
        return res.status(503).json({
            error: 'Service Unavailable',
            message: maintenanceManager.config.message,
            maintenance: true,
            timestamp: new Date().toISOString()
        });
    }
    next();
};

// Export maintenance manager for use in other modules
module.exports.maintenanceManager = maintenanceManager;
