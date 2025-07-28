import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LandingPage from './components/landing/LandingPage'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import DashboardRouter from './components/dashboard/DashboardRouter'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/common/Layout'
import NotificationListener from './components/NotificationListener'
import ProfilePage from './components/customer/ProfilePage'
import Settings from './components/common/Settings'
import ChangePassword from './components/auth/ChangePassword'
import ForgotPassword from './components/auth/ForgotPassword'

function App() {
  const { isAuthenticated, user_id, role, token } = useSelector((state) => state.auth)

  return (
    <div className="App">
      {isAuthenticated && token && user_id && role && (
        <NotificationListener token={token} userId={user_id} />
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
            <ProtectedRoute allowedRoles={['admin', 'loan_officer', 'customer', 'mama_mboga']}>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="*" element={<DashboardRouter />} />
        </Route>

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['admin', 'lender', 'customer']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={['admin', 'lender', 'customer']}>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/change-password"
          element={
            <ProtectedRoute allowedRoles={['admin', 'lender', 'customer']}>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
