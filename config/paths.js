const path = require('path');

// Dynamic path configuration for user installations
// Users can modify these paths based on their installation setup

const config = {
    // Frontend directory path (relative to project root or absolute)
    FRONTEND_PATH: process.env.FRONTEND_PATH
        ? (path.isAbsolute(process.env.FRONTEND_PATH)
            ? process.env.FRONTEND_PATH
            : path.resolve(__dirname, '..', process.env.FRONTEND_PATH))
        : path.join(__dirname, '..', 'Frontend'),

    // Backend directory path (relative to project root or absolute)
    BACKEND_PATH: process.env.BACKEND_PATH
        ? (path.isAbsolute(process.env.BACKEND_PATH)
            ? process.env.BACKEND_PATH
            : path.resolve(__dirname, '..', process.env.BACKEND_PATH))
        : path.join(__dirname, '..', 'Backend'),

    // React frontend path (if using React build)
    REACT_FRONTEND_PATH: process.env.REACT_FRONTEND_PATH
        ? (path.isAbsolute(process.env.REACT_FRONTEND_PATH)
            ? process.env.REACT_FRONTEND_PATH
            : path.resolve(__dirname, '..', process.env.REACT_FRONTEND_PATH))
        : path.join(__dirname, '..', 'React-Complier-Frontend'),

    // Views directory within frontend
    VIEWS_PATH: null, // Will be set dynamically

    // Public directory within frontend
    PUBLIC_PATH: null, // Will be set dynamically

    // Routes directory within frontend
    ROUTES_PATH: null, // Will be set dynamically

    // Controllers directory within frontend
    CONTROLLERS_PATH: null, // Will be set dynamically

    // Models directory within backend
    MODELS_PATH: null, // Will be set dynamically

    // Routes directory within backend
    BACKEND_ROUTES_PATH: null, // Will be set dynamically

    // Controllers directory within backend
    BACKEND_CONTROLLERS_PATH: null, // Will be set dynamically
};

// Initialize dynamic paths
function initializePaths() {
    // Frontend paths
    config.VIEWS_PATH = path.join(config.FRONTEND_PATH, 'views');
    config.PUBLIC_PATH = path.join(config.FRONTEND_PATH, 'Public');
    config.ROUTES_PATH = path.join(config.FRONTEND_PATH, 'Routes');
    config.CONTROLLERS_PATH = path.join(config.FRONTEND_PATH, 'controller');

    // Backend paths
    config.MODELS_PATH = path.join(config.BACKEND_PATH, 'models');
    config.BACKEND_ROUTES_PATH = path.join(config.BACKEND_PATH, 'Routes');
    config.BACKEND_CONTROLLERS_PATH = path.join(config.BACKEND_PATH, 'controller');

    // Validate paths exist
    const fs = require('fs');
    const requiredPaths = [
        config.FRONTEND_PATH,
        config.BACKEND_PATH,
        config.VIEWS_PATH,
        config.PUBLIC_PATH
    ];

    for (const requiredPath of requiredPaths) {
        if (!fs.existsSync(requiredPath)) {
            console.warn(`Warning: Path does not exist: ${requiredPath}`);
        }
    }
}

// Helper functions to get paths
config.getViewPath = (viewName) => {
    return path.join(config.VIEWS_PATH, viewName);
};

config.getPublicPath = (assetPath = '') => {
    return path.join(config.PUBLIC_PATH, assetPath);
};

config.getRoutePath = (routeName) => {
    return path.join(config.ROUTES_PATH, routeName);
};

config.getControllerPath = (controllerName) => {
    return path.join(config.CONTROLLERS_PATH, controllerName);
};

config.getModelPath = (modelName) => {
    return path.join(config.MODELS_PATH, modelName);
};

config.getBackendRoutePath = (routeName) => {
    return path.join(config.BACKEND_ROUTES_PATH, routeName);
};

config.getBackendControllerPath = (controllerName) => {
    return path.join(config.BACKEND_CONTROLLERS_PATH, controllerName);
};

// Initialize paths on module load
initializePaths();

module.exports = config;