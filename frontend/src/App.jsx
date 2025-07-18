import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/landing/LandingPage'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
// Removed Dashboard import since it will not be used
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/common/Layout'

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          {/* Muted Dashboard: replaced with empty fragment */}
          <Route index element={null} />
        </Route>
        
        {/* Redirect to landing for any unmatched routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
