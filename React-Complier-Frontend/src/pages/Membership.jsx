import React, { useEffect, useState } from 'react'

export default function Membership(){
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('web');
  const [modeLoading, setModeLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function loadProfile(){
      try {
        const res = await fetch('/api/members/me', { credentials: 'include' });
        const data = await res.json();
        if (data && data.success) setProfile(data.data);
      } catch (e) {
        console.error('Failed to fetch profile', e);
      } finally {
        setLoading(false);
      }
    }

    async function loadMode(){
      try {
        const res = await fetch('/api/mode', { credentials: 'include' });
        const data = await res.json();
        if (data && data.success) setMode(data.mode || 'web');
      } catch (e) {
        console.error('Failed to fetch mode', e);
      }
    }

    loadProfile();
    loadMode();
  }, []);

  const setAppMode = async (newMode) => {
    setModeLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/mode/set', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode })
      });
      const data = await res.json();
      if (data && data.success) {
        setMode(newMode);
        setMessage({ type: 'success', text: data.message || `Mode set to ${newMode}` });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to set mode' });
      }
    } catch (err) {
      console.error('Error setting mode', err);
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setModeLoading(false);
    }
  }

  const launchElectron = async () => {
    setModeLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/mode/launch', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data && data.success) {
        setMessage({ type: 'success', text: data.message || 'Electron launched' });
        setMode('electron');
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to launch electron' });
      }
    } catch (err) {
      console.error('Error launching electron', err);
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setModeLoading(false);
    }
  }

  const openWebDashboard = () => {
    // Open dashboard on local web app. If electron is active, prevent opening to ensure one at a time
    if (mode === 'electron') {
      setMessage({ type: 'warning', text: 'Electron mode is active. Stop electron to open the web dashboard.' });
      return;
    }
    // Opens the app frontend (relative path)
    window.open('/dashboard', '_blank');
  }

  return (
    <div className="container" style={{marginTop:20}}>
      <h1>Membership</h1>
      <p>Membership plans & pricing (migrated from `membership.html`)</p>

      {message && (
        <div style={{marginTop:12, padding:10, borderRadius:6, background: message.type === 'error' ? '#fee2e2' : message.type === 'warning' ? '#fff7ed' : '#ecfdf5', color: message.type === 'error' ? '#b91c1c' : message.type === 'warning' ? '#92400e' : '#065f46'}}>
          {message.text}
        </div>
      )}

      {loading && <p>Loading your membership...</p>}

      {!loading && profile && (
        <div style={{marginTop:20}}>
          <h3>Your Plan</h3>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <div style={{padding:'8px 12px', borderRadius:8, background:'#111827', color:'#fff', fontWeight:600}}>{profile.subscription?.plan || 'free'}</div>
            <div style={{color:'#9ca3af'}}>Member since: {new Date(profile.joinDate).toLocaleDateString()}</div>
            <div style={{marginLeft:'auto', display:'flex', gap:8}}>
              <button onClick={() => setAppMode('web')} disabled={modeLoading || mode === 'web'} style={{padding:'6px 10px'}}>Set Web</button>
              <button onClick={() => setAppMode('electron')} disabled={modeLoading || mode === 'electron'} style={{padding:'6px 10px'}}>Set Electron</button>
              <button onClick={launchElectron} disabled={modeLoading} style={{padding:'6px 10px'}}>Launch Electron</button>
              <button onClick={openWebDashboard} disabled={mode === 'electron'} style={{padding:'6px 10px'}}>Open Web Dashboard</button>
            </div>
          </div>

          <div style={{marginTop:16}}>
            <strong>Current App Mode:</strong> <span style={{marginLeft:8, fontWeight:600}}>{mode}</span>
          </div>

          <div style={{marginTop:18}}>
            <p style={{fontSize:13, color:'#9ca3af'}}>If signup is not working, please report to support or try again later. (Signup/verification and timestamps are logged in the database.)</p>
          </div>
        </div>
      )}

      {!loading && !profile && (
        <div style={{marginTop:20}}>
          <p>You are not signed in. Please sign in to view your membership.</p>
        </div>
      )}
    </div>
  )
}
