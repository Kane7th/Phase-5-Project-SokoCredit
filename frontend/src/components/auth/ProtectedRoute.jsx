import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentUser } from '../../store/authSlice'
import LoadingSpinner from '../common/LoadingSpinner'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { isAuthenticated, user, isLoading, token } = useSelector((state) => state.auth)

  useEffect(() => {
    if (token && !user && !isLoading) {
      dispatch(getCurrentUser())
    }
  }, [dispatch, token, user, isLoading])

  // Still fetching user info
  if (isLoading || (token && !user)) {
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

  // Not authenticated → redirect to login
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Role not authorized → redirect home or show message
  if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/" replace />
  }

  // All checks passed
  return children
}

export default ProtectedRoute
