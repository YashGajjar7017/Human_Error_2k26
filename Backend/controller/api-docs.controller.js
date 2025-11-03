const { auth } = require('../middleware/auth.middleware');
const fs = require('fs');
const path = require('path');

// In-memory storage for API documentation (in production, use database or file system)
let apiEndpoints = [];
let apiVersions = [];

// Load API documentation from routes
const loadApiDocumentation = () => {
    try {
        // This would normally scan route files and extract documentation
        // For now, we'll define some sample endpoints
        apiEndpoints = [
            {
                id: 'auth-login',
                path: '/api/auth/login',
                method: 'POST',
                category: 'Authentication',
                description: 'Authenticate user and return JWT token',
                parameters: [
                    { name: 'email', type: 'string', required: true, description: 'User email' },
                    { name: 'password', type: 'string', required: true, description: 'User password' }
                ],
                responses: {
                    200: { description: 'Login successful', schema: { token: 'string', user: 'object' } },
                    401: { description: 'Invalid credentials' }
                },
                version: 'v1.0'
            },
            {
                id: 'compiler-run',
                path: '/api/compiler/run',
                method: 'POST',
                category: 'Compiler',
                description: 'Compile and execute code',
                parameters: [
                    { name: 'code', type: 'string', required: true, description: 'Source code to compile' },
                    { name: 'language', type: 'string', required: true, description: 'Programming language' },
                    { name: 'input', type: 'string', required: false, description: 'Input for the program' }
                ],
                responses: {
                    200: { description: 'Compilation successful', schema: { output: 'string', executionTime: 'number' } },
                    400: { description: 'Compilation error' }
                },
                version: 'v1.0'
            },
            {
                id: 'projects-list',
                path: '/api/projects',
                method: 'GET',
                category: 'Projects',
                description: 'Get list of user projects',
                parameters: [
                    { name: 'page', type: 'number', required: false, description: 'Page number' },
                    { name: 'limit', type: 'number', required: false, description: 'Items per page' }
                ],
                responses: {
                    200: { description: 'Projects retrieved', schema: { projects: 'array', total: 'number' } }
                },
                version: 'v1.0'
            },
            {
                id: 'notifications-get',
                path: '/api/notifications',
                method: 'GET',
                category: 'Notifications',
                description: 'Get user notifications',
                parameters: [
                    { name: 'limit', type: 'number', required: false, description: 'Maximum notifications to return' }
                ],
                responses: {
                    200: { description: 'Notifications retrieved', schema: { notifications: 'array' } }
                },
                version: 'v1.0'
            },
            {
                id: 'analytics-user',
                path: '/api/analytics/user/overview',
                method: 'GET',
                category: 'Analytics',
                description: 'Get user analytics overview',
                parameters: [],
                responses: {
                    200: { description: 'Analytics retrieved', schema: { statistics: 'object', recentSessions: 'array' } }
                },
                version: 'v1.0'
            },
            {
                id: 'collaboration-sessions',
                path: '/api/collaboration/sessions',
                method: 'GET',
                category: 'Collaboration',
                description: 'Get collaboration sessions',
                parameters: [
                    { name: 'status', type: 'string', required: false, description: 'Session status filter' }
                ],
                responses: {
                    200: { description: 'Sessions retrieved', schema: { sessions: 'array' } }
                },
                version: 'v1.0'
            },
            {
                id: 'achievements-user',
                path: '/api/achievements/user',
                method: 'GET',
                category: 'Achievements',
                description: 'Get user achievements',
                parameters: [],
                responses: {
                    200: { description: 'Achievements retrieved', schema: { achievements: 'array' } }
                },
                version: 'v1.0'
            }
        ];

        apiVersions = [
            { version: 'v1.0', releaseDate: '2024-01-01', description: 'Initial API release' }
        ];
    } catch (error) {
        console.error('Error loading API documentation:', error);
    }
};

// Initialize documentation
loadApiDocumentation();

