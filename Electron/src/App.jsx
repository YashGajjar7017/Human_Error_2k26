import { useState, useEffect, createContext, useContext, Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import './App.css'
import './styles/Theme.css'
import './styles/SharedComponents.css'

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const OTP = lazy(() => import('./pages/OTP'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Help = lazy(() => import('./pages/Help'))
const About = lazy(() => import('./pages/About'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))

// New pages
const Compiler = lazy(() => import('./pages/Compiler'))
const Achievements = lazy(() => import('./pages/Achievements'))
const Collaboration = lazy(() => import('./pages/Collaboration'))
const Classroom = lazy(() => import('./pages/Classroom'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Snippets = lazy(() => import('./pages/Snippets'))
const Notifications = lazy(() => import('./pages/Notifications'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const Admin = lazy(() => import('./pages/Admin'))

// Auth Context
const AuthContext = createContext(null)

// Auth Provider Component
export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken')
        if (token) {
          // Verify token with backend
          const response = await window.electronAPI.callAPI('GET', '/api/auth/me', null)
          if (response.success && response.data) {
            setIsLoggedIn(true)
            setUser(response.data)
          } else {
            // Token might be invalid, clear it
            localStorage.removeItem('authToken')
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogin = (userData, token) => {
    setUser(userData)
    setIsLoggedIn(true)
    localStorage.setItem('authToken', token)
  }

  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem('authToken')
    localStorage.removeItem('verifiedEmail')
  }

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }))
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, loading, handleLogin, handleLogout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Page Transition Wrapper Component
function PageTransition({ children, animation = 'fadeInUp' }) {
  const animations = {
    fadeInUp: 'page-transition-fadeInUp',
    fadeIn: 'page-transition-fadeIn',
    slideInLeft: 'page-transition-slideInLeft',
    slideInRight: 'page-transition-slideInRight',
    scaleIn: 'page-transition-scaleIn',
    bounceIn: 'page-transition-bounceIn'
  }

  return (
    <div className={`page-transition ${animations[animation] || animations.fadeInUp}`}>
      {children}
    </div>
  )
}

// Loading Fallback Component
function PageLoading() {
  return (
    <div className="page-loading">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  )
}

// Protected Route Component
function ProtectedRoute({ children, animation = 'fadeInUp' }) {
  const { isLoggedIn, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Human Error...</p>
      </div>
    )
  }

  if (!isLoggedIn) {
    // Redirect to login while saving the current location
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <PageTransition animation={animation}>
      {children}
    </PageTransition>
  )
}

// Public Route Component (redirects to dashboard if already logged in)
function PublicRoute({ children, animation = 'fadeInUp' }) {
  const { isLoggedIn, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Human Error...</p>
      </div>
    )
  }

  if (isLoggedIn) {
    // Redirect to dashboard
    return <Navigate to="/dashboard" state={{ from: location }} replace />
  }

  return (
    <PageTransition animation={animation}>
      {children}
    </PageTransition>
  )
}

// Home Route - redirects to dashboard if logged in, login if not
function HomeRoute() {
  const { isLoggedIn, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Human Error...</p>
      </div>
    )
  }

  return isLoggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
}

function App() {
  const { isLoggedIn, user, loading, handleLogin, handleLogout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Custom login handler that also navigates
  const handleLoginWithNavigation = (userData, token) => {
    handleLogin(userData, token)
    const from = location.state?.from?.pathname || '/dashboard'
    navigate(from, { replace: true })
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Human Error...</p>
      </div>
    )
  }

  return (
    <div className="app">
      <Suspense fallback={<PageLoading />}>
        <Routes>
          {/* Home Route - redirects based on auth state */}
          <Route path="/" element={<HomeRoute />} />
          <Route path="/home" element={<HomeRoute />} />

          {/* Public Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute animation="slideInRight">
                <Login onSuccess={handleLoginWithNavigation} />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute animation="slideInLeft">
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path="/otp"
            element={
              <PublicRoute animation="scaleIn">
                <OTP />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute animation="slideInRight">
                <ForgotPassword />
              </PublicRoute>
            }
          />

          {/* Info Pages (Public) */}
          <Route
            path="/help"
            element={
              <PublicRoute animation="fadeInUp">
                <Help />
              </PublicRoute>
            }
          />
          <Route
            path="/about"
            element={
              <PublicRoute animation="fadeInUp">
                <About />
              </PublicRoute>
            }
          />
          <Route
            path="/privacy"
            element={
              <PublicRoute animation="fadeInUp">
                <Privacy />
              </PublicRoute>
            }
          />
          <Route
            path="/terms"
            element={
              <PublicRoute animation="fadeInUp">
                <Terms />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute animation="fadeInUp">
                <Dashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute animation="slideInLeft">
                <Profile user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute animation="slideInRight">
                <Settings user={user} />
              </ProtectedRoute>
            }
          />

          {/* New Feature Routes */}
          <Route
            path="/compiler"
            element={
              <ProtectedRoute animation="fadeInUp">
                <Compiler />
              </ProtectedRoute>
            }
          />
          <Route
            path="/achievements"
            element={
              <ProtectedRoute animation="fadeInUp">
                <Achievements user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collaboration"
            element={
              <ProtectedRoute animation="fadeInUp">
                <Collaboration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classroom"
            element={
              <ProtectedRoute animation="fadeInUp">
                <Classroom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute animation="fadeInUp">
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/snippets"
            element={
              <ProtectedRoute animation="fadeInUp">
                <Snippets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute animation="fadeInUp">
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute animation="fadeInUp">
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute animation="fadeInUp">
                <Admin />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  )
}

// Wrap App with AuthProvider
export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  )
}

