import { useState } from 'react'
import '../styles/SharedComponents.css'

export default function Achievements({ user }) {
  const [activeTab, setActiveTab] = useState('all')
  const [filter, setFilter] = useState('all')

  const achievements = [
    {
      id: 1,
      icon: '🌟',
      title: 'First Steps',
      description: 'Complete your first coding challenge',
      progress: 100,
      unlocked: true,
      date: '2024-01-15'
    },
    {
      id: 2,
      icon: '🔥',
      title: 'On Fire',
      description: 'Complete 10 challenges in a row',
      progress: 100,
      unlocked: true,
      date: '2024-01-20'
    },
    {
      id: 3,
      icon: '🐛',
      title: 'Bug Hunter',
      description: 'Find and report 5 bugs',
      progress: 60,
      unlocked: false,
      target: 5,
      current: 3
    },
    {
      id: 4,
      icon: '💻',
      title: 'Code Master',
      description: 'Write 1000 lines of code',
      progress: 45,
      unlocked: false,
      target: 1000,
      current: 450
    },
    {
      id: 5,
      icon: '🎯',
      title: 'Sharpshooter',
      description: 'Solve a challenge without hints',
      progress: 100,
      unlocked: true,
      date: '2024-02-01'
    },
    {
      id: 6,
      icon: '🤝',
      title: 'Team Player',
      description: 'Collaborate on 5 projects',
      progress: 80,
      unlocked: false,
      target: 5,
      current: 4
    },
    {
      id: 7,
      icon: '⚡',
      title: 'Speed Demon',
      description: 'Complete a challenge in under 5 minutes',
      progress: 100,
      unlocked: true,
      date: '2024-02-10'
    },
    {
      id: 8,
      icon: '🏆',
      title: 'Champion',
      description: 'Win a coding competition',
      progress: 0,
      unlocked: false,
      target: 1,
      current: 0
    },
    {
      id: 9,
      icon: '📚',
      title: 'Bookworm',
      description: 'Complete 5 learning modules',
      progress: 100,
      unlocked: true,
      date: '2024-02-15'
    },
    {
      id: 10,
      icon: '🎨',
      title: 'Artist',
      description: 'Create a beautiful UI component',
      progress: 100,
      unlocked: true,
      date: '2024-02-20'
    },
    {
      id: 11,
      icon: '🚀',
      title: 'Early Bird',
      description: 'Log in 7 days in a row',
      progress: 100,
      unlocked: true,
      date: '2024-03-01'
    },
    {
      id: 12,
      icon: '💎',
      title: 'Diamond',
      description: 'Reach level 50',
      progress: 72,
      unlocked: false,
      target: 50,
      current: 36
    }
  ]

  const stats = {
    total: achievements.length,
    unlocked: achievements.filter(a => a.unlocked).length,
    points: 2450,
    streak: 7,
    rank: 42
  }

  const filteredAchievements = achievements.filter(a => {
    if (filter === 'all') return true
    if (filter === 'unlocked') return a.unlocked
    if (filter === 'locked') return !a.unlocked
    return true
  })

  return (
    <div className="achievements-container">
      <header className="achievements-header">
        <div className="header-content">
          <h1>🏆 Achievements</h1>
          <p>Track your progress and earn badges</p>
        </div>
        <div className="stats-cards">
          <div className="stat-card">
            <span className="stat-icon">🏅</span>
            <span className="stat-value">{stats.unlocked}/{stats.total}</span>
            <span className="stat-label">Unlocked</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">⭐</span>
            <span className="stat-value">{stats.points.toLocaleString()}</span>
            <span className="stat-label">Points</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🔥</span>
            <span className="stat-value">{stats.streak}</span>
            <span className="stat-label">Day Streak</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📊</span>
            <span className="stat-value">#{stats.rank}</span>
            <span className="stat-label">Rank</span>
          </div>
        </div>
      </header>

      <div className="achievements-content">
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Achievements
          </button>
          <button 
            className={`tab ${activeTab === 'recent' ? 'active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            Recent
          </button>
          <button 
            className={`tab ${activeTab === 'badges' ? 'active' : ''}`}
            onClick={() => setActiveTab('badges')}
          >
            Badges
          </button>
        </div>

        <div className="filter-bar">
          <span className="filter-label">Filter:</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="unlocked">Unlocked</option>
            <option value="locked">Locked</option>
          </select>
        </div>

        <div className="achievements-grid">
          {filteredAchievements.map(achievement => (
            <div 
              key={achievement.id} 
              className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-icon">
                {achievement.icon}
              </div>
              <h3 className="achievement-title">{achievement.title}</h3>
              <p className="achievement-description">{achievement.description}</p>
              <div className="achievement-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${achievement.progress}%` }}
                  />
                </div>
                <span className="achievement-percent">
                  {achievement.progress}%
                </span>
              </div>
              {achievement.unlocked && achievement.date && (
                <span className="achievement-date">
                  ✨ Unlocked on {achievement.date}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

