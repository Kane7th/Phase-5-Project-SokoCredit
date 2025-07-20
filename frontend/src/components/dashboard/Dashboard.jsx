import React from 'react'
import { useSelector } from 'react-redux'
import AdminDashboard from './AdminDashboard'
import LenderDashboard from './LenderDashboard'
import CustomerDashboard from './CustomerDashboard'
import LoadingSpinner from '../common/LoadingSpinner'

const DashboardRouter = () => {
  const { user, isLoading } = useSelector((state) => state.auth)

  if (isLoading || !user) {
    return (
      <div style={{ 
        height: '50vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />
    case 'loan_officer':
    case 'agent':
      return <LenderDashboard />
    case 'customer':
      return <CustomerDashboard />
    default:
      return (
        <div className="error-container">
          <h2>Access Denied</h2>
          <p>Your account role is not recognized. Please contact support.</p>
        </div>
      )
  }
}

export default DashboardRouter