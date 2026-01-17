import { useState, useEffect } from 'react'
import '../styles/SharedComponents.css'

export default function Classroom() {
  const [activeTab, setActiveTab] = useState('courses')
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [visibleCards, setVisibleCards] = useState([])
  const [animateProgress, setAnimateProgress] = useState({})

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

  // Animation on mount
  useEffect(() => {
    // Stagger course card entrance
    courses.forEach((_, index) => {
      setTimeout(() => {
        setVisibleCards(prev => [...prev, index])
      }, index * 100)
    })

    // Animate progress bars with delay
    courses.forEach((course, index) => {
      setTimeout(() => {
        setAnimateProgress(prev => ({ ...prev, [course.id]: true }))
      }, 500 + index * 100)
    })
  }, [])

  return (
    <div className="classroom-container">
      <header className="classroom-header">
        <div className="header-content">
          <h1 className="animate-fade-in-up">📚 Learning Classroom</h1>
          <p className="animate-fade-in-up delay-1">Structured courses to improve your coding skills</p>
        </div>
        <div className="header-stats animate-fade-in-up delay-2">
          <div className="stat stat-bounce">
            <span className="stat-value">{courses.length}</span>
            <span className="stat-label">Courses</span>
          </div>
          <div className="stat stat-bounce delay-1">
            <span className="stat-value">{courses.reduce((acc, c) => acc + c.totalLessons, 0)}</span>
            <span className="stat-label">Lessons</span>
          </div>
          <div className="stat stat-bounce delay-2">
            <span className="stat-value">{achievements.filter(a => a.earned).length}</span>
            <span className="stat-label">Certificates</span>
          </div>
        </div>
      </header>

      <div className="classroom-tabs">
        <button 
          className={`tab animate-fade-in-up delay-1 ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          📖 My Courses
        </button>
        <button 
          className={`tab animate-fade-in-up delay-2 ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          📅 Upcoming
        </button>
        <button 
          className={`tab animate-fade-in-up delay-3 ${activeTab === 'certificates' ? 'active' : ''}`}
          onClick={() => setActiveTab('certificates')}
        >
          🎓 Certificates
        </button>
      </div>

      <div className="classroom-content">
        {activeTab === 'courses' && (
          <>
            <div className="courses-grid">
              {courses.map((course, index) => (
                <div 
                  key={course.id} 
                  className={`course-card ${visibleCards.includes(index) ? 'animate-card-enter' : ''}`}
                  onClick={() => setSelectedCourse(course)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="course-icon animate-icon-bounce">{course.icon}</div>
                  <div className="course-info">
                    <span className={`course-level ${course.level.toLowerCase()} animate-level-pop`}>
                      {course.level}
                    </span>
                    <h3 className="animate-text-slide">{course.title}</h3>
                    <p className="animate-text-slide delay-1">{course.description}</p>
                    <div className="course-meta animate-fade-in delay-2">
                      <span>👨‍🏫 {course.instructor}</span>
                      <span>⏱️ {course.duration}</span>
                    </div>
                  </div>
                  <div className="course-progress animate-progress-expand">
                    <div className="progress-info">
                      <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                      <span className="progress-percent">{animateProgress[course.id] ? `${course.progress}%` : '0%'}</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${animateProgress[course.id] ? 'animate-progress-fill' : ''}`}
                        style={{ width: animateProgress[course.id] ? `${course.progress}%` : '0%' }}
                      />
                    </div>
                  </div>
                  <button className="continue-btn animate-btn-pop">
                    {course.progress === 0 ? 'Start Course' : 'Continue Learning'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'upcoming' && (
          <div className="upcoming-section animate-fade-in">
            <h3 className="animate-slide-in-left">📅 Scheduled Lessons</h3>
            <div className="upcoming-list">
              {upcomingLessons.map((lesson, index) => (
                <div 
                  key={lesson.id} 
                  className="upcoming-item animate-slide-in-left"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="upcoming-time">
                    <span className="date animate-bounce">{lesson.time.split(',')[0]}</span>
                    <span className="clock animate-bounce delay-1">{lesson.time.split(',')[1]}</span>
                  </div>
                  <div className="upcoming-info">
                    <h4 className="animate-text-slide">{lesson.title}</h4>
                    <p className="animate-text-slide delay-1">{lesson.course} • {lesson.instructor}</p>
                  </div>
                  <button className="join-class-btn animate-btn-pop">Join Class</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'certificates' && (
          <div className="certificates-section animate-fade-in">
            <h3 className="animate-slide-in-left">🎓 Your Certificates</h3>
            <div className="certificates-grid">
              {courses.filter(c => c.progress >= 100).slice(0, 3).map((course, index) => (
                <div 
                  key={course.id} 
                  className="certificate-card animate-card-enter"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <div className="cert-badge animate-icon-rotate">{course.icon}</div>
                  <h4 className="animate-text-slide">{course.title}</h4>
                  <p className="animate-text-slide delay-1">Completed on Jan {20 + index * 5}, 2024</p>
                  <button className="download-btn animate-btn-pop">⬇️ Download</button>
                </div>
              ))}
              {/* Mock certificates for display */}
              <div className="certificate-card animate-card-enter" style={{ animationDelay: '0.3s' }}>
                <div className="cert-badge animate-icon-rotate">⚛️</div>
                <h4 className="animate-text-slide">React Pro</h4>
                <p className="animate-text-slide delay-1">Completed on Feb 10, 2024</p>
                <button className="download-btn animate-btn-pop">⬇️ Download</button>
              </div>
              <div className="certificate-card animate-card-enter" style={{ animationDelay: '0.45s' }}>
                <div className="cert-badge animate-icon-rotate">🐍</div>
                <h4 className="animate-text-slide">Python Starter</h4>
                <p className="animate-text-slide delay-1">Completed on Feb 25, 2024</p>
                <button className="download-btn animate-btn-pop">⬇️ Download</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <>
          <div className="modal-overlay animate-fade-in" onClick={() => setSelectedCourse(null)} />
          <div className="modal-content course-detail-modal animate-modal-pop">
            <button className="close-btn animate-btn-pop" onClick={() => setSelectedCourse(null)}>✕</button>
            <div className="course-detail-header">
              <span className="course-icon-large animate-icon-bounce">{selectedCourse.icon}</span>
              <div>
                <h2 className="animate-text-slide">{selectedCourse.title}</h2>
                <p className="animate-text-slide delay-1">{selectedCourse.description}</p>
              </div>
            </div>
            <div className="course-stats">
              <div className="stat-item animate-scale-in" style={{ animationDelay: '0.1s' }}>
                <span className="stat-icon">📖</span>
                <span className="stat-value">{selectedCourse.totalLessons}</span>
                <span className="stat-label">Lessons</span>
              </div>
              <div className="stat-item animate-scale-in" style={{ animationDelay: '0.15s' }}>
                <span className="stat-icon">⏱️</span>
                <span className="stat-value">{selectedCourse.duration}</span>
                <span className="stat-label">Duration</span>
              </div>
              <div className="stat-item animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <span className="stat-icon">📊</span>
                <span className="stat-value">{selectedCourse.level}</span>
                <span className="stat-label">Level</span>
              </div>
              <div className="stat-item animate-scale-in" style={{ animationDelay: '0.25s' }}>
                <span className="stat-icon">👨‍🏫</span>
                <span className="stat-value">{selectedCourse.instructor}</span>
                <span className="stat-label">Instructor</span>
              </div>
            </div>
            <div className="course-curriculum animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <h4>Course Curriculum</h4>
              <div className="curriculum-list">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div key={num} className={`curriculum-item ${num <= Math.floor(selectedCourse.progress / 20) ? 'completed animate-item-check' : 'animate-item-unchecked'}`}>
                    <span className="lesson-number">{num}</span>
                    <span className="lesson-title">Lesson {num}: {num === 1 ? 'Introduction' : num === 2 ? 'Core Concepts' : num === 3 ? 'Hands-on Practice' : num === 4 ? 'Advanced Topics' : 'Final Project'}</span>
                    <span className="lesson-status">{num <= Math.floor(selectedCourse.progress / 20) ? '✓' : '○'}</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="btn-primary continue-learning-btn animate-btn-pop">
              {selectedCourse.progress === 0 ? 'Start Learning' : 'Continue Learning'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

