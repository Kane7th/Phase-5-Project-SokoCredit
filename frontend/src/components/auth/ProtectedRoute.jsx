import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentUser } from '../../store/authSlice'
import LoadingSpinner from '../common/LoadingSpinner'

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { isAuthenticated, user, isLoading, token } = useSelector((state) => state.auth)

  console.log('ProtectedRoute auth state:', { isAuthenticated, user, isLoading, token })

  useEffect(() => {
    // If we have a token but no user data, fetch current user
    if (token && !user && !isLoading) {
      console.log('Dispatching getCurrentUser')
      dispatch(getCurrentUser())
    }
  }, [dispatch, token, user, isLoading])

  // Show loading while checking authentication
  if (isLoading) {
    console.log('ProtectedRoute: Loading your dashboard...')
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--gray-50)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <LoadingSpinner size="lg" />
          <p style={{ marginTop: '16px', color: 'var(--gray-600)' }}>
            Loading your dashboard...
          </p>
        </div>
      </div>
    )
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated || !token) {
    console.log('ProtectedRoute: Redirecting to login')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If user data is still loading but we have a token, show loading
  if (token && !user) {
    console.log('ProtectedRoute: Setting up your workspace...')
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--gray-50)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <LoadingSpinner size="lg" />
          <p style={{ marginTop: '16px', color: 'var(--gray-600)' }}>
            Setting up your workspace...
          </p>
        </div>
      </div>
    )
  }

  // User is authenticated and user data is loaded
  console.log('ProtectedRoute: Rendering children')
  return children
}

export default ProtectedRoute