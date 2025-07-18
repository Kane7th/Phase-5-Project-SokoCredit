import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
/* import Dashboard from './components/dashboard/Dashboard' */
/* import ProtectedRoute from './components/auth/ProtectedRoute' */
import Layout from './components/common/Layout'

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        {/* <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }> */}
        {/* </Route> */}
        
        {/* Redirect to login for any unmatched routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

export default App