import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Compiler from './pages/Compiler'
import Dashboard from './pages/Dashboard'
import Navbar from './components/Navbar'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import OTP from './pages/OTP'
import OTP1 from './pages/OTP1'
import Classroom from './pages/Classroom'
import APIDocs from './pages/APIDocs'
import Theme from './pages/Theme'
import Session from './pages/Session'
import Security from './pages/Security'
import LoginW from './pages/LoginW'
import LoginOverlay from './pages/LoginOverlay'
import Login1 from './pages/Login1'
import Membership from './pages/Membership'
import Maintenance from './pages/Maintenance'
import ContactUs from './pages/ContactUs'
import Collaboration from './pages/Collaboration'
import Analytics from './pages/Analytics'
import Achievements from './pages/Achievements'
import NotFound from './pages/NotFound'
import Payment from './pages/Payment'
import HtmlLegacy from './pages/HtmlLegacy'

export default function App(){
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/otp" element={<OTP />} />
        <Route path="/compiler" element={<Compiler />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/classroom" element={<Classroom />} />
        <Route path="/api-docs" element={<APIDocs />} />
        <Route path="/theme" element={<Theme />} />
        <Route path="/session" element={<Session />} />
        <Route path="/security" element={<Security />} />
        <Route path="/login-w" element={<LoginW />} />
        <Route path="/login-overlay" element={<LoginOverlay />} />
        <Route path="/login-1" element={<Login1 />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/collaboration" element={<Collaboration />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/otp-1" element={<OTP1 />} />
        <Route path="/payment" element={<Payment />} />
        {/* Legacy HTML renderer (exact pages from Frontend/views) */}
        <Route path="/html/:name" element={<HtmlLegacy />} />
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}
