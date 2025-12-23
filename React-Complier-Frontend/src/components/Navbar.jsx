import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar(){
  return (
    <nav style={{display:'flex',gap:12,alignItems:'center',padding:12,background:'#fff',borderRadius:6,marginBottom:20}}>
      <Link to="/" style={{fontWeight:700}}>Home</Link>
      <Link to="/compiler">Compiler</Link>
      <Link to="/dashboard">Dashboard</Link>
      <Link to="/classroom">Classroom</Link>
      <Link to="/membership">Membership</Link>
      <Link to="/api-docs">API Docs</Link>
      <Link to="/analytics">Analytics</Link>
      <Link to="/achievements">Achievements</Link>
      <Link to="/contact">Contact</Link>
      <Link to="/collaboration">Collaboration</Link>
      <Link to="/login">Login</Link>
      <div style={{marginLeft:'auto',opacity:0.8}}>Human Error</div>
    </nav>
  )
}
