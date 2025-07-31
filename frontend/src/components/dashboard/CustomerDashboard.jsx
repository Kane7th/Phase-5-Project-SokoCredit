import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  DollarSign, 
  CreditCard, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Phone,
  Download,
  Smartphone,
  Building,
  TrendingUp,
  Calendar
} from 'lucide-react'
import { customerService } from '../../services/customerService'

const CustomerDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('overview')
  const navigate = useNavigate()

  const [customerData, setCustomerData] = useState(null)
  const [currentLoan, setCurrentLoan] = useState(null)
  const [paymentHistory, setPaymentHistory] = useState([])
  const [notifications, setNotifications] = useState([])

  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState(user)

  useEffect(() => {
    const handleTabChange = (e) => {
      setActiveTab(e.detail)
    }
    window.addEventListener('customerTabChange', handleTabChange)
    return () => {
      window.removeEventListener('customerTabChange', handleTabChange)
    }
  }, [])

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData()
      fetchNotifications()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const response = await customerService.getCustomerDashboardData()
      const data = response
      setCustomerData(data.customer)
      const activeLoan = data.loans.find(loan => loan.status === 'active')
      setCurrentLoan(activeLoan || null)
      setPaymentHistory(data.payments)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }
  
  const fetchNotifications = async () => {
    // Placeholder: Implement notification fetch if API available
    setNotifications([]) // Empty for now
  }

  const handlePayNow = () => {
    // Implement payment logic
    console.log('Initiating payment...')
  }

  const handleApplyLoan = () => {
    // Navigate to loan application form page
    navigate('/loan-application')
  }

  const StatCard = ({ title, value, icon: Icon, color, subtitle, action }) => (
    <div className="stat-card">
      <div className="stat-header">
        <div className={`stat-icon ${color}`}>
          {Icon && <Icon size={24} />}
        </div>
      </div>
      <div className="stat-content">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
        {action && <div className="stat-action">{action}</div>}
      </div>
    </div>
  )

  if (!customerData) {
    return <div>Loading customer data...</div>
  }

  return (
    <div className="customer-dashboard">
      <div className="dashboard-header">
        <h1 className="heading-2">
          Welcome, {user?.full_name?.split(' ')[0] || 'Customer'}! 🛒
        </h1>
        <p className="text-muted">
          Manage your loans and grow your business with SokoCredit
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'loans' ? 'active' : ''}`}
          onClick={() => setActiveTab('loans')}
        >
          My Loans
        </button>
        <button 
          className={`tab-button ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payments
        </button>
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          My Profile
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Quick Stats */}
          <div className="stats-grid">
            <StatCard
              title="Credit Score"
              value={customerData.creditProfile?.score || 'N/A'}
              icon={TrendingUp}
              color="green"
              subtitle="Excellent rating"
            />
            <StatCard
              title="Active Loan"
              value={currentLoan ? `KSH ${(currentLoan.balance / 1000).toFixed(0)}K` : 'None'}
              icon={DollarSign}
              color="blue"
              subtitle={currentLoan ? 'Outstanding balance' : 'No active loans'}
            />
            <StatCard
              title="Next Payment"
              value={currentLoan ? `KSH ${(currentLoan.nextPaymentAmount / 1000).toFixed(1)}K` : 'N/A'}
              icon={Calendar}
              color="orange"
              subtitle={currentLoan ? `Due ${new Date(currentLoan.nextPaymentDate).toLocaleDateString()}` : ''}
              action={currentLoan && (
                <button className="btn btn-sm btn-primary" onClick={handlePayNow}>
                  Pay Now
                </button>
              )}
            />
            <StatCard
              title="Payment History"
              value={`${customerData.paymentHistory || 0}%`}
              icon={CheckCircle}
              color="green"
              subtitle="On-time payments"
            />
          </div>

          {/* Current Loan Status */}
          {currentLoan && (
            <div className="dashboard-content">
              <div className="card">
                <div className="card-header">
                  <h3 className="heading-3">Current Loan Status</h3>
                  <span className="badge badge-success">Active</span>
                </div>
                <div className="card-body">
                  <div className="loan-overview">
                    <div className="loan-details">
                      <div className="loan-info-grid">
                        <div className="info-item">
                          <label>Loan ID</label>
                          <value>{currentLoan.id}</value>
                        </div>
                        <div className="info-item">
                          <label>Original Amount</label>
                          <value>KSH {currentLoan.amount.toLocaleString()}</value>
                        </div>
                        <div className="info-item">
                          <label>Outstanding Balance</label>
                          <value>KSH {currentLoan.balance.toLocaleString()}</value>
                        </div>
                        <div className="info-item">
                          <label>Interest Rate</label>
                          <value>{currentLoan.interestRate}% Annual</value>
                        </div>
                        <div className="info-item">
                          <label>Repayment</label>
                          <value>KSH {currentLoan.nextPaymentAmount.toLocaleString()} {currentLoan.repaymentFrequency}</value>
                        </div>
                        <div className="info-item">
                          <label>Loan Period</label>
                          <value>{new Date(currentLoan.startDate).toLocaleDateString()} to {new Date(currentLoan.endDate).toLocaleDateString()}</value>
                        </div>
                      </div>
                    </div>
                    
                    <div className="loan-progress">
                      <div className="progress-header">
                        <span>Loan Progress</span>
                        <span>{Math.round((currentLoan.paymentsMade / currentLoan.paymentsTotal) * 100)}% Complete</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${(currentLoan.paymentsMade / currentLoan.paymentsTotal) * 100}%` }}
                        ></div>
                      </div>
                      <div className="progress-labels">
                        <span>Start: {new Date(currentLoan.startDate).toLocaleDateString()}</span>
                        <span>End: {new Date(currentLoan.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Next Payment Section */}
                  <div className="next-payment-section">
                    <div className="payment-card">
                      <div className="payment-header">
                        <h4>Next Payment Due</h4>
                        <span className="due-date">{new Date(currentLoan.nextPaymentDate).toLocaleDateString()}</span>
                      </div>
                      <div className="payment-amount">
                        KSH {currentLoan.nextPaymentAmount.toLocaleString()}
                      </div>
                      <div className="payment-methods">
                        <button className="btn btn-primary payment-btn" onClick={handlePayNow}>
                          <Smartphone size={16} />
                          Pay via M-Pesa
                        </button>
                        <button className="btn btn-secondary payment-btn">
                          <Phone size={16} />
                          Call Lender
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="dashboard-content">
            <div className="card">
              <div className="card-header">
                <h3 className="heading-3">Quick Actions</h3>
              </div>
              <div className="card-body">
                <div className="quick-actions-grid">
                  <button className="action-card" onClick={handleApplyLoan}>
                    <Plus size={32} />
                    <h4>Apply for New Loan</h4>
                    <p>Get funding to grow your business</p>
                  </button>
                  
                  <button className="action-card" onClick={handlePayNow}>
                    <CreditCard size={32} />
                    <h4>Make Payment</h4>
                    <p>Pay your loan installment</p>
                  </button>
                  
                  <button className="action-card">
                    <Eye size={32} />
                    <h4>Loan History</h4>
                    <p>View all your past loans</p>
                  </button>
                  
                  <button className="action-card">
                    <Phone size={32} />
                    <h4>Contact Support</h4>
                    <p>Get help from our team</p>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="dashboard-content">
            <div className="card">
              <div className="card-header">
                <h3 className="heading-3">Notifications</h3>
                <span className="badge badge-info">
                  {notifications.filter(n => !n.read).length} unread
                </span>
              </div>
              <div className="card-body">
                <div className="notification-list">
                  {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                    >
                      <div className="notification-icon">
                        {notification.type === 'payment_reminder' && <Clock size={20} />}
                        {notification.type === 'loan_approved' && <CheckCircle size={20} />}
                      </div>
                      <div className="notification-content">
                        <p>{notification.message}</p>
                        <span className="notification-date">{notification.date}</span>
                      </div>
                      {!notification.read && <div className="notification-indicator"></div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Loans Tab */}
      {activeTab === 'loans' && (
        <div className="dashboard-content">
          <div className="card">
            <div className="card-header">
              <h3 className="heading-3">My Loans</h3>
              <button className="btn btn-primary" onClick={handleApplyLoan}>
                <Plus size={16} />
                Apply for Loan
              </button>
            </div>
            <div className="card-body">
              <div className="loan-applications">
                {/* Current Active Loan */}
                {currentLoan && (
                  <div className="loan-card active">
                    <div className="loan-header">
                      <div className="loan-id">{currentLoan.id}</div>
                      <span className="loan-status active">Active</span>
                    </div>
                    <div className="loan-body">
                      <div className="loan-amount">
                        KSH {currentLoan.amount.toLocaleString()}
                      </div>
                      <div className="loan-balance">
                        Balance: KSH {currentLoan.balance.toLocaleString()}
                      </div>
                      <div className="loan-progress-mini">
                        <div className="progress-bar-mini">
                          <div 
                            className="progress-fill-mini"
                            style={{ width: `${currentLoan.progress}%` }}
                          ></div>
                        </div>
                        <span>{currentLoan.progress}% paid</span>
                      </div>
                    </div>
                    <div className="loan-actions">
                      <button className="btn btn-sm btn-primary">View Details</button>
                      <button className="btn btn-sm btn-secondary">Make Payment</button>
                    </div>
                  </div>
                )}

                {/* Loan Application CTA */}
                <div className="loan-cta-card">
                  <div className="cta-content">
                    <h4>Need more funding?</h4>
                    <p>Apply for a new loan to expand your business further</p>
                    <button className="btn btn-primary" onClick={handleApplyLoan}>
                      <Plus size={16} />
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="dashboard-content">
          <div className="card">
            <div className="card-header">
              <h3 className="heading-3">Payment History</h3>
              <button className="btn btn-secondary">
                <Download size={16} />
                Download Statement
              </button>
            </div>
            <div className="card-body">
              <div className="payment-history">
                {paymentHistory.map(payment => (
                  <div key={payment.id} className="payment-item">
                    <div className="payment-date">
                      {new Date(payment.date).toLocaleDateString()}</div>
                    <div className="payment-details">
                      <div className="payment-amount">
                        KSH {payment.amount.toLocaleString()}
                      </div>
                      <div className="payment-method">
                        {payment.method}
                      </div>
                    </div>
                    <div className="payment-status">
                      <span className={`status-badge ${payment.status}`}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="payment-actions">
                      <button className="btn btn-sm btn-secondary">
                        <Download size={14} />
                        Receipt
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="dashboard-content">
          <div className="card">
            <div className="card-header">
              <h3 className="heading-3">My Business Profile</h3>
              <button 
                className="btn btn-secondary"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
      {isEditing && (
        <button 
          className="btn btn-primary"
          onClick={() => {
            // Placeholder for save functionality
            console.log('Save changes clicked');
          }}
        >
          Save Changes
        </button>
      )}
            </div>
            <div className="card-body">
              <div className="profile-grid">
                <div className="profile-section">
                  <h4>Personal Information</h4>
                  <div className="profile-fields">
                    <div className="field-item">
                      <label>Full Name</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editedUser.full_name} 
                          onChange={(e) => setEditedUser({...editedUser, full_name: e.target.value})}
                          className="form-input"
                        />
                      ) : (
                        <value>{user?.full_name}</value>
                      )}
                    </div>
                    <div className="field-item">
                      <label>Phone Number</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editedUser.phone} 
                          onChange={(e) => setEditedUser({...editedUser, phone: e.target.value})}
                          className="form-input"
                        />
                      ) : (
                        <value>{user?.phone}</value>
                      )}
                    </div>
                    <div className="field-item">
                      <label>National ID</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editedUser.id_number} 
                          onChange={(e) => setEditedUser({...editedUser, id_number: e.target.value})}
                          className="form-input"
                        />
                      ) : (
                        <value>{user?.id_number}</value>
                      )}
                    </div>
                    <div className="field-item">
                      <label>Location</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editedUser.location} 
                          onChange={(e) => setEditedUser({...editedUser, location: e.target.value})}
                          className="form-input"
                        />
                      ) : (
                        <value>{user?.location}</value>
                      )}
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <h4>Business Information</h4>
                  <div className="profile-fields">
                    <div className="field-item">
                      <label>Business Name</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editedUser.business_name} 
                          onChange={(e) => setEditedUser({...editedUser, business_name: e.target.value})}
                          className="form-input"
                        />
                      ) : (
                        <value>{user?.business_name}</value>
                      )}
                    </div>
                    <div className="field-item">
                      <label>Business Type</label>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={editedUser.business_type} 
                          onChange={(e) => setEditedUser({...editedUser, business_type: e.target.value})}
                          className="form-input"
                        />
                      ) : (
                        <value>{user?.business_type?.replace('_', ' ')}</value>
                      )}
                    </div>
                    <div className="field-item">
                      <label>Average Income</label>
                      {isEditing ? (
                        <input 
                          type="number" 
                          value={editedUser.average_income} 
                          onChange={(e) => setEditedUser({...editedUser, average_income: e.target.value})}
                          className="form-input"
                        />
                      ) : (
                        <value>KSH {user?.average_income?.toLocaleString()}</value>
                      )}
                    </div>
                    <div className="field-item">
                      <label>Credit Score</label>
                      <value>{customerData.creditProfile?.score || 'N/A'}/850</value>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerDashboard
