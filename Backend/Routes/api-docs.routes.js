const express = require('express');
const router = express.Router();
const apiDocsController = require('../controller/api-docs.controller');
const { auth } = require('../middleware/auth.middleware');
const rateLimit = require('express-rate-limit');

// Rate limiting for API docs endpoints
const apiDocsLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 API docs requests per windowMs
    message: {
        error: 'Too many API documentation requests, please try again later.'
    }
});

// Public routes (no auth required)
router.get('/overview', apiDocsController.getApiOverview);
router.get('/endpoints', apiDocsController.getApiEndpoints);
router.get('/endpoints/:id', apiDocsController.getApiEndpoint);
router.get('/categories', apiDocsController.getApiCategories);
router.get('/versions', apiDocsController.getApiVersions);
router.get('/health', apiDocsController.getApiHealth);

// Protected routes (require auth)
router.get('/openapi', auth, apiDocsController.generateOpenApiSpec);
router.post('/test', auth, apiDocsLimiter, apiDocsController.testApiEndpoint);
router.get('/export', auth, apiDocsController.exportApiDocs);

module.exports = router;
