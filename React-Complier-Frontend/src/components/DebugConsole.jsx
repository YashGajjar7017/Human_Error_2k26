import React, { useState } from 'react'

export default function DebugConsole({ isDarkTheme }){
  const [logs, setLogs] = useState([])
  const [activeTab, setActiveTab] = useState('console')

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, {
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const clearLogs = () => setLogs([])

  const exportLogs = () => {
    const logsText = logs.map(l => `[${l.timestamp}] ${l.type.toUpperCase()}: ${l.message}`).join('\n')
    const blob = new Blob([logsText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `debug-logs-${Date.now()}.txt`
    a.click()
  }

  return (
    <div style={{...styles.container, backgroundColor: isDarkTheme ? '#1e1e1e' : '#f9f9f9', color: isDarkTheme ? '#fff' : '#333'}}>
      <div style={{...styles.header, borderBottom: isDarkTheme ? '1px solid #333' : '1px solid #ddd'}}>
        <div style={styles.tabs}>
          {['console', 'debug', 'network'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tab,
                borderBottom: activeTab === tab ? '2px solid #4CAF50' : 'none',
                color: activeTab === tab ? '#4CAF50' : (isDarkTheme ? '#aaa' : '#666')
              }}
            >
              {tab === 'console' && '📋 Console'}
              {tab === 'debug' && '🐛 Debug'}
              {tab === 'network' && '🌐 Network'}
            </button>
          ))}
        </div>
        <div style={styles.controls}>
          <button onClick={clearLogs} title="Clear logs" style={styles.iconBtn}>🗑️</button>
          <button onClick={exportLogs} title="Export logs" style={styles.iconBtn}>📥</button>
        </div>
      </div>

      <div style={{...styles.content, backgroundColor: isDarkTheme ? '#0d0d0d' : '#fafafa', borderColor: isDarkTheme ? '#333' : '#ddd'}}>
        {activeTab === 'console' && (
          <div style={styles.logsContainer}>
            {logs.length === 0 ? (
              <div style={{...styles.emptyState, color: isDarkTheme ? '#666' : '#999'}}>
                No logs yet
              </div>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  style={{
                    ...styles.logEntry,
                    borderLeftColor: log.type === 'error' ? '#f44336' : log.type === 'warn' ? '#ff9800' : '#4CAF50',
                    backgroundColor: isDarkTheme ? '#1a1a1a' : '#fff',
                    color: log.type === 'error' ? '#f44336' : log.type === 'warn' ? '#ff9800' : (isDarkTheme ? '#aaa' : '#666')
                  }}
                >
                  <span style={{fontSize: 10, opacity: 0.6}}>{log.timestamp}</span>
                  <span style={{marginLeft: 8}}>{log.message}</span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'debug' && (
          <div style={styles.debugInfo}>
            <div style={styles.debugSection}>
              <h4>System Information</h4>
              <div>User Agent: {navigator.userAgent}</div>
              <div>Platform: {navigator.platform}</div>
              <div>Language: {navigator.language}</div>
              <div>Memory: {navigator.deviceMemory ? navigator.deviceMemory + ' GB' : 'N/A'}</div>
            </div>
            <div style={styles.debugSection}>
              <h4>Performance</h4>
              <div>Page Load Time: {performance.timing ? performance.timing.loadEventEnd - performance.timing.navigationStart : 'N/A'} ms</div>
              <div>DOM Content Loaded: {performance.timing ? performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart : 'N/A'} ms</div>
            </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div style={{...styles.emptyState, color: isDarkTheme ? '#666' : '#999'}}>
            Network inspector coming soon...
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    border: '1px solid #ddd',
    borderRadius: 6,
    marginTop: 12,
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px'
  },
  tabs: {
    display: 'flex',
    gap: 16
  },
  tab: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 'bold',
    paddingBottom: 4,
    transition: 'all 0.2s'
  },
  controls: {
    display: 'flex',
    gap: 4
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 12,
    padding: '4px 8px'
  },
  content: {
    minHeight: 200,
    maxHeight: 300,
    overflowY: 'auto',
    fontFamily: 'monospace',
    fontSize: 11
  },
  logsContainer: {
    padding: 8
  },
  logEntry: {
    padding: '4px 8px',
    marginBottom: 4,
    borderRadius: 2,
    borderLeft: '3px solid',
    fontSize: 10
  },
  emptyState: {
    padding: 20,
    textAlign: 'center',
    fontSize: 12
  },
  debugInfo: {
    padding: 12,
    fontSize: 11,
    lineHeight: 1.6
  },
  debugSection: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottom: '1px solid #ddd'
  }
}
