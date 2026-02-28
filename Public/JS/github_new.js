// GitHub Integration JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const searchUserBtn = document.getElementById('search-user');
    const githubUsernameInput = document.getElementById('github-username');
    const userProfileDiv = document.getElementById('user-profile');
    const reposSection = document.getElementById('repos-section');
    const reposList = document.getElementById('repos-list');
    const sortReposSelect = document.getElementById('sort-repos');

    // Search user functionality
    searchUserBtn.addEventListener('click', function() {
        const username = githubUsernameInput.value.trim();
        if (username) {
            searchUser(username);
        }
    });

    // Enter key support for search
    githubUsernameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchUserBtn.click();
        }
    });

    // Sort repositories
    sortReposSelect.addEventListener('change', function() {
        const username = githubUsernameInput.value.trim();
        if (username && userProfileDiv.style.display !== 'none') {
            loadUserRepos(username, sortReposSelect.value);
        }
    });

    async function searchUser(username) {
        try {
            // Show loading
            searchUserBtn.disabled = true;
            searchUserBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Searching...';

            const response = await fetch(`/api/github/user/${username}`);
            if (!response.ok) {
                throw new Error('User not found');
            }
            const user = await response.json();

            displayUserProfile(user);
            loadUserRepos(username);

        } catch (error) {
            console.error('Error searching user:', error);
            alert('User not found or error occurred. Please try again.');
        } finally {
            searchUserBtn.disabled = false;
            searchUserBtn.innerHTML = '<i class="bx bx-search"></i> Search';
        }
    }

    function displayUserProfile(user) {
        document.getElementById('user-avatar').src = user.avatar_url;
        document.getElementById('user-name').textContent = user.name || user.login;
        document.getElementById('user-login').textContent = user.login;
        document.getElementById('user-repos').textContent = user.public_repos;
        document.getElementById('user-followers').textContent = user.followers;
        document.getElementById('user-following').textContent = user.following;
        document.getElementById('user-bio').textContent = user.bio || 'No bio available';
        document.getElementById('user-location').textContent = user.location || 'Not specified';
        document.getElementById('user-company').textContent = user.company || 'Not specified';
        document.getElementById('user-blog').textContent = user.blog || 'Not specified';
        document.getElementById('user-joined').textContent = new Date(user.created_at).toLocaleDateString();

        // Set GitHub link
        document.getElementById('user-url').href = user.html_url;

        userProfileDiv.style.display = 'block';
        reposSection.style.display = 'block';
    }

    async function loadUserRepos(username, sort = 'updated') {
        try {
            const response = await fetch(`/api/github/user/${username}/repos?sort=${sort}&per_page=10`);
            if (!response.ok) {
                throw new Error('Failed to load repositories');
            }
            const repos = await response.json();

            displayRepos(repos);
        } catch (error) {
            console.error('Error loading repositories:', error);
            reposList.innerHTML = '<p class="text-danger">Failed to load repositories</p>';
        }
    }

    function displayRepos(repos) {
        reposList.innerHTML = '';

        if (repos.length === 0) {
            reposList.innerHTML = '<p class="text-muted">No public repositories found</p>';
            return;
        }

        repos.forEach(repo => {
            const repoCard = createRepoCard(repo);
            reposList.appendChild(repoCard);
        });
    }

    function createRepoCard(repo) {
        const col = document.createElement('div');
        col.className = 'col-md-6 mb-3';

        col.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">
                        <a href="${repo.html_url}" target="_blank" class="text-decoration-none">${repo.name}</a>
                    </h5>
                    <p class="card-text text-muted">${repo.description || 'No description available'}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">
                            <i class="bx bx-star"></i> ${repo.stargazers_count}
                            <i class="bx bx-git-branch ms-2"></i> ${repo.forks_count}
                        </small>
                        <span class="badge bg-primary">${repo.language || 'N/A'}</span>
                    </div>
                    <small class="text-muted">Updated ${new Date(repo.updated_at).toLocaleDateString()}</small>
                </div>
            </div>
        `;

        return col;
    }

    // Repository modal functionality
    const repoModal = new bootstrap.Modal(document.getElementById('repoModal'));
    let currentRepo = null;

    // Event delegation for repository cards
    reposList.addEventListener('click', function(e) {
        const card = e.target.closest('.card');
        if (card) {
            const repoLink = card.querySelector('.card-title a');
            if (repoLink) {
                const repoUrl = repoLink.href;
                const repoName = repoLink.textContent;
                const username = githubUsernameInput.value.trim();
                showRepoDetails(username, repoName);
            }
        }
    });

    async function showRepoDetails(username, repoName) {
        try {
            const response = await fetch(`/api/github/repos/${username}/${repoName}`);
            if (!response.ok) {
                throw new Error('Failed to load repository details');
            }
            const repo = await response.json();

            document.getElementById('repoModalLabel').textContent = repo.name;
            document.getElementById('repo-details').innerHTML = `
                <div class="row">
                    <div class="col-md-8">
                        <p>${repo.description || 'No description available'}</p>
                        <div class="row text-center mb-3">
                            <div class="col">
                                <div class="h4 text-warning">${repo.stargazers_count}</div>
                                <small class="text-muted">Stars</small>
                            </div>
                            <div class="col">
                                <div class="h4 text-info">${repo.forks_count}</div>
                                <small class="text-muted">Forks</small>
                            </div>
                            <div class="col">
                                <div class="h4 text-success">${repo.watchers_count}</div>
                                <small class="text-muted">Watchers</small>
                            </div>
                        </div>
                        <p><strong>Language:</strong> ${repo.language || 'Not specified'}</p>
                        <p><strong>Created:</strong> ${new Date(repo.created_at).toLocaleDateString()}</p>
                        <p><strong>Last Updated:</strong> ${new Date(repo.updated_at).toLocaleDateString()}</p>
                        <a href="${repo.html_url}" target="_blank" class="btn btn-primary">View on GitHub</a>
                    </div>
                    <div class="col-md-4 text-center">
                        <img src="${repo.owner.avatar_url}" alt="Owner Avatar" class="img-fluid rounded-circle mb-3" style="max-width: 100px;">
                        <h5>${repo.owner.login}</h5>
                    </div>
                </div>
            `;

            repoModal.show();
        } catch (error) {
            console.error('Error loading repository details:', error);
            alert('Failed to load repository details');
        }
    }
});
