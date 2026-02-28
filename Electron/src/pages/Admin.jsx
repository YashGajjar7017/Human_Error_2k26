import { useState, useEffect } from 'react'
import '../styles/SharedComponents.css'

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedUser, setSelectedUser] = useState(null)
  const [animatedStats, setAnimatedStats] = useState({})
  const [visibleItems, setVisibleItems] = useState([])

  const stats = {
    totalUsers: 12458,
    activeToday: 342,
    totalChallenges: 856,
    completionsToday: 1245,
    revenue: 28500,
    newSignups: 156
  }

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', joined: '2 hours ago', level: 15 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active', joined: '5 hours ago', level: 22 },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', status: 'pending', joined: '1 day ago', level: 3 },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', status: 'active', joined: '2 days ago', level: 28 },
    { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', status: 'suspended', joined: '3 days ago', level: 10 }
  ]

  const systemHealth = [
    { name: 'API Server', status: 'healthy', uptime: '99.9%', latency: '45ms' },
    { name: 'Database', status: 'healthy', uptime: '99.99%', latency: '12ms' },
    { name: 'ML Service', status: 'healthy', uptime: '99.5%', latency: '120ms' },
    { name: 'WebSocket', status: 'warning', uptime: '98.5%', latency: '250ms' },
    { name: 'Storage', status: 'healthy', uptime: '100%', latency: '8ms' }
  ]

  const recentActivity = [
    { id: 1, action: 'User signup', user: 'new_user_123', time: '2 min ago', details: 'Email verification completed' },
    { id: 2, action: 'Challenge completed', user: 'code_master', time: '5 min ago', details: 'Binary Search - Score: 95%' },
    { id: 3, action: 'Payment received', user: 'premium_user', time: '12 min ago', details: '$29.99 - Monthly subscription' },
    { id: 4, action: 'Report submitted', user: 'bug_hunter', time: '30 min ago', details: 'Bug in compiler module' },
    { id: 5, action: 'Account suspended', user: 'spammer_001', time: '1 hour ago', details: 'Violation of terms of service' }
  ]

  const contentFlagged = [
    { id: 1, type: 'Code Snippet', title: 'Suspicious code pattern', reportedBy: 'Auto-detection', severity: 'medium', date: '1 hour ago' },
    { id: 2, type: 'Comment', title: 'Inappropriate language', reportedBy: 'User_123', severity: 'high', date: '3 hours ago' },
    { id: 3, type: 'Profile', title: 'Fake account', reportedBy: 'Multiple users', severity: 'low', date: '1 day ago' }
  ]

  // Animation on mount
  useEffect(() => {
    // Animate stat counters
    setTimeout(() => {
      setAnimatedStats({
        totalUsers: { value: 0, target: 12458 },
        activeToday: { value: 0, target: 342 },
        totalChallenges: { value: 0, target: 856 },
        completionsToday: { value: 0, target: 1245 },
        revenue: { value: 0, target: 28500 },
        newSignups: { value: 0, target: 156 }
      })
    }, 100)

    // Stagger visible items
    [0, 1, 2, 3, 4, 5].forEach((index) => {
      setTimeout(() => {
        setVisibleItems(prev => [...prev, index])
      }, 200 + index * 100)
    })
  }, [])

  // Counter animation effect
  useEffect(() => {
    const duration = 1500
    const steps = 60
    const interval = duration / steps

    const timers = []

    Object.keys(animatedStats).forEach(key => {
      if (animatedStats[key] && animatedStats[key].value < animatedStats[key].target) {
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

  const formatNumber = (num) => {
    if (typeof num === 'number') {
      return Math.floor(num).toLocaleString()
    }
    return num
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-content">
          <h1 className="animate-fade-in-up">⚙️ Admin Dashboard</h1>
          <p className="animate-fade-in-up delay-1">System administration and user management</p>
        </div>
        <div className="header-actions">
          <button className="admin-btn animate-btn-pop">🔄 Refresh</button>
          <button className="admin-btn animate-btn-pop delay-1">📊 Export Report</button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="admin-stats">
        <div className={`stat-card animate-scale-in ${visibleItems.includes(0) ? 'visible' : ''}`} style={{ animationDelay: '0.1s' }}>
          <div className="stat-icon animate-icon-bounce">👥</div>
          <div className="stat-content">
            <span className="stat-value">{formatNumber(animatedStats.totalUsers?.value || 0)}</span>
            <span className="stat-label">Total Users</span>
          </div>
        </div>
        <div className={`stat-card animate-scale-in ${visibleItems.includes(1) ? 'visible' : ''}`} style={{ animationDelay: '0.15s' }}>
          <div className="stat-icon animate-icon-bounce">🟢</div>
          <div className="stat-content">
            <span className="stat-value">{formatNumber(animatedStats.activeToday?.value || 0)}</span>
            <span className="stat-label">Active Today</span>
          </div>
        </div>
        <div className={`stat-card animate-scale-in ${visibleItems.includes(2) ? 'visible' : ''}`} style={{ animationDelay: '0.2s' }}>
          <div className="stat-icon animate-icon-bounce">🎯</div>
          <div className="stat-content">
            <span className="stat-value">{formatNumber(animatedStats.totalChallenges?.value || 0)}</span>
            <span className="stat-label">Total Challenges</span>
          </div>
        </div>
        <div className={`stat-card animate-scale-in ${visibleItems.includes(3) ? 'visible' : ''}`} style={{ animationDelay: '0.25s' }}>
          <div className="stat-icon animate-icon-bounce">✅</div>
          <div className="stat-content">
            <span className="stat-value">{formatNumber(animatedStats.completionsToday?.value || 0)}</span>
            <span className="stat-label">Completions Today</span>
          </div>
        </div>
        <div className={`stat-card animate-scale-in ${visibleItems.includes(4) ? 'visible' : ''}`} style={{ animationDelay: '0.3s' }}>
          <div className="stat-icon animate-icon-bounce">💰</div>
          <div className="stat-content">
            <span className="stat-value">${formatNumber(animatedStats.revenue?.value || 0)}</span>
            <span className="stat-label">Monthly Revenue</span>
          </div>
        </div>
        <div className={`stat-card animate-scale-in ${visibleItems.includes(5) ? 'visible' : ''}`} style={{ animationDelay: '0.35s' }}>
          <div className="stat-icon animate-icon-bounce">📈</div>
          <div className="stat-content">
            <span className="stat-value">+{formatNumber(animatedStats.newSignups?.value || 0)}</span>
            <span className="stat-label">New Signups Today</span>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab animate-fade-in-up delay-1 ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`tab animate-fade-in-up delay-2 ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button 
          className={`tab animate-fade-in-up delay-3 ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          🖥️ System
        </button>
        <button 
          className={`tab animate-fade-in-up delay-4 ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          🚨 Content Moderation
        </button>
        <button 
          className={`tab animate-fade-in-up delay-5 ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-content animate-fade-in">
            <div className="activity-section">
              <h3 className="animate-slide-in-left">📋 Recent System Activity</h3>
              <div className="activity-table">
                <div className="table-header animate-fade-in">
                  <span>Action</span>
                  <span>User</span>
                  <span>Details</span>
                  <span>Time</span>
                </div>
                {recentActivity.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`table-row animate-slide-in-left ${visibleItems.includes(index) ? 'visible' : ''}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="action-type">{item.action}</span>
                    <span className="user-name">{item.user}</span>
                    <span className="details">{item.details}</span>
                    <span className="time">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-content animate-fade-in">
            <div className="users-header">
              <h3 className="animate-slide-in-left">👥 User Management</h3>
              <div className="user-filters animate-fade-in-up delay-1">
                <input type="text" placeholder="Search users..." className="search-input" />
                <select className="filter-select">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Suspended</option>
                </select>
              </div>
            </div>
            <div className="users-table">
              <div className="table-header">
                <span>ID</span>
                <span>Name</span>
                <span>Email</span>
                <span>Level</span>
                <span>Status</span>
                <span>Joined</span>
                <span>Actions</span>
              </div>
              {recentUsers.map((user, index) => (
                <div 
                  key={user.id} 
                  className={`table-row animate-slide-in-left ${visibleItems.includes(index) ? 'visible' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="user-id">#{user.id}</span>
                  <span className="user-name">{user.name}</span>
                  <span className="user-email">{user.email}</span>
                  <span className="user-level">Level {user.level}</span>
                  <span className={`status-badge ${user.status}`}>{user.status}</span>
                  <span className="join-date">{user.joined}</span>
                  <div className="action-buttons">
                    <button className="action-btn animate-btn-pop" title="View">👁️</button>
                    <button className="action-btn animate-btn-pop delay-1" title="Edit">✏️</button>
                    <button className="action-btn animate-btn-pop delay-2" title="Suspend">⚠️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="system-content animate-fade-in">
            <h3 className="animate-slide-in-left">🖥️ System Health</h3>
            <div className="health-grid">
              {systemHealth.map((system, index) => (
                <div 
                  key={index} 
                  className={`health-card ${system.status} animate-scale-in ${visibleItems.includes(index) ? 'visible' : ''}`}
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <div className="health-header">
                    <span className="health-name">{system.name}</span>
                    <span className={`health-status ${system.status}`}>
                      {system.status === 'healthy' ? '✓' : '!'}
                    </span>
                  </div>
                  <div className="health-stats">
                    <div className="health-stat animate-scale-in" style={{ animationDelay: '0.4s' }}>
                      <span className="stat-label">Uptime</span>
                      <span className="stat-value">{system.uptime}</span>
                    </div>
                    <div className="health-stat animate-scale-in" style={{ animationDelay: '0.5s' }}>
                      <span className="stat-label">Latency</span>
                      <span className="stat-value">{system.latency}</span>
                    </div>
                  </div>
                  {system.status === 'warning' && (
                    <div className="health-pulse animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>

            <div className="server-logs animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <h3 className="animate-slide-in-left">📜 Recent Server Logs</h3>
              <div className="logs-container">
                {['[INFO] API request: GET /api/challenges - 45ms', 
                  '[INFO] User authenticated: user_1234', 
                  '[SUCCESS] Challenge completed: binary_search',
                  '[WARN] High latency detected: ML service',
                  '[ERROR] Database connection timeout'].map((log, index) => (
                  <div 
                    key={index} 
                    className={`log-entry ${log.includes('[INFO]') ? 'info' : log.includes('[SUCCESS]') ? 'success' : log.includes('[WARN]') ? 'warning' : 'error'} animate-slide-in-left`}
                    style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="content-moderation animate-fade-in">
            <h3 className="animate-slide-in-left">🚨 Flagged Content</h3>
            <div className="flagged-list">
              {contentFlagged.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`flagged-item animate-slide-in-left ${visibleItems.includes(index) ? 'visible' : ''}`}
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="flagged-info">
                    <span className={`severity-badge ${item.severity}`}>{item.severity}</span>
                    <span className="flagged-type">{item.type}</span>
                    <span className="flagged-title">{item.title}</span>
                  </div>
                  <div className="flagged-meta">
                    <span>Reported by: {item.reportedBy}</span>
                    <span>{item.date}</span>
                  </div>
                  <div className="flagged-actions">
                    <button className="action-btn approve animate-btn-pop">✓ Approve</button>
                    <button className="action-btn reject animate-btn-pop delay-1">✕ Remove</button>
                    <button className="action-btn ban animate-btn-pop delay-2">🚫 Ban User</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-content animate-fade-in">
            <h3 className="animate-slide-in-left">📈 Advanced Analytics</h3>
            <div className="analytics-cards">
              <div className="analytics-card animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <h4>User Growth</h4>
                <div className="mini-chart">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                    <div 
                      key={i} 
                      className="chart-bar animate-progress-expand"
                      style={{ 
                        height: `${h}%`,
                        animationDelay: `${i * 0.05}s`
                      }}
                    ></div>
                  ))}
                </div>
                <p className="trend up animate-fade-in-up delay-1">↑ 15% from last month</p>
              </div>
              <div className="analytics-card animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <h4>Challenge Completion Rate</h4>
                <div className="progress-ring">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e0e0e0" strokeWidth="10" />
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke="url(#gradient)" 
                      strokeWidth="10" 
                      strokeDasharray="220" 
                      strokeDashoffset="44"
                      className="progress-circle-animate"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#667eea" />
                        <stop offset="100%" stopColor="#764ba2" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="progress-value animate-bounce">80%</span>
                </div>
              </div>
              <div className="analytics-card animate-scale-in" style={{ animationDelay: '0.3s' }}>
                <h4>Revenue Trend</h4>
                <div className="revenue-stats">
                  <div className="revenue-item animate-scale-in" style={{ animationDelay: '0.4s' }}>
                    <span className="label">This Month</span>
                    <span className="value">$28,500</span>
                  </div>
                  <div className="revenue-item animate-scale-in" style={{ animationDelay: '0.5s' }}>
                    <span className="label">Last Month</span>
                    <span className="value">$24,200</span>
                  </div>
                  <div className="revenue-item positive animate-scale-in" style={{ animationDelay: '0.6s' }}>
                    <span className="label">Growth</span>
                    <span className="value">+18%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

