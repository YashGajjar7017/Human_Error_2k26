import { useState } from 'react'
import '../styles/SharedComponents.css'

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('week')
  const [activeTab, setActiveTab] = useState('overview')

  const stats = {
    totalCode: 15420,
    linesPerDay: 245,
    challengesCompleted: 87,
    streakDays: 12,
    avgScore: 85.4,
    rank: 156
  }

  const weeklyData = [
    { day: 'Mon', lines: 320, challenges: 5 },
    { day: 'Tue', lines: 280, challenges: 3 },
    { day: 'Wed', lines: 410, challenges: 7 },
    { day: 'Thu', lines: 195, challenges: 2 },
    { day: 'Fri', lines: 350, challenges: 6 },
    { day: 'Sat', lines: 480, challenges: 8 },
    { day: 'Sun', lines: 290, challenges: 4 }
  ]

  const languageStats = [
    { name: 'JavaScript', lines: 8540, percentage: 55, color: '#f7df1e' },
    { name: 'Python', lines: 3240, percentage: 21, color: '#3776ab' },
    { name: 'TypeScript', lines: 2150, percentage: 14, color: '#3178c6' },
    { name: 'HTML/CSS', lines: 980, percentage: 6, color: '#e34c26' },
    { name: 'Other', lines: 510, percentage: 4, color: '#888' }
  ]

  const achievements = [
    { name: 'First Steps', date: 'Jan 15, 2024' },
    { name: 'Code Master', date: 'Jan 28, 2024' },
    { name: 'Speed Demon', date: 'Feb 10, 2024' },
    { name: 'Bug Hunter', date: 'Feb 22, 2024' }
  ]

  const activityHeatmap = [
    [2, 5, 3, 1, 4, 2, 0],
    [3, 4, 6, 2, 5, 3, 1],
    [1, 3, 4, 5, 2, 4, 2],
    [4, 2, 3, 4, 6, 3, 1],
    [2, 5, 4, 3, 4, 5, 2],
    [3, 4, 5, 6, 3, 4, 1],
    [1, 2, 3, 4, 5, 2, 0]
  ]

  const recentActivity = [
    { type: 'code', description: 'Committed 245 lines to React-Project', time: '2 hours ago' },
    { type: 'challenge', description: 'Completed "Array Reverse" challenge', time: '3 hours ago' },
    { type: 'achievement', description: 'Earned "Speed Demon" badge', time: '5 hours ago' },
    { type: 'course', description: 'Finished "React Hooks" lesson', time: '6 hours ago' },
    { type: 'code', description: 'Committed 180 lines to Python-Script', time: 'Yesterday' }
  ]

  return (
    <div className="analytics-container">
      <header className="analytics-header">
        <div className="header-content">
          <h1>📊 Analytics Dashboard</h1>
          <p>Track your coding journey and progress</p>
        </div>
        <div className="time-selector">
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </header>

      <div className="analytics-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Activity
        </button>
        <button 
          className={`tab ${activeTab === 'languages' ? 'active' : ''}`}
          onClick={() => setActiveTab('languages')}
        >
          Languages
        </button>
        <button 
          className={`tab ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          Achievements
        </button>
      </div>

      <div className="analytics-content">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💻</div>
            <div className="stat-info">
              <span className="stat-value">{stats.totalCode.toLocaleString()}</span>
              <span className="stat-label">Total Lines Written</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <span className="stat-value">{stats.linesPerDay}</span>
              <span className="stat-label">Lines/Day (Avg)</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-info">
              <span className="stat-value">{stats.challengesCompleted}</span>
              <span className="stat-label">Challenges Completed</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-info">
              <span className="stat-value">{stats.streakDays}</span>
              <span className="stat-label">Day Streak</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-info">
              <span className="stat-value">{stats.avgScore}%</span>
              <span className="stat-label">Average Score</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-info">
              <span className="stat-value">#{stats.rank}</span>
              <span className="stat-label">Global Rank</span>
            </div>
          </div>
        </div>

        <div className="charts-row">
          {/* Weekly Activity Chart */}
          <div className="chart-card">
            <h3>📅 Weekly Activity</h3>
            <div className="bar-chart">
              {weeklyData.map((data, index) => (
                <div key={index} className="bar-item">
                  <div className="bar-wrapper">
                    <div 
                      className="bar lines-bar" 
                      style={{ height: `${(data.lines / 500) * 100}%` }}
                      title={`${data.lines} lines`}
                    />
                    <div 
                      className="bar challenges-bar" 
                      style={{ height: `${(data.challenges / 10) * 100}%` }}
                      title={`${data.challenges} challenges`}
                    />
                  </div>
                  <span className="bar-label">{data.day}</span>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <span className="legend-item"><span className="legend-color lines"></span> Lines of Code</span>
              <span className="legend-item"><span className="legend-color challenges"></span> Challenges</span>
            </div>
          </div>

          {/* Language Distribution */}
          <div className="chart-card">
            <h3>🌐 Language Distribution</h3>
            <div className="language-bars">
              {languageStats.map((lang, index) => (
                <div key={index} className="language-item">
                  <div className="language-info">
                    <span className="language-name">{lang.name}</span>
                    <span className="language-lines">{lang.lines.toLocaleString()} lines</span>
                  </div>
                  <div className="language-bar-wrapper">
                    <div 
                      className="language-bar" 
                      style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
                    />
                  </div>
                  <span className="language-percent">{lang.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bottom-row">
          {/* Activity Heatmap */}
          <div className="heatmap-card">
            <h3>🗓️ Activity Heatmap (This Year)</h3>
            <div className="heatmap-grid">
              {activityHeatmap.map((week, weekIndex) => (
                <div key={weekIndex} className="heatmap-week">
                  {week.map((intensity, dayIndex) => (
                    <div 
                      key={dayIndex} 
                      className={`heatmap-cell intensity-${intensity}`}
                      title={`${intensity} contributions`}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="heatmap-legend">
              <span>Less</span>
              <div className="legend-cells">
                <div className="heatmap-cell intensity-0"></div>
                <div className="heatmap-cell intensity-1"></div>
                <div className="heatmap-cell intensity-2"></div>
                <div className="heatmap-cell intensity-3"></div>
                <div className="heatmap-cell intensity-4"></div>
                <div className="heatmap-cell intensity-5"></div>
                <div className="heatmap-cell intensity-6"></div>
              </div>
              <span>More</span>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="activity-card">
            <h3>📌 Recent Activity</h3>
            <div className="activity-timeline">
              {recentActivity.map((item, index) => (
                <div key={index} className="timeline-item">
                  <div className={`timeline-icon ${item.type}`}>
                    {item.type === 'code' && '💻'}
                    {item.type === 'challenge' && '🎯'}
                    {item.type === 'achievement' && '🏆'}
                    {item.type === 'course' && '📚'}
                  </div>
                  <div className="timeline-content">
                    <p>{item.description}</p>
                    <span className="timeline-time">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

