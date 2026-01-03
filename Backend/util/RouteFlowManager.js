const express = require('express');
const fs = require('fs');
const path = require('path');

/**
 * Route Flow Manager - Manages all routes in a structured flow
 * Creates a visual and programmatic representation of all API routes
 */
class RouteFlowManager {
    constructor(app) {
        this.app = app;
        this.routes = [];
        this.routeTree = {};
    }

    /**
     * Extract all routes from Express app
     */
    extractRoutes() {
        const routes = [];
        const stack = this.app._router.stack;

        stack.forEach((middleware) => {
            if (middleware.route) {
                // Direct routes
                const methods = Object.keys(middleware.route.methods);
                const path = middleware.route.path;
                
                methods.forEach(method => {
                    routes.push({
                        method: method.toUpperCase(),
                        path: path,
                        handler: middleware.route.stack[0].name || 'anonymous'
                    });
                });
            } else if (middleware.name === 'router') {
                // Router middleware
                this.extractRouterRoutes(middleware.handle.stack, '', routes);
            }
        });

        this.routes = routes;
        return routes;
    }

    /**
     * Extract routes from router middleware
     */
    extractRouterRoutes(stack, prefix, routes) {
        stack.forEach((middleware) => {
            if (middleware.route) {
                const methods = Object.keys(middleware.route.methods);
                const path = prefix + (middleware.route.path || '');
                
                methods.forEach(method => {
                    routes.push({
                        method: method.toUpperCase(),
                        path: path,
                        handler: middleware.route.stack[0].name || 'anonymous',
                        authenticated: this.isAuthProtected(middleware.route)
                    });
                });
            } else if (middleware.name === 'router') {
                const newPrefix = prefix + (middleware.regexp.source
                    .replace('\\/', '/')
                    .replace('\\d+', ':id')
                    .replace(/^\^|$\/?$/g, '') || '');
                
                this.extractRouterRoutes(middleware.handle.stack, newPrefix, routes);
            }
        });
    }

    /**
     * Check if route requires authentication
     */
    isAuthProtected(route) {
        if (!route.stack || route.stack.length === 0) return false;
        
        const middlewares = route.stack.map(s => s.name).join(',');
        return middlewares.includes('auth') || middlewares.includes('sessionAuth');
    }

    /**
     * Build route tree structure
     */
    buildRouteTree() {
        this.routeTree = {};

        this.routes.forEach(route => {
            const parts = route.path.split('/').filter(p => p);
            const baseRoute = '/' + parts[0];

            if (!this.routeTree[baseRoute]) {
                this.routeTree[baseRoute] = {
                    name: baseRoute,
                    routes: [],
                    methods: new Set()
                };
            }

            this.routeTree[baseRoute].routes.push(route);
            this.routeTree[baseRoute].methods.add(route.method);
        });

        return this.routeTree;
    }

    /**
     * Generate flow diagram in text format
     */
    generateFlowDiagram() {
        const diagram = [];
        diagram.push('═'.repeat(80));
        diagram.push('API ROUTE FLOW STRUCTURE');
        diagram.push('═'.repeat(80));

        Object.keys(this.routeTree).sort().forEach(baseRoute => {
            const section = this.routeTree[baseRoute];
            diagram.push(`\n┌─ ${section.name.toUpperCase()} [${Array.from(section.methods).join(', ')}]`);
            diagram.push('│');

            section.routes.forEach((route, idx) => {
                const isLast = idx === section.routes.length - 1;
                const prefix = isLast ? '└──' : '├──';
                const auth = route.authenticated ? ' [AUTH]' : '';
                
                diagram.push(`│ ${prefix} ${route.method.padEnd(6)} ${route.path}${auth}`);
            });
        });

        diagram.push('\n' + '═'.repeat(80));
        return diagram.join('\n');
    }

    /**
     * Generate GraphQL-like flow representation
     */
    generateStructuredFlow() {
        const flow = {
            timestamp: new Date().toISOString(),
            totalRoutes: this.routes.length,
            sections: {}
        };

        Object.keys(this.routeTree).sort().forEach(baseRoute => {
            const section = this.routeTree[baseRoute];
            flow.sections[baseRoute] = {
                description: `${baseRoute} endpoint group`,
                count: section.routes.length,
                routes: section.routes.map(r => ({
                    method: r.method,
                    path: r.path,
                    authenticated: r.authenticated,
                    handler: r.handler
                }))
            };
        });

        return flow;
    }

    /**
     * Save route map to file
     */
    saveRoutesFile(outputPath = './ROUTES_FLOW.json') {
        const flowData = this.generateStructuredFlow();
        fs.writeFileSync(outputPath, JSON.stringify(flowData, null, 2));
        return outputPath;
    }

    /**
     * Get routes by section
     */
    getRoutesBySection(section) {
        const baseRoute = section.startsWith('/') ? section : '/' + section;
        return this.routeTree[baseRoute]?.routes || [];
    }

    /**
     * Get routes by method
     */
    getRoutesByMethod(method) {
        return this.routes.filter(r => r.method === method.toUpperCase());
    }

    /**
     * Get protected routes
     */
    getProtectedRoutes() {
        return this.routes.filter(r => r.authenticated);
    }

    /**
     * Get public routes
     */
    getPublicRoutes() {
        return this.routes.filter(r => !r.authenticated);
    }

    /**
     * Search routes
     */
    searchRoutes(query) {
        return this.routes.filter(r => 
            r.path.toLowerCase().includes(query.toLowerCase()) ||
            r.method.includes(query.toUpperCase()) ||
            r.handler.toLowerCase().includes(query.toLowerCase())
        );
    }
}

module.exports = RouteFlowManager;
