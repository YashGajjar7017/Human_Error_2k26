import { useState } from 'react'
import '../styles/SharedComponents.css'

export default function Notifications() {
  const [activeTab, setActiveTab] = useState('all')
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: 'You earned the "Speed Demon" badge for completing a challenge in under 5 minutes!',
      time: '5 min ago',
      read: false,
      icon: '🏆'
    },
    {
      id: 2,
      type: 'challenge',
      title: 'New Challenge Available',
      message: 'A new algorithm challenge "Binary Search Master" is now available. Give it a try!',
      time: '1 hour ago',
      read: false,
      icon: '🎯'
    },
    {
      id: 3,
      type: 'collaboration',
      title: 'Room Invitation',
      message: 'Alice Chen invited you to join "React Workshop" room',
      time: '2 hours ago',
      read: false,
      icon: '🤝'
    },
    {
      id: 4,
      type: 'course',
      title: 'New Lesson Available',
      message: 'A new lesson "Advanced Hooks" is now available in React Complete Guide',
      time: '3 hours ago',
      read: true,
      icon: '📚'
    },
    {
      id: 5,
      type: 'system',
      title: 'Weekly Report',
      message: 'Your weekly coding report is ready! You wrote 1,245 lines of code this week.',
      time: 'Yesterday',
      read: true,
      icon: '📊'
    },
    {
      id: 6,
      type: 'reminder',
      title: 'Keep Your Streak Alive!',
      message: 'Code today to maintain your 7-day streak. You\'re doing great!',
      time: 'Yesterday',
      read: true,
      icon: '🔥'
    },
    {
      id: 7,
      type: 'social',
      title: 'New Follower',
      message: 'Bob Smith started following you',
      time: '2 days ago',
      read: true,
      icon: '👤'
    },
    {
      id: 8,
      type: 'achievement',
      title: 'Level Up!',
      message: 'Congratulations! You reached Level 15. Keep up the excellent work!',
      time: '3 days ago',
      read: true,
      icon: '⭐'
    }
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read
    if (activeTab === 'all') return true
    return n.type === activeTab
  })

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const getTypeIcon = (type) => {
    const icons = {
      achievement: '🏆',
      challenge: '🎯',
      collaboration: '🤝',
      course: '📚',
      system: '📊',
      reminder: '🔥',
      social: '👤'
    }
    return icons[type] || '📌'
  }

  return (
    <div className="notifications-container">
      <header className="notifications-page-header">
        <div className="header-content">
          <h1>🔔 Notifications</h1>
          <p>Stay updated with your activity</p>
        </div>
        <div className="header-actions">
          {unreadCount > 0 && (
            <button className="mark-all-btn" onClick={markAllAsRead}>
              ✓ Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button className="clear-btn" onClick={clearAll}>
              🗑️ Clear all
            </button>
          )}
        </div>
      </header>

      <div className="notifications-tabs">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button 
          className={`tab ${activeTab === 'unread' ? 'active' : ''}`}
          onClick={() => setActiveTab('unread')}
        >
          Unread
          {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
        </button>
        <button 
          className={`tab ${activeTab === 'achievement' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievement')}
        >
          Achievements
        </button>
        <button 
          className={`tab ${activeTab === 'challenge' ? 'active' : ''}`}
          onClick={() => setActiveTab('challenge')}
        >
          Challenges
        </button>
        <button 
          className={`tab ${activeTab === 'collaboration' ? 'active' : ''}`}
          onClick={() => setActiveTab('collaboration')}
        >
          Collabs
        </button>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.read ? '' : 'unread'}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="notification-icon" style={{
                background: notification.type === 'achievement' ? '#fff3cd' :
                           notification.type === 'challenge' ? '#d4edda' :
                           notification.type === 'collaboration' ? '#cce5ff' :
                           notification.type === 'course' ? '#f8d7da' :
                           '#e2e3e5'
              }}>
                {notification.icon}
              </div>
              <div className="notification-content">
                <div className="notification-header">
                  <h4>{notification.title}</h4>
                  <span className="notification-time">{notification.time}</span>
                </div>
                <p className="notification-message">{notification.message}</p>
              </div>
              <div className="notification-actions">
                {!notification.read && <span className="unread-dot"></span>}
                <button 
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNotification(notification.id)
                  }}
                  title="Delete"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <span className="empty-icon">🔔</span>
            <h3>No notifications</h3>
            <p>
              {activeTab === 'unread' 
                ? 'You\'re all caught up!' 
                : 'No notifications yet'}
            </p>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="notification-settings">
        <h3>⚙️ Notification Settings</h3>
        <div className="settings-grid">
          <div className="setting-item">
            <label className="toggle-label">
              <span>Push Notifications</span>
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <label className="toggle-label">
              <span>Email Notifications</span>
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <label className="toggle-label">
              <span>Achievement Alerts</span>
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <label className="toggle-label">
              <span>Challenge Reminders</span>
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <label className="toggle-label">
              <span>Collaboration Invites</span>
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <label className="toggle-label">
              <span>Weekly Digest</span>
              <input type="checkbox" />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

