const express = require('express');
const router = express.Router();
const githubController = require('../controller/github.controller');

// GitHub routes
router.get('/', githubController.getGitHubPage);
router.get('/api/user/:username', githubController.getUserProfile);
router.get('/api/user/:username/repos', githubController.getUserRepos);
router.get('/api/repos/:username/:repo', githubController.getRepoDetails);

module.exports = router;
