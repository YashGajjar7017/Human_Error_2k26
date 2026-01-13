import { useState } from 'react'
import '../styles/SharedComponents.css'

export default function Collaboration() {
  const [activeRoom, setActiveRoom] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')

  const rooms = [
    {
      id: 1,
      name: 'React Workshop',
      description: 'Building a todo app together',
      members: 5,
      maxMembers: 10,
      language: 'JavaScript',
      status: 'active',
      lastActive: '2 min ago'
    },
    {
      id: 2,
      name: 'Python Data Science',
      description: 'Exploring pandas and numpy',
      members: 3,
      maxMembers: 8,
      language: 'Python',
      status: 'active',
      lastActive: '5 min ago'
    },
    {
      id: 3,
      name: 'C++ Game Dev',
      description: 'Creating a 2D game engine',
      members: 2,
      maxMembers: 6,
      language: 'C++',
      status: 'idle',
      lastActive: '1 hour ago'
    },
    {
      id: 4,
      name: 'Algorithm Practice',
      description: 'Daily LeetCode session',
      members: 8,
      maxMembers: 12,
      language: 'Multi',
      status: 'active',
      lastActive: 'Just now'
    }
  ]

  const onlineUsers = [
    { id: 1, name: 'Alice Chen', avatar: 'AC', status: 'online', activity: 'Coding' },
    { id: 2, name: 'Bob Smith', avatar: 'BS', status: 'online', activity: 'Reviewing' },
    { id: 3, name: 'Carol Davis', avatar: 'CD', status: 'away', activity: 'Offline' },
    { id: 4, name: 'David Lee', avatar: 'DL', status: 'online', activity: 'Debugging' },
    { id: 5, name: 'Eva Wilson', avatar: 'EW', status: 'busy', activity: 'In a meeting' }
  ]

  const recentActivities = [
    { id: 1, user: 'Alice Chen', action: 'joined', room: 'React Workshop', time: '2 min ago' },
    { id: 2, user: 'Bob Smith', action: 'completed', task: 'Bug fix #123', time: '5 min ago' },
    { id: 3, user: 'Carol Davis', action: 'shared', file: 'utils.js', time: '10 min ago' },
    { id: 4, user: 'David Lee', action: 'commented on', task: 'Feature request', time: '15 min ago' }
  ]

  const handleCreateRoom = () => {
    if (newRoomName.trim()) {
      // In real app, call API to create room
      setShowCreateModal(false)
      setNewRoomName('')
    }
  }

  return (
    <div className="collaboration-container">
      <header className="collaboration-header">
        <div className="header-content">
          <h1>🤝 Collaboration Hub</h1>
          <p>Work together with developers in real-time</p>
        </div>
        <button 
          className="create-room-btn"
          onClick={() => setShowCreateModal(true)}
        >
          ➕ Create Room
        </button>
      </header>

      <div className="collaboration-main">
        <div className="col-left">
          <section className="online-users">
            <h3>👥 Online Now ({onlineUsers.filter(u => u.status === 'online').length})</h3>
            <div className="users-list">
              {onlineUsers.map(user => (
                <div key={user.id} className="user-item">
                  <div className="user-avatar">
                    <span>{user.avatar}</span>
                    <span className={`status-dot ${user.status}`}></span>
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user.name}</span>
                    <span className="user-activity">{user.activity}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="recent-activity">
            <h3>📋 Recent Activity</h3>
            <div className="activity-list">
              {recentActivities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <span className="activity-text">
                    <strong>{activity.user}</strong> {activity.action} 
                    {activity.room && <span className="highlight"> {activity.room}</span>}
                    {activity.task && <span className="highlight"> {activity.task}</span>}
                    {activity.file && <span className="highlight"> {activity.file}</span>}
                  </span>
                  <span className="activity-time">{activity.time}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="col-main">
          <div className="rooms-header">
            <h3>🚀 Active Rooms</h3>
            <div className="room-filters">
              <button className="filter-btn active">All</button>
              <button className="filter-btn">JavaScript</button>
              <button className="filter-btn">Python</button>
              <button className="filter-btn">C++</button>
            </div>
          </div>

          <div className="rooms-grid">
            {rooms.map(room => (
              <div 
                key={room.id} 
                className={`room-card ${room.status}`}
                onClick={() => setActiveRoom(room)}
              >
                <div className="room-header">
                  <h4>{room.name}</h4>
                  <span className={`status-badge ${room.status}`}>
                    {room.status === 'active' ? '● Live' : '○ Idle'}
                  </span>
                </div>
                <p className="room-description">{room.description}</p>
                <div className="room-meta">
                  <span className="room-language">📝 {room.language}</span>
                  <span className="room-members">
                    👥 {room.members}/{room.maxMembers}
                  </span>
                </div>
                <div className="room-footer">
                  <span className="last-active">🕐 {room.lastActive}</span>
                  <button className="join-btn">Join Room</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)} />
          <div className="modal-content">
            <h2>Create New Room</h2>
            <div className="form-group">
              <label>Room Name</label>
              <input
                type="text"
                className="theme-input"
                placeholder="Enter room name..."
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="theme-input"
                placeholder="What will you work on?"
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Programming Language</label>
              <select className="theme-input">
                <option>JavaScript</option>
                <option>Python</option>
                <option>Java</option>
                <option>C++</option>
                <option>Go</option>
                <option>Multi-language</option>
              </select>
            </div>
            <div className="form-group">
              <label>Max Members</label>
              <select className="theme-input">
                <option>2</option>
                <option>4</option>
                <option>6</option>
                <option>8</option>
                <option>10</option>
                <option>Unlimited</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleCreateRoom}>
                Create Room
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

