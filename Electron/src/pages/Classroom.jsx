import { useState } from 'react'
import '../styles/SharedComponents.css'

export default function Classroom() {
  const [activeTab, setActiveTab] = useState('courses')
  const [selectedCourse, setSelectedCourse] = useState(null)

  const courses = [
    {
      id: 1,
      title: 'JavaScript Fundamentals',
      description: 'Master the basics of JavaScript programming',
      icon: '🟨',
      progress: 75,
      totalLessons: 20,
      completedLessons: 15,
      duration: '8 hours',
      level: 'Beginner',
      instructor: 'Sarah Johnson'
    },
    {
      id: 2,
      title: 'React Complete Guide',
      description: 'Build modern web applications with React',
      icon: '⚛️',
      progress: 45,
      totalLessons: 35,
      completedLessons: 16,
      duration: '15 hours',
      level: 'Intermediate',
      instructor: 'Mike Chen'
    },
    {
      id: 3,
      title: 'Python for Data Science',
      description: 'Learn Python for data analysis and visualization',
      icon: '🐍',
      progress: 20,
      totalLessons: 25,
      completedLessons: 5,
      duration: '10 hours',
      level: 'Beginner',
      instructor: 'Emily Davis'
    },
    {
      id: 4,
      title: 'Node.js Backend Development',
      description: 'Create scalable server-side applications',
      icon: '🟢',
      progress: 0,
      totalLessons: 30,
      completedLessons: 0,
      duration: '12 hours',
      level: 'Intermediate',
      instructor: 'Alex Turner'
    },
    {
      id: 5,
      title: 'Algorithm & Data Structures',
      description: 'Master algorithms and data structures',
      icon: '📊',
      progress: 60,
      totalLessons: 40,
      completedLessons: 24,
      duration: '20 hours',
      level: 'Advanced',
      instructor: 'David Park'
    },
    {
      id: 6,
      title: 'TypeScript Mastery',
      description: 'Learn TypeScript for type-safe code',
      icon: '🔷',
      progress: 10,
      totalLessons: 18,
      completedLessons: 2,
      duration: '6 hours',
      level: 'Intermediate',
      instructor: 'Lisa Wang'
    }
  ]

  const upcomingLessons = [
    { id: 1, title: 'Promises and Async/Await', course: 'JavaScript Fundamentals', time: 'Today, 2:00 PM', instructor: 'Sarah Johnson' },
    { id: 2, title: 'React Hooks Deep Dive', course: 'React Complete Guide', time: 'Tomorrow, 10:00 AM', instructor: 'Mike Chen' },
    { id: 3, title: 'Pandas DataFrames', course: 'Python for Data Science', time: 'Tomorrow, 3:00 PM', instructor: 'Emily Davis' }
  ]

  const achievements = [
    { id: 1, icon: '🎓', title: 'JS Certified', earned: true },
    { id: 2, icon: '🌟', title: 'React Pro', earned: true },
    { id: 3, icon: '🐍', title: 'Python Starter', earned: true },
    { id: 4, icon: '🟢', title: 'Node Master', earned: false },
    { id: 5, icon: '📊', title: 'Algo Expert', earned: false },
    { id: 6, icon: '🔷', title: 'Type Hero', earned: false }
  ]

  return (
    <div className="classroom-container">
      <header className="classroom-header">
        <div className="header-content">
          <h1>📚 Learning Classroom</h1>
          <p>Structured courses to improve your coding skills</p>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">6</span>
            <span className="stat-label">Courses</span>
          </div>
          <div className="stat">
            <span className="stat-value">62</span>
            <span className="stat-label">Lessons</span>
          </div>
          <div className="stat">
            <span className="stat-value">3</span>
            <span className="stat-label">Certificates</span>
          </div>
        </div>
      </header>

      <div className="classroom-tabs">
        <button 
          className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          📖 My Courses
        </button>
        <button 
          className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          📅 Upcoming
        </button>
        <button 
          className={`tab ${activeTab === 'certificates' ? 'active' : ''}`}
          onClick={() => setActiveTab('certificates')}
        >
          🎓 Certificates
        </button>
      </div>

      <div className="classroom-content">
        {activeTab === 'courses' && (
          <>
            <div className="courses-grid">
              {courses.map(course => (
                <div 
                  key={course.id} 
                  className="course-card"
                  onClick={() => setSelectedCourse(course)}
                >
                  <div className="course-icon">{course.icon}</div>
                  <div className="course-info">
                    <span className={`course-level ${course.level.toLowerCase()}`}>
                      {course.level}
                    </span>
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <div className="course-meta">
                      <span>👨‍🏫 {course.instructor}</span>
                      <span>⏱️ {course.duration}</span>
                    </div>
                  </div>
                  <div className="course-progress">
                    <div className="progress-info">
                      <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                  <button className="continue-btn">
                    {course.progress === 0 ? 'Start Course' : 'Continue Learning'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'upcoming' && (
          <div className="upcoming-section">
            <h3>📅 Scheduled Lessons</h3>
            <div className="upcoming-list">
              {upcomingLessons.map(lesson => (
                <div key={lesson.id} className="upcoming-item">
                  <div className="upcoming-time">
                    <span className="date">{lesson.time.split(',')[0]}</span>
                    <span className="clock">{lesson.time.split(',')[1]}</span>
                  </div>
                  <div className="upcoming-info">
                    <h4>{lesson.title}</h4>
                    <p>{lesson.course} • {lesson.instructor}</p>
                  </div>
                  <button className="join-class-btn">Join Class</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'certificates' && (
          <div className="certificates-section">
            <h3>🎓 Your Certificates</h3>
            <div className="certificates-grid">
              <div className="certificate-card">
                <div className="cert-badge">🟨</div>
                <h4>JavaScript Fundamentals</h4>
                <p>Completed on Jan 20, 2024</p>
                <button className="download-btn">⬇️ Download</button>
              </div>
              <div className="certificate-card">
                <div className="cert-badge">⚛️</div>
                <h4>React Pro</h4>
                <p>Completed on Feb 10, 2024</p>
                <button className="download-btn">⬇️ Download</button>
              </div>
              <div className="certificate-card">
                <div className="cert-badge">🐍</div>
                <h4>Python Starter</h4>
                <p>Completed on Feb 25, 2024</p>
                <button className="download-btn">⬇️ Download</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <>
          <div className="modal-overlay" onClick={() => setSelectedCourse(null)} />
          <div className="modal-content course-detail-modal">
            <button className="close-btn" onClick={() => setSelectedCourse(null)}>✕</button>
            <div className="course-detail-header">
              <span className="course-icon-large">{selectedCourse.icon}</span>
              <div>
                <h2>{selectedCourse.title}</h2>
                <p>{selectedCourse.description}</p>
              </div>
            </div>
            <div className="course-stats">
              <div className="stat-item">
                <span className="stat-icon">📖</span>
                <span className="stat-value">{selectedCourse.totalLessons}</span>
                <span className="stat-label">Lessons</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">⏱️</span>
                <span className="stat-value">{selectedCourse.duration}</span>
                <span className="stat-label">Duration</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">📊</span>
                <span className="stat-value">{selectedCourse.level}</span>
                <span className="stat-label">Level</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">👨‍🏫</span>
                <span className="stat-value">{selectedCourse.instructor}</span>
                <span className="stat-label">Instructor</span>
              </div>
            </div>
            <div className="course-curriculum">
              <h4>Course Curriculum</h4>
              <div className="curriculum-list">
                {[1, 2, 3, 4, 5].map(num => (
                  <div key={num} className={`curriculum-item ${num <= Math.floor(selectedCourse.progress / 20) ? 'completed' : ''}`}>
                    <span className="lesson-number">{num}</span>
                    <span className="lesson-title">Lesson {num}: {num === 1 ? 'Introduction' : num === 2 ? 'Core Concepts' : num === 3 ? 'Hands-on Practice' : num === 4 ? 'Advanced Topics' : 'Final Project'}</span>
                    <span className="lesson-status">{num <= Math.floor(selectedCourse.progress / 20) ? '✓' : '○'}</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="btn-primary continue-learning-btn">
              {selectedCourse.progress === 0 ? 'Start Learning' : 'Continue Learning'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

