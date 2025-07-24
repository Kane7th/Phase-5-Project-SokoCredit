import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentUser } from '../../store/authSlice'
import LoadingSpinner from '../common/LoadingSpinner'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const dispatch = useDispatch()
  const location = useLocation()

  const {
    isAuthenticated,
    token,
    user,
    role,
    isLoading,
  } = useSelector((state) => state.auth)

  // Try to fetch user if we have token but no user loaded
  useEffect(() => {
    if (token && !user && !isLoading) {
      dispatch(getCurrentUser())
    }
  }, [token, user, isLoading, dispatch])

  let currentRole = role || user?.role

  // Normalize currentRole to lowercase with underscores
  currentRole = currentRole ? currentRole.toLowerCase().replace(/\s+/g, '_') : ''

  // Normalize allowedRoles to lowercase with underscores
  const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase().replace(/\s+/g, '_'))

  // While loading or waiting for user
  if ((token && !user) || isLoading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9f9f9'
      }}>
        <div style={{ textAlign: 'center' }}>
          <LoadingSpinner size="lg" />
          <p style={{ marginTop: '1rem', color: '#555' }}>
            Loading your workspace...
          </p>
        </div>
      </div>
    )
  }

  // Not logged in
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // User is logged in but role not allowed
  if (normalizedAllowedRoles.length > 0 && !normalizedAllowedRoles.includes(currentRole)) {
    return <Navigate to="/" replace />
  }

  // Authenticated and authorized
  return children
}

export default ProtectedRoute
