// GitHub integration functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchUserBtn = document.getElementById('search-user');
    const githubUsernameInput = document.getElementById('github-username');
    const userProfile = document.getElementById('user-profile');
    const reposSection = document.getElementById('repos-section');
    const reposList = document.getElementById('repos-list');
    const sortReposSelect = document.getElementById('sort-repos');

    let currentUser = null;
    let currentRepos = [];

    // Search user functionality
    searchUserBtn.addEventListener('click', function() {
        const username = githubUsernameInput.value.trim();
        if (!username) {
            alert('Please enter a GitHub username');
            return;
        }

        searchUser(username);
    });

    githubUsernameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchUserBtn.click();
        }
    });

    function searchUser(username) {
        // Show loading
        searchUserBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Searching...';
        searchUserBtn.disabled = true;

        fetch(`/github/api/user/${username}`)
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    throw new Error(data.message);
                }

                currentUser = data;
                displayUserProfile(data);
                return fetch(`/github/api/user/${username}/repos`);
            })
            .then(response => response.json())
            .then(repos => {
                if (repos.message) {
                    throw new Error(repos.message);
                }

                currentRepos = repos;
                displayRepos(repos);
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error: ' + error.message);
                hideUserProfile();
            })
            .finally(() => {
                searchUserBtn.innerHTML = '<i class="bx bx-search"></i> Search';
                searchUserBtn.disabled = false;
            });
    }

    function displayUserProfile(user) {
        document.getElementById('user-avatar').src = user.avatar_url;
        document.getElementById('user-name').textContent = user.name || user.login;
        document.getElementById('user-login').textContent = '@' + user.login;
        document.getElementById('user-url').href = user.html_url;
        document.getElementById('user-repos').textContent = user.public_repos;
        document.getElementById('user-followers').textContent = user.followers;
        document.getElementById('user-following').textContent = user.following;
        document.getElementById('user-bio').textContent = user.bio || 'No bio available';
        document.getElementById('user-location').textContent = user.location || 'Not specified';
        document.getElementById('user-company').textContent = user.company || 'Not specified';
        document.getElementById('user-blog').textContent = user.blog || 'Not specified';

        const joinedDate = new Date(user.created_at);
        document.getElementById('user-joined').textContent = joinedDate.toLocaleDateString();

        userProfile.style.display = 'flex';
    }

    function hideUserProfile() {
        userProfile.style.display = 'none';
        reposSection.style.display = 'none';
    }

    function displayRepos(repos) {
        reposList.innerHTML = '';

        if (repos.length === 0) {
            reposList.innerHTML = '<div class="col-12"><div class="alert alert-info">No public repositories found.</div></div>';
            reposSection.style.display = 'block';
            return;
        }

        repos.forEach(repo => {
            const repoCard = createRepoCard(repo);
            reposList.appendChild(repoCard);
        });

        reposSection.style.display = 'block';
    }

    function createRepoCard(repo) {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4 mb-3';

        const card = document.createElement('div');
        card.className = 'card h-100 bg-secondary text-white';

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body d-flex flex-column';

        const title = document.createElement('h5');
        title.className = 'card-title';
        title.innerHTML = `<i class='bx bx-folder'></i> <a href="${repo.html_url}" target="_blank" class="text-white text-decoration-none">${repo.name}</a>`;

        const description = document.createElement('p');
        description.className = 'card-text flex-grow-1';
        description.textContent = repo.description || 'No description available';

        const stats = document.createElement('div');
        stats.className = 'mt-auto';
        stats.innerHTML = `
            <small class="text-muted">
                <i class='bx bx-star'></i> ${repo.stargazers_count}
                <i class='bx bx-git-branch' style="margin-left: 10px;"></i> ${repo.forks_count}
                <span class="badge bg-${getLanguageColor(repo.language)} ms-2">${repo.language || 'Unknown'}</span>
            </small>
        `;

        const updated = document.createElement('div');
        updated.className = 'mt-2';
        updated.innerHTML = `<small class="text-muted">Updated ${formatDate(repo.updated_at)}</small>`;

        cardBody.appendChild(title);
        cardBody.appendChild(description);
        cardBody.appendChild(stats);
        cardBody.appendChild(updated);

        card.appendChild(cardBody);
        col.appendChild(card);

        // Add click event to show repo details
        card.addEventListener('click', () => showRepoDetails(repo));

        return col;
    }

    function getLanguageColor(language) {
        const colors = {
            'JavaScript': 'warning',
            'Python': 'success',
            'Java': 'danger',
            'C++': 'info',
            'C': 'primary',
            'HTML': 'secondary',
            'CSS': 'secondary',
            'PHP': 'purple',
            'Ruby': 'danger',
            'Go': 'info',
            'TypeScript': 'primary'
        };
        return colors[language] || 'secondary';
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'today';
        if (diffDays === 2) return 'yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
        return `${Math.ceil(diffDays / 365)} years ago`;
    }

    function showRepoDetails(repo) {
        const modal = new bootstrap.Modal(document.getElementById('repoModal'));
        const details = document.getElementById('repo-details');

        details.innerHTML = `
            <div class="text-center mb-3">
                <h4><a href="${repo.html_url}" target="_blank" class="text-white text-decoration-none">${repo.name}</a></h4>
                <p class="text-muted">${repo.full_name}</p>
            </div>
            <p>${repo.description || 'No description available'}</p>
            <div class="row text-center mb-3">
                <div class="col">
                    <div class="h5 text-warning"><i class='bx bx-star'></i> ${repo.stargazers_count}</div>
                    <small>Stars</small>
                </div>
                <div class="col">
                    <div class="h5 text-info"><i class='bx bx-git-branch'></i> ${repo.forks_count}</div>
                    <small>Forks</small>
                </div>
                <div class="col">
                    <div class="h5 text-success"><i class='bx bx-show'></i> ${repo.watchers_count}</div>
                    <small>Watchers</small>
                </div>
            </div>
            <div class="mb-3">
                <strong>Language:</strong> <span class="badge bg-${getLanguageColor(repo.language)}">${repo.language || 'Unknown'}</span><br>
                <strong>Created:</strong> ${formatDate(repo.created_at)}<br>
                <strong>Last Updated:</strong> ${formatDate(repo.updated_at)}<br>
                <strong>Size:</strong> ${(repo.size / 1024).toFixed(2)} MB
            </div>
            ${repo.homepage ? `<p><strong>Homepage:</strong> <a href="${repo.homepage}" target="_blank">${repo.homepage}</a></p>` : ''}
        `;

        modal.show();
    }

    // Sort repositories
    sortReposSelect.addEventListener('change', function() {
        const sortBy = this.value;
        const sortedRepos = [...currentRepos].sort((a, b) => {
            if (sortBy === 'updated' || sortBy === 'created' || sortBy === 'pushed') {
                return new Date(b[sortBy + '_at']) - new Date(a[sortBy + '_at']);
            } else if (sortBy === 'full_name') {
                return a.full_name.localeCompare(b.full_name);
            } else if (sortBy === 'stargazers_count') {
                return b.stargazers_count - a.stargazers_count;
            }
            return 0;
        });

        displayRepos(sortedRepos);
    });
});
