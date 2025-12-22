import React from 'react'

export default function Dashboard(){
  return (
    <div className="container" style={{marginTop:20}}>
      <h1>Dashboard</h1>
      <p>This is a placeholder dashboard. We'll pull user info and dynamic widgets here.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12,marginTop:16}}>
        <div style={{padding:12,background:'#fff',borderRadius:6}}>Compilations: <strong>--</strong></div>
        <div style={{padding:12,background:'#fff',borderRadius:6}}>Active Sessions: <strong>--</strong></div>
        <div style={{padding:12,background:'#fff',borderRadius:6}}>Projects: <strong>--</strong></div>
      </div>
    </div>
  )
}
