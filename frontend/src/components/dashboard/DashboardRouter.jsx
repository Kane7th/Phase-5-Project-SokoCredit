import React from 'react'
import { useSelector } from 'react-redux'
import LoadingSpinner from '../common/LoadingSpinner'
import AdminDashboard from './AdminDashboard'
import LenderDashboard from './LenderDashboard'
import CustomerDashboard from './CustomerDashboard'

const DashboardRouter = () => {
  const { user, isLoading } = useSelector((state) => state.auth)

  console.log('DashboardRouter render - user:', user)

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
      console.log('Rendering AdminDashboard')
      return <AdminDashboard />
    case 'loan_officer':
    case 'mama_mboga':
      console.log('Rendering LenderDashboard')
      return <LenderDashboard />
    case 'customer':
      console.log('Rendering CustomerDashboard')
      return <CustomerDashboard />
    default:
      console.log('Rendering Access Denied')
      return (
        <div className="error-container">
          <h2>Access Denied</h2>
          <p>Your account role is not recognized. Please contact support.</p>
        </div>
      )
  }
}

export default DashboardRouter
