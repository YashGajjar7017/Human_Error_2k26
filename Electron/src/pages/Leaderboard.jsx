import { useState } from 'react'
import '../styles/SharedComponents.css'

export default function Leaderboard() {
  const [timeRange, setTimeRange] = useState('all')
  const [category, setCategory] = useState('overall')

  const leaderboardData = [
    {
      id: 1,
      rank: 1,
      name: 'Alex Chen',
      avatar: 'AC',
      points: 15420,
      challenges: 245,
      streak: 45,
      level: 42,
      badge: '👑'
    },
    {
      id: 2,
      rank: 2,
      name: 'Sarah Johnson',
      avatar: 'SJ',
      points: 14850,
      challenges: 230,
      streak: 38,
      level: 40,
      badge: '🥈'
    },
    {
      id: 3,
      rank: 3,
      name: 'Mike Williams',
      avatar: 'MW',
      points: 13200,
      challenges: 210,
      streak: 32,
      level: 38,
      badge: '🥉'
    },
    {
      id: 4,
      rank: 4,
      name: 'Emily Davis',
      avatar: 'ED',
      points: 12800,
      challenges: 195,
      streak: 28,
      level: 36,
      badge: null
    },
    {
      id: 5,
      rank: 5,
      name: 'David Park',
      avatar: 'DP',
      points: 11500,
      challenges: 180,
      streak: 25,
      level: 34,
      badge: null
    },
    {
      id: 6,
      rank: 6,
      name: 'Lisa Wang',
      avatar: 'LW',
      points: 10800,
      challenges: 170,
      streak: 21,
      level: 32,
      badge: null
    },
    {
      id: 7,
      rank: 7,
      name: 'James Lee',
      avatar: 'JL',
      points: 10200,
      challenges: 165,
      streak: 19,
      level: 31,
      badge: null
    },
    {
      id: 8,
      rank: 8,
      name: 'Rachel Kim',
      avatar: 'RK',
      points: 9800,
      challenges: 155,
      streak: 18,
      level: 30,
      badge: null
    },
    {
      id: 9,
      rank: 9,
      name: 'Tom Brown',
      avatar: 'TB',
      points: 9200,
      challenges: 145,
      streak: 15,
      level: 28,
      badge: null
    },
    {
      id: 10,
      rank: 10,
      name: 'Anna Martinez',
      avatar: 'AM',
      points: 8700,
      challenges: 138,
      streak: 14,
      level: 27,
      badge: null
    }
  ]

  const yourRank = {
    rank: 42,
    name: 'You',
    avatar: 'ME',
    points: 2450,
    challenges: 87,
    streak: 12,
    level: 15
  }

  const categories = [
    { id: 'overall', name: '🏆 Overall', icon: '🏆' },
    { id: 'weekly', name: '📅 This Week', icon: '📅' },
    { id: 'monthly', name: '🗓️ This Month', icon: '🗓️' },
    { id: 'challenges', name: '🎯 Challenges', icon: '🎯' },
    { id: 'streak', name: '🔥 Streak', icon: '🔥' },
    { id: 'collaboration', name: '🤝 Collaboration', icon: '🤝' }
  ]

  const filteredData = leaderboardData.filter(user => {
    // In real app, filter based on timeRange and category
    return true
  })

  return (
    <div className="leaderboard-container">
      <header className="leaderboard-header">
        <div className="header-content">
          <h1>🏆 Leaderboard</h1>
          <p>See how you rank against other developers</p>
        </div>
        <div className="header-filters">
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="category-select"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-select"
          >
            <option value="all">All Time</option>
            <option value="year">This Year</option>
            <option value="month">This Month</option>
            <option value="week">This Week</option>
          </select>
        </div>
      </header>

      {/* Your Rank Card */}
      <div className="your-rank-card">
        <div className="your-rank-info">
          <span className="your-rank-label">Your Position</span>
          <span className="your-rank-number">#{yourRank.rank}</span>
        </div>
        <div className="your-user">
          <div className="user-avatar">{yourRank.avatar}</div>
          <div className="user-info">
            <span className="user-name">{yourRank.name}</span>
            <span className="user-level">Level {yourRank.level}</span>
          </div>
        </div>
        <div className="your-stats">
          <div className="stat">
            <span className="stat-value">{yourRank.points.toLocaleString()}</span>
            <span className="stat-label">Points</span>
          </div>
          <div className="stat">
            <span className="stat-value">{yourRank.challenges}</span>
            <span className="stat-label">Challenges</span>
          </div>
          <div className="stat">
            <span className="stat-value">{yourRank.streak}</span>
            <span className="stat-label">Day Streak</span>
          </div>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="podium">
        {[1, 0, 2].map((index) => {
          const user = filteredData[index]
          const height = index === 1 ? 140 : index === 0 ? 120 : 100
          return (
            <div key={user.id} className={`podium-item podium-${index + 1}`}>
              <div className="podium-avatar">{user.avatar}</div>
              <div className="podium-name">{user.name}</div>
              <div className="podium-bar" style={{ height: `${height}px` }}>
                <span className="podium-points">{user.points.toLocaleString()} pts</span>
              </div>
              <div className="podium-rank">{index + 1}</div>
            </div>
          )
        })}
      </div>

      {/* Main Leaderboard List */}
      <div className="leaderboard-list">
        {filteredData.slice(3).map((user, index) => (
          <div key={user.id} className="leaderboard-item">
            <div className="leaderboard-rank">{user.rank}</div>
            <div className="leaderboard-user">
              <div className="leaderboard-avatar">{user.avatar}</div>
              <div className="leaderboard-info">
                <h4>{user.name}</h4>
                <p>Level {user.level} • {user.streak} day streak</p>
              </div>
            </div>
            <div className="leaderboard-details">
              <span className="detail-item">
                <span className="detail-icon">🎯</span>
                {user.challenges}
              </span>
              <span className="detail-item">
                <span className="detail-icon">🔥</span>
                {user.streak}
              </span>
            </div>
            <div className="leaderboard-score">
              <span className="leaderboard-points">{user.points.toLocaleString()}</span>
              <span className="leaderboard-label">points</span>
            </div>
          </div>
        ))}
      </div>

      {/* Achievements Section */}
      <div className="top-achievements">
        <h3>🏅 Top Achievers This Month</h3>
        <div className="achievements-list">
          <div className="achievement-winner">
            <span className="winner-badge">🥇</span>
            <span className="winner-name">Sarah Johnson</span>
            <span className="winner-stat">12 badges</span>
          </div>
          <div className="achievement-winner">
            <span className="winner-badge">🥈</span>
            <span className="winner-name">Mike Williams</span>
            <span className="winner-stat">10 badges</span>
          </div>
          <div className="achievement-winner">
            <span className="winner-badge">🥉</span>
            <span className="winner-name">Emily Davis</span>
            <span className="winner-stat">9 badges</span>
          </div>
        </div>
      </div>
    </div>
  )
}

