import { useState, useEffect, useRef } from 'react'
import '../styles/SharedComponents.css'

export default function GlobalSearch({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  const allRoutes = [
    { path: '/dashboard', title: 'Dashboard', icon: '🏠', category: 'Main' },
    { path: '/compiler', title: 'Compiler', icon: '💻', category: 'Tools' },
    { path: '/achievements', title: 'Achievements', icon: '🏆', category: 'Gamification' },
    { path: '/collaboration', title: 'Collaboration', icon: '🤝', category: 'Social' },
    { path: '/classroom', title: 'Classroom', icon: '📚', category: 'Learning' },
    { path: '/analytics', title: 'Analytics', icon: '📊', category: 'Tools' },
    { path: '/snippets', title: 'Snippets', icon: '📝', category: 'Tools' },
    { path: '/notifications', title: 'Notifications', icon: '🔔', category: 'Account' },
    { path: '/leaderboard', title: 'Leaderboard', icon: '🏅', category: 'Gamification' },
    { path: '/admin', title: 'Admin', icon: '⚙️', category: 'Admin' },
    { path: '/profile', title: 'Profile', icon: '👤', category: 'Account' },
    { path: '/settings', title: 'Settings', icon: '⚡', category: 'Account' },
    { path: '/help', title: 'Help', icon: '❓', category: 'Info' },
    { path: '/about', title: 'About', icon: 'ℹ️', category: 'Info' },
    { path: '/privacy', title: 'Privacy', icon: '🔒', category: 'Info' },
    { path: '/terms', title: 'Terms', icon: '📜', category: 'Info' },
  ]

  const helpTopics = [
    { title: 'Getting Started', icon: '🚀', query: 'getting started' },
    { title: 'Code Compiler', icon: '💻', query: 'compiler' },
    { title: 'Achievements', icon: '🏆', query: 'achievements' },
    { title: 'Collaboration', icon: '🤝', query: 'collaboration' },
    { title: 'Classroom', icon: '📚', query: 'classroom' },
    { title: 'Account Settings', icon: '⚙️', query: 'settings' },
  ]

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (!isOpen) onOpen()
        else onClose()
      }
      
      if (isOpen) {
        if (e.key === 'Escape') {
          onClose()
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex(i => Math.min(i + 1, filteredResults.length - 1))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex(i => Math.max(i - 1, 0))
        } else if (e.key === 'Enter' && filteredResults.length > 0) {
          e.preventDefault()
          handleSelect(filteredResults[selectedIndex])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredResults])

  const filteredResults = allRoutes.filter(route =>
    route.title.toLowerCase().includes(query.toLowerCase()) ||
    route.category.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = (result) => {
    if (result.path && onNavigate) {
      onNavigate(result.path)
    }
    onClose()
    setQuery('')
  }

  const onOpen = () => {
    // This would be controlled by parent
  }

  if (!isOpen) return null

  return (
    <>
      <div className="search-overlay" onClick={onClose}>
        <div className="search-container" onClick={e => e.stopPropagation()}>
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder="Search pages, features, help..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelectedIndex(0)
              }}
            />
            <span className="search-kbd">ESC</span>
            <button className="search-close" onClick={onClose}>×</button>
          </div>

          <div className="search-results">
            {query ? (
              filteredResults.length > 0 ? (
                <div className="search-section">
                  <div className="search-section-title">Pages</div>
                  {filteredResults.map((result, index) => (
                    <div
                      key={result.path}
                      className={`search-item ${index === selectedIndex ? 'selected' : ''}`}
                      onClick={() => handleSelect(result)}
                    >
                      <div className="search-item-icon">{result.icon}</div>
                      <div className="search-item-content">
                        <div className="search-item-title">{result.title}</div>
                        <div className="search-item-subtitle">{result.category}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="search-section">
                  <div className="search-section-title">No results found</div>
                  <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    Try different keywords or browse help topics
                  </p>
                </div>
              )
            ) : (
              <>
                <div className="search-section">
                  <div className="search-section-title">Quick Links</div>
                  {allRoutes.slice(0, 6).map((result, index) => (
                    <div
                      key={result.path}
                      className={`search-item ${index === selectedIndex ? 'selected' : ''}`}
                      onClick={() => handleSelect(result)}
                    >
                      <div className="search-item-icon">{result.icon}</div>
                      <div className="search-item-content">
                        <div className="search-item-title">{result.title}</div>
                        <div className="search-item-subtitle">{result.category}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="search-section">
                  <div className="search-section-title">Help Topics</div>
                  {helpTopics.map((topic, index) => (
                    <div
                      key={topic.title}
                      className={`search-item ${index + 6 === selectedIndex ? 'selected' : ''}`}
                      onClick={() => handleSelect(topic)}
                    >
                      <div className="search-item-icon">{topic.icon}</div>
                      <div className="search-item-content">
                        <div className="search-item-title">{topic.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="search-shortcuts">
            <div className="search-shortcut">
              <kbd>↑↓</kbd> Navigate
            </div>
            <div className="search-shortcut">
              <kbd>↵</kbd> Select
            </div>
            <div className="search-shortcut">
              <kbd>Esc</kbd> Close
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

