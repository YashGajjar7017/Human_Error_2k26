const axios = require('axios');
const path = require('path');

// GitHub controller for handling GitHub integration requests
class GitHubController {
    // Render the GitHub page
    getGitHubPage(req, res) {
        res.sendFile(path.join(__dirname, '../views/github.html'));
    }

    // API endpoint to get GitHub user profile
    async getUserProfile(req, res) {
        try {
            const { username } = req.params;
            const response = await axios.get(`https://api.github.com/users/${username}`);

            res.json({
                success: true,
                data: response.data
            });
        } catch (error) {
            console.error('Error fetching GitHub user profile:', error.message);
            res.status(error.response?.status || 500).json({
                success: false,
                message: 'Error fetching user profile',
                error: error.response?.data?.message || error.message
            });
        }
    }

    // API endpoint to get GitHub user repositories
    async getUserRepos(req, res) {
        try {
            const { username } = req.params;
            const { sort = 'updated', page = 1, per_page = 10 } = req.query;

            const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
                params: {
                    sort,
                    page: parseInt(page),
                    per_page: parseInt(per_page)
                }
            });

            res.json({
                success: true,
                data: response.data
            });
        } catch (error) {
            console.error('Error fetching GitHub user repos:', error.message);
            res.status(error.response?.status || 500).json({
                success: false,
                message: 'Error fetching user repositories',
                error: error.response?.data?.message || error.message
            });
        }
    }

    // API endpoint to get GitHub repository details
    async getRepoDetails(req, res) {
        try {
            const { username, repo } = req.params;
            const response = await axios.get(`https://api.github.com/repos/${username}/${repo}`);

            res.json({
                success: true,
                data: response.data
            });
        } catch (error) {
            console.error('Error fetching GitHub repo details:', error.message);
            res.status(error.response?.status || 500).json({
                success: false,
                message: 'Error fetching repository details',
                error: error.response?.data?.message || error.message
            });
        }
    }
}

module.exports = new GitHubController();
