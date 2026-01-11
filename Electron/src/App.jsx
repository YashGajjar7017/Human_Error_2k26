import { useState, useEffect, createContext, useContext } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import OTP from './pages/OTP'
import Dashboard from './pages/Dashboard'
import ForgotPassword from './pages/ForgotPassword'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'
import './App.css'

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

// Protected Route Component
function ProtectedRoute({ children }) {
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

  return children
}

// Public Route Component (redirects to dashboard if already logged in)
function PublicRoute({ children }) {
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

  return children
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
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login onSuccess={handleLoginWithNavigation} />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/otp"
          element={<OTP />}
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings user={user} />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
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
