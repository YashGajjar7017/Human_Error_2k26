import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import OTP from './pages/OTP'
import Dashboard from './pages/Dashboard'
import './App.css'

export default function App() {
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
          const response = await window.electronAPI.callAPI('GET', '/api/auth/verify', null)
          if (response.success) {
            setIsLoggedIn(true)
            setUser(response.data.user)
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
        <Route 
          path="/" 
          element={isLoggedIn ? <Dashboard user={user} onLogout={handleLogout} /> : <Login onSuccess={handleLogin} />} 
        />
        <Route 
          path="/login" 
          element={<Login onSuccess={handleLogin} />} 
        />
        <Route 
          path="/signup" 
          element={<Signup />} 
        />
        <Route 
          path="/otp" 
          element={<OTP />} 
        />
        <Route 
          path="/dashboard" 
          element={<Dashboard user={user} onLogout={handleLogout} />} 
        />
        <Route 
          path="*" 
          element={<div className="not-found">Page not found</div>} 
        />
      </Routes>
    </div>
  )
}
