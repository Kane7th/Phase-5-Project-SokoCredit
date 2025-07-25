import React, { useState } from 'react'
import { useSelector } from 'react-redux'
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

const CustomerDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('overview')

  React.useEffect(() => {
    const handleTabChange = (e) => {
      setActiveTab(e.detail)
    }
    window.addEventListener('customerTabChange', handleTabChange)
    return () => {
      window.removeEventListener('customerTabChange', handleTabChange)
    }
  }, [])

  // Mock data - replace with API calls
  const customerData = {
    creditScore: 720,
    totalBorrowed: 150000,
    totalRepaid: 125000,
    activeLoans: 1,
    completedLoans: 2,
    paymentHistory: 95
  }

  const currentLoan = {
    id: 'LN202401234',
    amount: 50000,
    balance: 11000,
    nextPayment: {
      date: '2024-01-25',
      amount: 2500
    },
    progress: 78,
    status: 'active',
    startDate: '2023-10-15',
    endDate: '2024-04-15',
    interestRate: 12,
    repaymentFrequency: 'weekly'
  }

  const paymentHistory = [
    {
      id: 1,
      date: '2024-01-18',
      amount: 2500,
      method: 'M-Pesa',
      status: 'completed',
      receipt: 'RCP001234'
    },
    {
      id: 2,
      date: '2024-01-11',
      amount: 2500,
      method: 'M-Pesa',
      status: 'completed',
      receipt: 'RCP001233'
    },
    {
      id: 3,
      date: '2024-01-04',
      amount: 2500,
      method: 'Cash',
      status: 'completed',
      receipt: 'RCP001232'
    }
  ]

  const notifications = [
    {
      id: 1,
      type: 'payment_reminder',
      message: 'Payment of KSH 2,500 is due tomorrow',
      date: '2024-01-24',
      read: false
    },
    {
      id: 2,
      type: 'loan_approved',
      message: 'Your loan application has been approved!',
      date: '2024-01-20',
      read: true
    }
  ]


  const handlePayNow = () => {
    // Implement payment logic
    console.log('Initiating payment...')
  }

  const handleApplyLoan = () => {
    // Navigate to loan application
    console.log('Starting loan application...')
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
              value={customerData.creditScore}
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
              value={currentLoan ? `KSH ${(currentLoan.nextPayment.amount / 1000).toFixed(1)}K` : 'N/A'}
              icon={Calendar}
              color="orange"
              subtitle={currentLoan ? `Due ${currentLoan.nextPayment.date}` : ''}
              action={currentLoan && (
                <button className="btn btn-sm btn-primary" onClick={handlePayNow}>
                  Pay Now
                </button>
              )}
            />
            <StatCard
              title="Payment History"
              value={`${customerData.paymentHistory}%`}
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
                          <value>KSH {currentLoan.nextPayment.amount.toLocaleString()} {currentLoan.repaymentFrequency}</value>
                        </div>
                        <div className="info-item">
                          <label>Loan Period</label>
                          <value>{currentLoan.startDate} to {currentLoan.endDate}</value>
                        </div>
                      </div>
                    </div>
                    
                    <div className="loan-progress">
                      <div className="progress-header">
                        <span>Loan Progress</span>
                        <span>{currentLoan.progress}% Complete</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${currentLoan.progress}%` }}
                        ></div>
                      </div>
                      <div className="progress-labels">
                        <span>Start: {currentLoan.startDate}</span>
                        <span>End: {currentLoan.endDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Next Payment Section */}
                  <div className="next-payment-section">
                    <div className="payment-card">
                      <div className="payment-header">
                        <h4>Next Payment Due</h4>
                        <span className="due-date">{currentLoan.nextPayment.date}</span>
                      </div>
                      <div className="payment-amount">
                        KSH {currentLoan.nextPayment.amount.toLocaleString()}
                      </div>
                      <div className="payment-methods">
                        <button className="btn btn-primary payment-btn">
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
                      {payment.date}
                    </div>
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
              <button className="btn btn-secondary">Edit Profile</button>
            </div>
            <div className="card-body">
              <div className="profile-grid">
                <div className="profile-section">
                  <h4>Personal Information</h4>
                  <div className="profile-fields">
                    <div className="field-item">
                      <label>Full Name</label>
                      <value>{user?.full_name}</value>
                    </div>
                    <div className="field-item">
                      <label>Phone Number</label>
                      <value>{user?.phone}</value>
                    </div>
                    <div className="field-item">
                      <label>National ID</label>
                      <value>{user?.id_number}</value>
                    </div>
                    <div className="field-item">
                      <label>Location</label>
                      <value>{user?.location}</value>
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <h4>Business Information</h4>
                  <div className="profile-fields">
                    <div className="field-item">
                      <label>Business Name</label>
                      <value>{user?.business_name}</value>
                    </div>
                    <div className="field-item">
                      <label>Business Type</label>
                      <value>{user?.business_type?.replace('_', ' ')}</value>
                    </div>
                    <div className="field-item">
                      <label>Average Income</label>
                      <value>KSH {user?.average_income?.toLocaleString()}</value>
                    </div>
                    <div className="field-item">
                      <label>Credit Score</label>
                      <value>{customerData.creditScore}/850</value>
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