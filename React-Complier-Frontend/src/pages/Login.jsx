import React, { useState, useRef, useEffect } from 'react'
import LogBox from '../components/LogBox'

export default function Login(){
  const [username, setUsername] = useState('testuser')
  const [password, setPassword] = useState('testpass123')
  const [status, setStatus] = useState('Ready')
  const [logs, setLogs] = useState([ { text: 'Waiting for form submission...', error: false } ])
  const [loading, setLoading] = useState(false)
  const logRef = useRef(null)

  useEffect(()=>{
    addLog('✅ Page loaded, form handler attached')
    addLog('🎯 Frontend URL: ' + window.location.origin)
    addLog('📍 Backend target: http://localhost:8000')
  }, [])

  function addLog(text, isError = false){
    const entry = { text: `[${new Date().toLocaleTimeString()}] ${text}`, error: !!isError }
    setLogs(prev => [...prev, entry])
    // scroll - handled by CSS overflow
  }

  function validate(){
    if (!username || username.length < 3){ addLog('❌ Validation failed: username too short', true); setStatus('Validation failed'); return false }
    if (!password || password.length < 6){ addLog('❌ Validation failed: password too short', true); setStatus('Validation failed'); return false }
    addLog('✅ Validation passed')
    return true
  }

  async function handleSubmit(e){
    e.preventDefault()
    addLog('🔴 FORM SUBMIT EVENT TRIGGERED')
    addLog(`Username: ${username}`)
    addLog(`Password: ${password.replace(/./g,'*')}`)

    if (!validate()) return

    setLoading(true)
    setStatus('Sending request...')

    try{
      addLog('📤 Fetching to /api/login with POST')
      const payload = { username, password }
      addLog('📦 Payload: ' + JSON.stringify(payload))

      const resp = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      addLog(`📥 Response received: Status ${resp.status}`)
      const data = await resp.json()
      addLog('📄 Response body: ' + JSON.stringify(data))

      if (data.success){
        addLog('✅ Login successful!')
        setStatus('Login successful!')
        document.cookie = `token=${data.token}; path=/`;
        document.cookie = `username=${data.user.username}; path=/`;
        document.cookie = `role=${data.user.role}; path=/`;
        addLog('🍪 Cookies set')
      } else {
        addLog(`❌ Login failed: ${data.message}`, true)
        setStatus(`Failed: ${data.message}`)
      }
    } catch(err){
      addLog(`❌ Error: ${err.message}`, true)
      setStatus(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: 600, marginTop: 40 }}>
      <h1>🧪 Login Test - Debug Mode</h1>
      <p>This page tests form submission and API connectivity.</p>

      <form id="testLoginForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input id="username" className="form-control" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Enter username" required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input id="password" type="password" className="form-control" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password" required />
        </div>
        <button type="submit" id="submitBtn" className="btn btn-primary" disabled={loading}>{loading ? 'Logging in...' : 'Test Login'}</button>
      </form>

      <div className="status"><strong>Status:</strong> <span>{status}</span></div>

      <LogBox logs={logs} />
    </div>
  )
}
