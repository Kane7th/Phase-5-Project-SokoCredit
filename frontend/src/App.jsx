import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/landing/LandingPage'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import DashboardRouter from './components/dashboard/DashboardRouter'

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
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="*" element={<DashboardRouter />} />
        </Route>
        
        {/* Redirect to landing for any unmatched routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
