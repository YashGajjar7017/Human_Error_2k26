import React from 'react'

export default function LogBox({ logs }){
  return (
    <div className="log-box" aria-live="polite">
      {logs.length === 0 ? (<div className="log-entry">No logs</div>) : logs.map((l, i) => (
        <div key={i} className={`log-entry ${l.error ? 'log-error' : ''}`}>{l.text}</div>
      ))}
    </div>
  )
}
