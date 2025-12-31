// Dynamic path configuration module
const path = require('path');
const config = require('../../config/paths');

// Export the frontend root directory (for backward compatibility)
module.exports = config.FRONTEND_PATH;

// Also export individual path helpers
module.exports.getViewPath = config.getViewPath;
module.exports.getPublicPath = config.getPublicPath;
module.exports.getRoutePath = config.getRoutePath;
module.exports.getControllerPath = config.getControllerPath;