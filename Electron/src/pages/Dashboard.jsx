import { useNavigate } from 'react-router-dom'
import '../styles/Dashboard.css'

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Human Error Dashboard</h1>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-card">
          <h2>Welcome, {user?.firstName || 'User'}!</h2>
          <p>You're logged in to the Human Error Desktop Application</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <h3>Code Compiler</h3>
            <p>Write, compile and execute code in multiple languages</p>
          </div>

          <div className="feature-card">
            <h3>Collaboration</h3>
            <p>Work together with other developers in real-time</p>
          </div>

          <div className="feature-card">
            <h3>Learning Path</h3>
            <p>Follow structured courses and improve your skills</p>
          </div>

          <div className="feature-card">
            <h3>Achievements</h3>
            <p>Track your progress and earn badges</p>
          </div>
        </div>
      </main>
    </div>
  )
}
