import { useState } from 'react'
import '../styles/SharedComponents.css'

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedUser, setSelectedUser] = useState(null)

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

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="header-content">
          <h1>⚙️ Admin Dashboard</h1>
          <p>System administration and user management</p>
        </div>
        <div className="header-actions">
          <button className="admin-btn">🔄 Refresh</button>
          <button className="admin-btn">📊 Export Report</button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalUsers.toLocaleString()}</span>
            <span className="stat-label">Total Users</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <span className="stat-value">{stats.activeToday}</span>
            <span className="stat-label">Active Today</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <span className="stat-value">{stats.totalChallenges}</span>
            <span className="stat-label">Total Challenges</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-value">{stats.completionsToday.toLocaleString()}</span>
            <span className="stat-label">Completions Today</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <span className="stat-value">${stats.revenue.toLocaleString()}</span>
            <span className="stat-label">Monthly Revenue</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <span className="stat-value">+{stats.newSignups}</span>
            <span className="stat-label">New Signups Today</span>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button 
          className={`tab ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          🖥️ System
        </button>
        <button 
          className={`tab ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          🚨 Content Moderation
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <div className="activity-section">
              <h3>📋 Recent System Activity</h3>
              <div className="activity-table">
                <div className="table-header">
                  <span>Action</span>
                  <span>User</span>
                  <span>Details</span>
                  <span>Time</span>
                </div>
                {recentActivity.map(item => (
                  <div key={item.id} className="table-row">
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
          <div className="users-content">
            <div className="users-header">
              <h3>👥 User Management</h3>
              <div className="user-filters">
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
              {recentUsers.map(user => (
                <div key={user.id} className="table-row">
                  <span className="user-id">#{user.id}</span>
                  <span className="user-name">{user.name}</span>
                  <span className="user-email">{user.email}</span>
                  <span className="user-level">Level {user.level}</span>
                  <span className={`status-badge ${user.status}`}>{user.status}</span>
                  <span className="join-date">{user.joined}</span>
                  <div className="action-buttons">
                    <button className="action-btn" title="View">👁️</button>
                    <button className="action-btn" title="Edit">✏️</button>
                    <button className="action-btn" title="Suspend">⚠️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="system-content">
            <h3>🖥️ System Health</h3>
            <div className="health-grid">
              {systemHealth.map((system, index) => (
                <div key={index} className={`health-card ${system.status}`}>
                  <div className="health-header">
                    <span className="health-name">{system.name}</span>
                    <span className={`health-status ${system.status}`}>
                      {system.status === 'healthy' ? '✓' : '!'}
                    </span>
                  </div>
                  <div className="health-stats">
                    <div className="health-stat">
                      <span className="stat-label">Uptime</span>
                      <span className="stat-value">{system.uptime}</span>
                    </div>
                    <div className="health-stat">
                      <span className="stat-label">Latency</span>
                      <span className="stat-value">{system.latency}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="server-logs">
              <h3>📜 Recent Server Logs</h3>
              <div className="logs-container">
                <div className="log-entry info">[INFO] API request: GET /api/challenges - 45ms</div>
                <div className="log-entry info">[INFO] User authenticated: user_1234</div>
                <div className="log-entry success">[SUCCESS] Challenge completed: binary_search</div>
                <div className="log-entry warning">[WARN] High latency detected: ML service</div>
                <div className="log-entry error">[ERROR] Database connection timeout</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="content-moderation">
            <h3>🚨 Flagged Content</h3>
            <div className="flagged-list">
              {contentFlagged.map(item => (
                <div key={item.id} className="flagged-item">
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
                    <button className="action-btn approve">✓ Approve</button>
                    <button className="action-btn reject">✕ Remove</button>
                    <button className="action-btn ban">🚫 Ban User</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-content">
            <h3>📈 Advanced Analytics</h3>
            <div className="analytics-cards">
              <div className="analytics-card">
                <h4>User Growth</h4>
                <div className="mini-chart">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                    <div key={i} className="chart-bar" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
                <p className="trend up">↑ 15% from last month</p>
              </div>
              <div className="analytics-card">
                <h4>Challenge Completion Rate</h4>
                <div className="progress-ring">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e0e0e0" strokeWidth="10" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="url(#gradient)" strokeWidth="10" strokeDasharray="220" strokeDashoffset="44" />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#667eea" />
                        <stop offset="100%" stopColor="#764ba2" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="progress-value">80%</span>
                </div>
              </div>
              <div className="analytics-card">
                <h4>Revenue Trend</h4>
                <div className="revenue-stats">
                  <div className="revenue-item">
                    <span className="label">This Month</span>
                    <span className="value">$28,500</span>
                  </div>
                  <div className="revenue-item">
                    <span className="label">Last Month</span>
                    <span className="value">$24,200</span>
                  </div>
                  <div className="revenue-item positive">
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