// Get API documentation overview
const getApiOverview = async (req, res) => {
    try {
        const categories = {};
        const totalEndpoints = apiEndpoints.length;

        // Group endpoints by category
        apiEndpoints.forEach(endpoint => {
            if (!categories[endpoint.category]) {
                categories[endpoint.category] = {
                    count: 0,
                    endpoints: []
                };
            }
            categories[endpoint.category].count++;
            categories[endpoint.category].endpoints.push({
                id: endpoint.id,
                path: endpoint.path,
                method: endpoint.method,
                description: endpoint.description
            });
        });

        res.json({
            success: true,
            overview: {
                totalEndpoints,
                categories: Object.keys(categories).length,
                versions: apiVersions.length,
                categories: categories
            }
        });
    } catch (error) {
        console.error('Error fetching API overview:', error);
        res.status(500).json({
            error: 'Failed to fetch API overview'
        });
    }
};

// Get all API endpoints
const getApiEndpoints = async (req, res) => {
    try {
        const { category, version, method } = req.query;

        let filteredEndpoints = [...apiEndpoints];

        if (category) {
            filteredEndpoints = filteredEndpoints.filter(e => e.category === category);
        }

        if (version) {
            filteredEndpoints = filteredEndpoints.filter(e => e.version === version);
        }

        if (method) {
            filteredEndpoints = filteredEndpoints.filter(e => e.method === method);
        }

        res.json({
            success: true,
            endpoints: filteredEndpoints,
            total: filteredEndpoints.length
        });
    } catch (error) {
        console.error('Error fetching API endpoints:', error);
        res.status(500).json({
            error: 'Failed to fetch API endpoints'
        });
    }
};

// Get specific API endpoint
const getApiEndpoint = async (req, res) => {
    try {
        const endpointId = req.params.id;

        const endpoint = apiEndpoints.find(e => e.id === endpointId);

        if (!endpoint) {
            return res.status(404).json({
                error: 'API endpoint not found'
            });
        }

        res.json({
            success: true,
            endpoint: endpoint
        });
    } catch (error) {
        console.error('Error fetching API endpoint:', error);
        res.status(500).json({
            error: 'Failed to fetch API endpoint'
        });
    }
};

// Get API categories
const getApiCategories = async (req, res) => {
    try {
        const categories = [
            { id: 'Authentication', name: 'Authentication', description: 'User authentication and authorization' },
            { id: 'Compiler', name: 'Compiler', description: 'Code compilation and execution' },
            { id: 'Projects', name: 'Projects', description: 'Project management' },
            { id: 'Notifications', name: 'Notifications', description: 'Notification system' },
            { id: 'Analytics', name: 'Analytics', description: 'Usage analytics and statistics' },
            { id: 'Collaboration', name: 'Collaboration', description: 'Code collaboration features' },
            { id: 'Achievements', name: 'Achievements', description: 'User achievements and badges' },
            { id: 'FileManager', name: 'File Manager', description: 'File upload and management' },
            { id: 'Snippets', name: 'Snippets', description: 'Code snippet management' }
        ];

        res.json({
            success: true,
            categories: categories
        });
    } catch (error) {
        console.error('Error fetching API categories:', error);
        res.status(500).json({
            error: 'Failed to fetch API categories'
        });
    }
};

// Get API versions
const getApiVersions = async (req, res) => {
    try {
        res.json({
            success: true,
            versions: apiVersions
        });
    } catch (error) {
        console.error('Error fetching API versions:', error);
        res.status(500).json({
            error: 'Failed to fetch API versions'
        });
    }
};

// Generate OpenAPI/Swagger specification
const generateOpenApiSpec = async (req, res) => {
    try {
        const spec = {
            openapi: '3.0.0',
            info: {
                title: 'Node Compiler API',
                version: '1.0.0',
                description: 'API for the Node Compiler application'
            },
            servers: [
                {
                    url: 'http://localhost:8000/api',
                    description: 'Development server'
                }
            ],
            paths: {},
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            },
            security: [
                {
                    bearerAuth: []
                }
            ]
        };

        // Group endpoints by path
        const paths = {};
        apiEndpoints.forEach(endpoint => {
            if (!paths[endpoint.path]) {
                paths[endpoint.path] = {};
            }

            paths[endpoint.path][endpoint.method.toLowerCase()] = {
                summary: endpoint.description,
                tags: [endpoint.category],
                parameters: endpoint.parameters.map(param => ({
                    name: param.name,
                    in: 'query',
                    required: param.required,
                    schema: { type: param.type },
                    description: param.description
                })),
                responses: Object.keys(endpoint.responses).reduce((acc, code) => {
                    acc[code] = {
                        description: endpoint.responses[code].description,
                        content: {
                            'application/json': {
                                schema: endpoint.responses[code].schema
                            }
                        }
                    };
                    return acc;
                }, {})
            };
        });

        spec.paths = paths;

        res.json(spec);
    } catch (error) {
        console.error('Error generating OpenAPI spec:', error);
        res.status(500).json({
            error: 'Failed to generate OpenAPI specification'
        });
    }
};

