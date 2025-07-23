import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/landing/LandingPage'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import DashboardRouter from './components/dashboard/DashboardRouter'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/common/Layout'
import NotificationListener from './components/NotificationListener'

function App() {
  const token = localStorage.getItem('access_token')
  const userId = localStorage.getItem('user_id')
  const role = localStorage.getItem('user_role')

  const isAuthenticated = token && userId && role

  return (
    <div className="App">
      {/* Global socket listener */}
      {isAuthenticated && (
        <NotificationListener token={token} userId={userId} />
      )}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute allowedRoles={['admin', 'lender', 'customer']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="*" element={<DashboardRouter />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
