const express = require('express');
const RouteFlowManager = require('../util/RouteFlowManager');
const { auth, authorize } = require('../middleware/auth.middleware');

let routeFlowManager = null;

/**
 * Initialize route flow manager with the app
 */
function initializeRouteFlow(app) {
    routeFlowManager = new RouteFlowManager(app);
    routeFlowManager.extractRoutes();
    routeFlowManager.buildRouteTree();
    console.log(`[ROUTE FLOW] Extracted ${routeFlowManager.routes.length} routes`);
    return routeFlowManager;
}

const router = express.Router();

/**
 * GET /api/routes/flow
 * Get complete route flow structure
 */
router.get('/flow', (req, res) => {
    if (!routeFlowManager) {
        return res.status(500).json({ success: false, error: 'Route flow manager not initialized' });
    }

    res.json({
        success: true,
        data: routeFlowManager.generateStructuredFlow()
    });
});

/**
 * GET /api/routes/diagram
 * Get ASCII flow diagram
 */
router.get('/diagram', (req, res) => {
    if (!routeFlowManager) {
        return res.status(500).json({ success: false, error: 'Route flow manager not initialized' });
    }

    res.set('Content-Type', 'text/plain').send(routeFlowManager.generateFlowDiagram());
});

/**
 * GET /api/routes/tree
 * Get route tree structure
 */
router.get('/tree', (req, res) => {
    if (!routeFlowManager) {
        return res.status(500).json({ success: false, error: 'Route flow manager not initialized' });
    }

    const tree = {};
    Object.entries(routeFlowManager.routeTree).forEach(([key, value]) => {
        tree[key] = {
            name: value.name,
            methods: Array.from(value.methods),
            routeCount: value.routes.length
        };
    });

    res.json({
        success: true,
        data: tree
    });
});

/**
 * GET /api/routes/section/:section
 * Get routes by section
 */
router.get('/section/:section', (req, res) => {
    if (!routeFlowManager) {
        return res.status(500).json({ success: false, error: 'Route flow manager not initialized' });
    }

    const routes = routeFlowManager.getRoutesBySection(req.params.section);
    res.json({
        success: true,
        section: req.params.section,
        count: routes.length,
        routes: routes
    });
});

/**
 * GET /api/routes/method/:method
 * Get routes by HTTP method
 */
router.get('/method/:method', (req, res) => {
    if (!routeFlowManager) {
        return res.status(500).json({ success: false, error: 'Route flow manager not initialized' });
    }

    const routes = routeFlowManager.getRoutesByMethod(req.params.method);
    res.json({
        success: true,
        method: req.params.method.toUpperCase(),
        count: routes.length,
        routes: routes
    });
});

/**
 * GET /api/routes/protected
 * Get all protected routes
 */
router.get('/protected', auth, (req, res) => {
    if (!routeFlowManager) {
        return res.status(500).json({ success: false, error: 'Route flow manager not initialized' });
    }

    const routes = routeFlowManager.getProtectedRoutes();
    res.json({
        success: true,
        count: routes.length,
        routes: routes
    });
});

/**
 * GET /api/routes/public
 * Get all public routes
 */
router.get('/public', (req, res) => {
    if (!routeFlowManager) {
        return res.status(500).json({ success: false, error: 'Route flow manager not initialized' });
    }

    const routes = routeFlowManager.getPublicRoutes();
    res.json({
        success: true,
        count: routes.length,
        routes: routes
    });
});

/**
 * GET /api/routes/search?q=query
 * Search routes
 */
router.get('/search', (req, res) => {
    if (!routeFlowManager) {
        return res.status(500).json({ success: false, error: 'Route flow manager not initialized' });
    }

    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ success: false, error: 'Query parameter required' });
    }

    const results = routeFlowManager.searchRoutes(query);
    res.json({
        success: true,
        query: query,
        count: results.length,
        routes: results
    });
});

/**
 * GET /api/routes/stats
 * Get route statistics
 */
router.get('/stats', (req, res) => {
    if (!routeFlowManager) {
        return res.status(500).json({ success: false, error: 'Route flow manager not initialized' });
    }

    const protected = routeFlowManager.getProtectedRoutes();
    const public = routeFlowManager.getPublicRoutes();
    const methods = {};

    routeFlowManager.routes.forEach(r => {
        methods[r.method] = (methods[r.method] || 0) + 1;
    });

    const sections = Object.keys(routeFlowManager.routeTree).length;

    res.json({
        success: true,
        statistics: {
            totalRoutes: routeFlowManager.routes.length,
            protectedRoutes: protected.length,
            publicRoutes: public.length,
            sections: sections,
            methodBreakdown: methods
        }
    });
});

/**
 * POST /api/routes/refresh
 * Refresh route extraction (admin only)
 */
router.post('/refresh', auth, authorize('admin'), (req, res) => {
    try {
        if (!routeFlowManager) {
            return res.status(500).json({ success: false, error: 'Route flow manager not initialized' });
        }

        routeFlowManager.extractRoutes();
        routeFlowManager.buildRouteTree();

        res.json({
            success: true,
            message: 'Routes refreshed',
            totalRoutes: routeFlowManager.routes.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = {
    router,
    initializeRouteFlow,
    getRouteFlowManager: () => routeFlowManager
};