// Test API endpoint
const testApiEndpoint = async (req, res) => {
    try {
        const { endpointId, method, path, body } = req.body;

        if (!endpointId && !path) {
            return res.status(400).json({
                error: 'Either endpointId or path is required'
            });
        }

        let testEndpoint;
        if (endpointId) {
            testEndpoint = apiEndpoints.find(e => e.id === endpointId);
        } else {
            testEndpoint = apiEndpoints.find(e => e.path === path && e.method === method);
        }

        if (!testEndpoint) {
            return res.status(404).json({
                error: 'Endpoint not found in documentation'
            });
        }

        // Mock response based on endpoint
        const mockResponse = {
            success: true,
            message: 'This is a mock response for testing',
            endpoint: testEndpoint,
            timestamp: new Date().toISOString()
        };

        // Add specific mock data based on endpoint
        switch (testEndpoint.category) {
            case 'Compiler':
                mockResponse.output = 'Hello, World!';
                mockResponse.executionTime = 0.5;
                break;
            case 'Projects':
                mockResponse.projects = [
                    { id: 1, name: 'Sample Project', language: 'javascript' }
                ];
                break;
            case 'Notifications':
                mockResponse.notifications = [
                    { id: 1, title: 'Test Notification', message: 'This is a test' }
                ];
                break;
            case 'Analytics':
                mockResponse.statistics = { totalSessions: 42, successRate: 95 };
                break;
        }

        res.json(mockResponse);
    } catch (error) {
        console.error('Error testing API endpoint:', error);
        res.status(500).json({
            error: 'Failed to test API endpoint'
        });
    }
};

// Get API health status
const getApiHealth = async (req, res) => {
    try {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            endpoints: apiEndpoints.length,
            uptime: process.uptime(),
            memory: process.memoryUsage()
        };

        res.json({
            success: true,
            health: health
        });
    } catch (error) {
        console.error('Error fetching API health:', error);
        res.status(500).json({
            error: 'Failed to fetch API health'
        });
    }
};

// Export API documentation
const exportApiDocs = async (req, res) => {
    try {
        const { format = 'json' } = req.query;

        const exportData = {
            overview: {
                totalEndpoints: apiEndpoints.length,
                categories: [...new Set(apiEndpoints.map(e => e.category))],
                versions: apiVersions
            },
            endpoints: apiEndpoints,
            exportedAt: new Date().toISOString()
        };

        if (format === 'json') {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=api-docs-${Date.now()}.json`);
            res.json(exportData);
        } else {
            // Simple text format
            let textContent = 'API Documentation\n=================\n\n';
            textContent += `Total Endpoints: ${apiEndpoints.length}\n\n`;

            const categories = {};
            apiEndpoints.forEach(endpoint => {
                if (!categories[endpoint.category]) categories[endpoint.category] = [];
                categories[endpoint.category].push(endpoint);
            });

            Object.keys(categories).forEach(category => {
                textContent += `${category}\n${'-'.repeat(category.length)}\n`;
                categories[category].forEach(endpoint => {
                    textContent += `${endpoint.method} ${endpoint.path}\n`;
                    textContent += `${endpoint.description}\n\n`;
                });
            });

            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename=api-docs-${Date.now()}.txt`);
            res.send(textContent);
        }
    } catch (error) {
        console.error('Error exporting API docs:', error);
        res.status(500).json({
            error: 'Failed to export API documentation'
        });
    }
};

module.exports = {
    getApiOverview,
    getApiEndpoints,
    getApiEndpoint,
    getApiCategories,
    getApiVersions,
    generateOpenApiSpec,
    testApiEndpoint,
    getApiHealth,
    exportApiDocs
};
