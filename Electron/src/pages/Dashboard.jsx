import { useNavigate } from 'react-router-dom'
import '../styles/Dashboard.css'
import '../styles/Theme.css'

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  const features = [
    { 
      icon: '💻', 
      title: 'Code Compiler', 
      description: 'Write, compile and execute code in multiple languages',
      path: '/compiler',
      color: '#667eea'
    },
    { 
      icon: '🤝', 
      title: 'Collaboration', 
      description: 'Work together with other developers in real-time',
      path: '/collaboration',
      color: '#28a745'
    },
    { 
      icon: '📚', 
      title: 'Learning Path', 
      description: 'Follow structured courses and improve your skills',
      path: '/classroom',
      color: '#17a2b8'
    },
    { 
      icon: '🏆', 
      title: 'Achievements', 
      description: 'Track your progress and earn badges',
      path: '/achievements',
      color: '#ffc107'
    },
    { 
      icon: '📊', 
      title: 'Analytics', 
      description: 'View your coding statistics and progress',
      path: '/analytics',
      color: '#6f42c1'
    },
    { 
      icon: '📝', 
      title: 'Snippets', 
      description: 'Store and organize your code snippets',
      path: '/snippets',
      color: '#e83e8c'
    },
    { 
      icon: '🔔', 
      title: 'Notifications', 
      description: 'Stay updated with your activity',
      path: '/notifications',
      color: '#fd7e14'
    },
    { 
      icon: '🏅', 
      title: 'Leaderboard', 
      description: 'See how you rank against others',
      path: '/leaderboard',
      color: '#20c997'
    }
  ]

  const quickStats = [
    { label: 'Level', value: user?.level || '1', icon: '⭐' },
    { label: 'Points', value: user?.points || '0', icon: '🎯' },
    { label: 'Streak', value: user?.streak || '0', icon: '🔥' },
    { label: 'Rank', value: user?.rank || '-', icon: '🏆' }
  ]

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Human Error Dashboard</h1>
            <p>Welcome back, {user?.firstName || 'User'}!</p>
          </div>
          <div className="header-actions">
            <div className="quick-stats">
              {quickStats.map((stat, index) => (
                <div key={index} className="quick-stat">
                  <span className="stat-icon">{stat.icon}</span>
                  <div className="stat-info">
                    <span className="stat-value">{stat.value}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="header-buttons">
              <button className="header-btn" onClick={() => navigate('/notifications')}>
                🔔
              </button>
              <button className="header-btn" onClick={() => navigate('/settings')}>
                ⚙️
              </button>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Quick Actions Bar */}
        <div className="quick-actions-bar">
          <div className="quick-action" onClick={() => navigate('/compiler')}>
            <span className="action-icon">▶️</span>
            <span>Quick Compile</span>
          </div>
          <div className="quick-action" onClick={() => navigate('/achievements')}>
            <span className="action-icon">🏆</span>
            <span>View Badges</span>
          </div>
          <div className="quick-action" onClick={() => navigate('/collaboration')}>
            <span className="action-icon">🤝</span>
            <span>Join Room</span>
          </div>
          <div className="quick-action" onClick={() => navigate('/leaderboard')}>
            <span className="action-icon">🏅</span>
            <span>Check Rank</span>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="welcome-card">
          <div className="welcome-content">
            <h2>🚀 Ready to code?</h2>
            <p>Pick up where you left off or start something new!</p>
          </div>
          <button className="start-coding-btn" onClick={() => navigate('/compiler')}>
            Start Coding →
          </button>
        </div>

        {/* Features Grid */}
        <h3 className="section-title">✨ Features</h3>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card"
              onClick={() => navigate(feature.path)}
              style={{ borderTop: `4px solid ${feature.color}` }}
            >
              <span className="feature-icon">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="recent-activity-section">
          <h3 className="section-title">📋 Recent Activity</h3>
          <div className="activity-cards">
            <div className="activity-card">
              <div className="activity-icon">💻</div>
              <div className="activity-info">
                <h4>Last Coding Session</h4>
                <p>JavaScript Challenge • 2 hours ago</p>
              </div>
              <span className="activity-score">92%</span>
            </div>
            <div className="activity-card">
              <div className="activity-icon">🏆</div>
              <div className="activity-info">
                <h4>Achievement Unlocked</h4>
                <p>Speed Demon • 5 hours ago</p>
              </div>
            </div>
            <div className="activity-card">
              <div className="activity-icon">📚</div>
              <div className="activity-info">
                <h4>Course Progress</h4>
                <p>React Complete Guide • 45% complete</p>
              </div>
              <div className="progress-bar small">
                <div className="progress-fill" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Link (if user is admin) */}
        {user?.role === 'admin' && (
          <div className="admin-section">
            <h3 className="section-title">🔧 Admin Area</h3>
            <div className="admin-card" onClick={() => navigate('/admin')}>
              <span className="admin-icon">⚙️</span>
              <div className="admin-info">
                <h4>Admin Dashboard</h4>
                <p>Manage users, system health, and content moderation</p>
              </div>
              <span className="admin-arrow">→</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
