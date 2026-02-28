import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import '../styles/Dashboard.css'
import '../styles/Theme.css'

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate()
  const [visibleItems, setVisibleItems] = useState([])
  const [animatedStats, setAnimatedStats] = useState({
    level: 0,
    points: 0,
    streak: 0,
    rank: 0
  })

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
    { label: 'Level', value: user?.level || '1', icon: '⭐', target: user?.level || 1 },
    { label: 'Points', value: user?.points || '0', icon: '🎯', target: user?.points || 0 },
    { label: 'Streak', value: user?.streak || '0', icon: '🔥', target: user?.streak || 0 },
    { label: 'Rank', value: user?.rank || '-', icon: '🏆', target: user?.rank || '-' }
  ]

  // Animation on mount
  useEffect(() => {
    // Animate stats counters
    setTimeout(() => {
      setAnimatedStats({
        level: { value: 0, target: user?.level || 1 },
        points: { value: 0, target: user?.points || 0 },
        streak: { value: 0, target: user?.streak || 0 },
        rank: { value: 0, target: user?.rank || 1 }
      })
    }, 100)

    // Stagger feature cards
    features.forEach((_, index) => {
      setTimeout(() => {
        setVisibleItems(prev => [...prev, index])
      }, 300 + index * 100)
    })
  }, [user])

  // Counter animation effect
  useEffect(() => {
    const duration = 1500
    const steps = 60
    const interval = duration / steps

    const timers = []

    Object.keys(animatedStats).forEach(key => {
      if (animatedStats[key] && typeof animatedStats[key].target === 'number') {
        const increment = animatedStats[key].target / steps
        
        const timer = setInterval(() => {
          setAnimatedStats(prev => {
            const current = prev[key]
            if (!current) return prev
            
            const newValue = Math.min(
              current.value + increment,
              current.target
            )
            
            return {
              ...prev,
              [key]: {
                ...current,
                value: newValue
              }
            }
          })
        }, interval)
        
        timers.push(timer)
      }
    })

    return () => timers.forEach(clearInterval)
  }, [animatedStats])

  const formatStatValue = (value) => {
    if (typeof value === 'number') {
      return Math.floor(value).toLocaleString()
    }
    return value
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left animate-fade-in-up">
            <h1>Human Error Dashboard</h1>
            <p>Welcome back, {user?.firstName || 'User'}!</p>
          </div>
          <div className="header-actions">
            <div className="quick-stats animate-fade-in-up delay-1">
              {quickStats.map((stat, index) => (
                <div key={index} className="quick-stat stat-bounce" style={{ animationDelay: `${index * 0.1}s` }}>
                  <span className="stat-icon animate-icon-bounce">{stat.icon}</span>
                  <div className="stat-info">
                    <span className="stat-value">{formatStatValue(animatedStats[stat.label.toLowerCase()]?.value || 0)}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="header-buttons animate-fade-in-up delay-2">
              <button className="header-btn animate-btn-pop" onClick={() => navigate('/notifications')}>
                🔔
              </button>
              <button className="header-btn animate-btn-pop delay-1" onClick={() => navigate('/settings')}>
                ⚙️
              </button>
              <button onClick={handleLogout} className="logout-btn animate-btn-pop delay-2">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Quick Actions Bar */}
        <div className="quick-actions-bar animate-fade-in-up delay-2">
          <div className="quick-action animate-scale-in" style={{ animationDelay: '0.1s' }} onClick={() => navigate('/compiler')}>
            <span className="action-icon">▶️</span>
            <span>Quick Compile</span>
          </div>
          <div className="quick-action animate-scale-in" style={{ animationDelay: '0.15s' }} onClick={() => navigate('/achievements')}>
            <span className="action-icon">🏆</span>
            <span>View Badges</span>
          </div>
          <div className="quick-action animate-scale-in" style={{ animationDelay: '0.2s' }} onClick={() => navigate('/collaboration')}>
            <span className="action-icon">🤝</span>
            <span>Join Room</span>
          </div>
          <div className="quick-action animate-scale-in" style={{ animationDelay: '0.25s' }} onClick={() => navigate('/leaderboard')}>
            <span className="action-icon">🏅</span>
            <span>Check Rank</span>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="welcome-card animate-scale-in">
          <div className="welcome-content animate-slide-in-left">
            <h2>🚀 Ready to code?</h2>
            <p>Pick up where you left off or start something new!</p>
          </div>
          <button className="start-coding-btn animate-btn-pop" onClick={() => navigate('/compiler')}>
            Start Coding →
          </button>
        </div>

        {/* Features Grid */}
        <h3 className="section-title animate-fade-in-up delay-2">✨ Features</h3>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`feature-card ${visibleItems.includes(index) ? 'animate-card-enter' : ''}`}
              onClick={() => navigate(feature.path)}
              style={{ 
                borderTop: `4px solid ${feature.color}`,
                animationDelay: `${index * 0.1}s`
              }}
            >
              <span className="feature-icon animate-icon-bounce">{feature.icon}</span>
              <h3 className="animate-text-slide">{feature.title}</h3>
              <p className="animate-text-slide delay-1">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="recent-activity-section animate-fade-in-up delay-4">
          <h3 className="section-title">📋 Recent Activity</h3>
          <div className="activity-cards">
            <div className="activity-card animate-slide-in-left" style={{ animationDelay: '0.1s' }}>
              <div className="activity-icon animate-icon-bounce">💻</div>
              <div className="activity-info">
                <h4>Last Coding Session</h4>
                <p>JavaScript Challenge • 2 hours ago</p>
              </div>
              <span className="activity-score animate-bounce">92%</span>
            </div>
            <div className="activity-card animate-slide-in-left" style={{ animationDelay: '0.2s' }}>
              <div className="activity-icon animate-icon-bounce">🏆</div>
              <div className="activity-info">
                <h4>Achievement Unlocked</h4>
                <p>Speed Demon • 5 hours ago</p>
              </div>
            </div>
            <div className="activity-card animate-slide-in-left" style={{ animationDelay: '0.3s' }}>
              <div className="activity-icon animate-icon-bounce">📚</div>
              <div className="activity-info">
                <h4>Course Progress</h4>
                <p>React Complete Guide • 45% complete</p>
              </div>
              <div className="progress-bar small animate-progress-expand">
                <div className="progress-fill" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Link (if user is admin) */}
        {user?.role === 'admin' && (
          <div className="admin-section animate-fade-in-up delay-4">
            <h3 className="section-title">🔧 Admin Area</h3>
            <div className="admin-card animate-scale-in" style={{ animationDelay: '0.1s' }} onClick={() => navigate('/admin')}>
              <span className="admin-icon animate-icon-rotate">⚙️</span>
              <div className="admin-info">
                <h4>Admin Dashboard</h4>
                <p>Manage users, system health, and content moderation</p>
              </div>
              <span className="admin-arrow animate-bounce">→</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

