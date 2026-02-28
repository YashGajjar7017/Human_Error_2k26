import { useState } from 'react'
import '../styles/SharedComponents.css'

export default function Snippets() {
  const [activeTab, setActiveTab] = useState('all')
  const [selectedSnippet, setSelectedSnippet] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const snippets = [
    {
      id: 1,
      title: 'Array Chunk',
      description: 'Split array into smaller chunks',
      language: 'JavaScript',
      code: `function chunkArray(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}`,
      tags: ['array', 'utility', 'chunk'],
      likes: 42,
      uses: 156,
      createdAt: '2024-01-15',
      isFavorite: true
    },
    {
      id: 2,
      title: 'Debounce Function',
      description: 'Limit the rate at which a function can fire',
      language: 'JavaScript',
      code: `function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}`,
      tags: ['debounce', 'performance', 'utility'],
      likes: 89,
      uses: 312,
      createdAt: '2024-01-20',
      isFavorite: false
    },
    {
      id: 3,
      title: 'Binary Search',
      description: 'Efficient search algorithm for sorted arrays',
      language: 'Python',
      code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
      tags: ['search', 'algorithm', 'binary'],
      likes: 67,
      uses: 234,
      createdAt: '2024-02-01',
      isFavorite: true
    },
    {
      id: 4,
      title: 'Fetch with Retry',
      description: 'Fetch with automatic retry on failure',
      language: 'TypeScript',
      code: `async function fetchWithRetry(
  url: string, 
  retries: number = 3
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch (error) {
      if (i === retries - 1) throw error;
    }
  }
  throw new Error('Max retries exceeded');
}`,
      tags: ['fetch', 'retry', 'network'],
      likes: 45,
      uses: 98,
      createdAt: '2024-02-10',
      isFavorite: false
    },
    {
      id: 5,
      title: 'React Custom Hook - useLocalStorage',
      description: 'React hook for managing localStorage',
      language: 'JavaScript',
      code: `function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function 
        ? value(storedValue) 
        : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}`,
      tags: ['react', 'hooks', 'localStorage'],
      likes: 123,
      uses: 456,
      createdAt: '2024-02-15',
      isFavorite: true
    },
    {
      id: 6,
      title: 'CSS Grid Responsive',
      description: 'Responsive CSS Grid layout snippet',
      language: 'CSS',
      code: `.grid-container {
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(100%, 300px), 1fr)
  );
  gap: 1.5rem;
  padding: 1.5rem;
}`,
      tags: ['css', 'grid', 'responsive'],
      likes: 56,
      uses: 178,
      createdAt: '2024-02-20',
      isFavorite: false
    }
  ]

  const languages = ['All', 'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'CSS', 'HTML']

  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         snippet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         snippet.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesTab = activeTab === 'all' ? true : 
                       activeTab === 'favorites' ? snippet.isFavorite :
                       snippet.language === activeTab
    return matchesSearch && matchesTab
  })

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code)
    // Show toast notification
  }

  return (
    <div className="snippets-container">
      <header className="snippets-header">
        <div className="header-content">
          <h1>📝 Code Snippets</h1>
          <p>Store, organize, and share your code snippets</p>
        </div>
        <button className="create-btn" onClick={() => setShowCreateModal(true)}>
          ➕ New Snippet
        </button>
      </header>

      <div className="snippets-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search snippets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="language-filter">
          {languages.map(lang => (
            <button
              key={lang}
              className={`filter-btn ${activeTab === lang ? 'active' : ''}`}
              onClick={() => setActiveTab(lang)}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="snippets-grid">
        {filteredSnippets.map(snippet => (
          <div 
            key={snippet.id} 
            className={`snippet-card ${snippet.isFavorite ? 'favorite' : ''}`}
            onClick={() => setSelectedSnippet(snippet)}
          >
            <div className="snippet-header">
              <div className="snippet-title-row">
                <h3>{snippet.title}</h3>
                <span className="snippet-lang">{snippet.language}</span>
              </div>
              <p className="snippet-description">{snippet.description}</p>
            </div>
            <div className="snippet-code">
              <pre><code>{snippet.code}</code></pre>
            </div>
            <div className="snippet-tags">
              {snippet.tags.map(tag => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>
            <div className="snippet-footer">
              <div className="snippet-stats">
                <span>❤️ {snippet.likes}</span>
                <span>👁️ {snippet.uses}</span>
              </div>
              <div className="snippet-actions">
                <button 
                  className="action-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    copyToClipboard(snippet.code)
                  }}
                  title="Copy code"
                >
                  📋
                </button>
                <button 
                  className="action-btn"
                  onClick={(e) => e.stopPropagation()}
                  title="Add to favorites"
                >
                  {snippet.isFavorite ? '⭐' : '☆'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSnippets.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h3>No snippets found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Snippet Detail Modal */}
      {selectedSnippet && (
        <>
          <div className="modal-overlay" onClick={() => setSelectedSnippet(null)} />
          <div className="modal-content snippet-modal">
            <button className="close-btn" onClick={() => setSelectedSnippet(null)}>✕</button>
            <div className="snippet-modal-header">
              <h2>{selectedSnippet.title}</h2>
              <span className="snippet-lang large">{selectedSnippet.language}</span>
            </div>
            <p className="snippet-modal-desc">{selectedSnippet.description}</p>
            <div className="snippet-modal-code">
              <div className="code-header">
                <span>{selectedSnippet.language}</span>
                <button 
                  className="copy-btn"
                  onClick={() => copyToClipboard(selectedSnippet.code)}
                >
                  📋 Copy
                </button>
              </div>
              <pre><code>{selectedSnippet.code}</code></pre>
            </div>
            <div className="snippet-modal-tags">
              {selectedSnippet.tags.map(tag => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>
            <div className="snippet-modal-footer">
              <div className="snippet-stats">
                <span>❤️ {selectedSnippet.likes} likes</span>
                <span>👁️ {selectedSnippet.uses} uses</span>
                <span>📅 Created: {selectedSnippet.createdAt}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create Snippet Modal */}
      {showCreateModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)} />
          <div className="modal-content">
            <h2>Create New Snippet</h2>
            <div className="form-group">
              <label>Title</label>
              <input type="text" className="theme-input" placeholder="Snippet title..." />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="theme-input" placeholder="Brief description..." rows={2} />
            </div>
            <div className="form-group">
              <label>Language</label>
              <select className="theme-input">
                {languages.slice(1).map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Code</label>
              <textarea 
                className="theme-input code-input" 
                placeholder="Paste your code here..." 
                rows={10}
                style={{ fontFamily: 'monospace', background: '#1e1e1e', color: '#d4d4d4' }}
              />
            </div>
            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input type="text" className="theme-input" placeholder="utility, array, helper..." />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn-primary">Create Snippet</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

