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
import CustomerProfile from '../customer/CustomerProfile'
import { customerService } from '../../services/customerService'
import { isProfileComplete } from '../../utils/profileUtils'
import '../../styles/customerdashboard.css'

const CustomerDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('overview')
  const navigate = useNavigate()

  const [customerData, setCustomerData] = useState(null)
  const [currentLoan, setCurrentLoan] = useState(null)
  const [paymentHistory, setPaymentHistory] = useState([])

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
    }
  }, [user])

  useEffect(() => {
    if (window.history.state && window.history.state.usr && window.history.state.usr.state?.refresh) {
      fetchDashboardData()
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      const customerResponse = await customerService.getCustomerByUser(user.id)
      const finalCustomer = customerResponse || {}

      if (!finalCustomer.id) {
        console.error('Customer ID is undefined, cannot fetch loans or payments')
        return
      }
      const loansResponse = await customerService.getLoans()
      const loans = Array.isArray(loansResponse) ? loansResponse : (loansResponse.data || [])

      const paymentsResponse = await customerService.getPayments()
      const payments = Array.isArray(paymentsResponse) ? paymentsResponse : (paymentsResponse.data || [])

      if (!isProfileComplete(finalCustomer)) {
        navigate('/complete-profile')
        return
      }

      setCustomerData({ ...finalCustomer, loans })
      const activeLoan = loans.find(loan => loan.status === 'active')
      setCurrentLoan(activeLoan || null)
      setPaymentHistory(payments)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  const handlePayNow = () => {
    console.log('Initiating payment...')
  }

  const handleApplyLoan = () => {
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
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading customer data...</p>
      </div>
    )
  }

  return (
    <div className="customer-dashboard-container">
      

      <div className="dashboard-wrapper">
        {/* Header */}
        <div className="dashboard-header">
          <h1>🌟 Welcome, {user?.full_name?.split(' ')[0] || 'Customer'}!</h1>
          <p>Empowering Kenyan businesses with flexible microfinance solutions</p>
        </div>

        {/* Navigation Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Available Loans
          </button>
          <button 
            className={`tab-button ${activeTab === 'mystats' ? 'active' : ''}`}
            onClick={() => setActiveTab('mystats')}
          >
            My Stats
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

        {/* Content */}
        <div className="dashboard-content">
          {/* Available Loans Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Beautiful Loan Cards */}
              <div className="loan-cards-grid">
                {/* Mama Mboga Card */}
                <div className="loan-card" onClick={() => navigate('/loan-application', { state: { loanProduct: 'business' } })}>
                  <div className="loan-card-image mama-mboga-bg"></div>
                  <div className="loan-card-content">
                    <h3>Mama Mboga</h3>
                    <p>Loans tailored for small-scale vendors and market sellers. Perfect for expanding your vegetable business and increasing daily stock.</p>
                    <button className="apply-btn" onClick={(e) => {
                      e.stopPropagation()
                      navigate('/loan-application', { state: { loanProduct: 'business' } })
                    }}>
                      Click to Apply
                    </button>
                  </div>
                </div>

                {/* Small Business Card */}
                <div className="loan-card" onClick={() => navigate('/loan-application', { state: { loanProduct: 'inventory' } })}>
                  <div className="loan-card-image business-bg"></div>
                  <div className="loan-card-content">
                    <h3>Small Business</h3>
                    <p>Support for growing small businesses and entrepreneurs. Flexible terms to help you expand operations and reach new customers.</p>
                    <button className="apply-btn" onClick={(e) => {
                      e.stopPropagation()
                      navigate('/loan-application', { state: { loanProduct: 'inventory' } })
                    }}>
                      Click to Apply
                    </button>
                  </div>
                </div>

                {/* Farmers Card */}
                <div className="loan-card" onClick={() => navigate('/loan-application', { state: { loanProduct: 'equipment' } })}>
                  <div className="loan-card-image farmers-bg"></div>
                  <div className="loan-card-content">
                    <h3>Farmers</h3>
                    <p>Financing solutions for agricultural activities and farmers. Seasonal loans to help with planting, equipment, and harvest needs.</p>
                    <button className="apply-btn" onClick={(e) => {
                      e.stopPropagation()
                      navigate('/loan-application', { state: { loanProduct: 'equipment' } })
                    }}>
                      Click to Apply
                    </button>
                  </div>
                </div>

                {/* Others Card */}
                <div className="loan-card" onClick={() => navigate('/loan-application', { state: { loanProduct: 'emergency' } })}>
                  <div className="loan-card-image others-bg"></div>
                  <div className="loan-card-content">
                    <h3>Others</h3>
                    <p>Flexible loans for various other business needs. Whether it's equipment, inventory, or emergency funding, we've got you covered.</p>
                    <button className="apply-btn" onClick={(e) => {
                      e.stopPropagation()
                      navigate('/loan-application', { state: { loanProduct: 'emergency' } })
                    }}>
                      Click to Apply
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="quick-actions-grid">
                  <div className="quick-action-card" onClick={handleApplyLoan}>
                    <div className="quick-action-icon">
                      <Plus size={24} />
                    </div>
                    <h4>Apply for New Loan</h4>
                    <p>Get funding to grow your business</p>
                  </div>

                  <div className="quick-action-card" onClick={handlePayNow}>
                    <div className="quick-action-icon">
                      <CreditCard size={24} />
                    </div>
                    <h4>Make Payment</h4>
                    <p>Pay your loan installment</p>
                  </div>

                  <div className="quick-action-card" onClick={() => setActiveTab('loans')}>
                    <div className="quick-action-icon">
                      <Eye size={24} />
                    </div>
                    <h4>Loan History</h4>
                    <p>View all your past loans</p>
                  </div>

                  <div className="quick-action-card">
                    <div className="quick-action-icon">
                      <Phone size={24} />
                    </div>
                    <h4>Contact Support</h4>
                    <p>Get help from customer service</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* My Stats Tab */}
          {activeTab === 'mystats' && (
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
          )}

          {/* Loans Tab */}
          {activeTab === 'loans' && (
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
                  {customerData.loans && customerData.loans.length > 0 ? (
                    customerData.loans.map((loan) => (
                      <div key={loan.id} className={`loan-card ${loan.status}`}>
                        <div className="loan-header">
                          <div className="loan-id">{loan.id}</div>
                          <span className={`loan-status ${loan.status}`}>
                            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                          </span>
                        </div>
                        <div className="loan-body">
                          <div className="loan-amount">
                            KSH {loan.amount.toLocaleString()}
                          </div>
                          <div className="loan-balance">
                            Balance: KSH {loan.balance ? loan.balance.toLocaleString() : 'N/A'}
                          </div>
                          <div className="loan-comments">
                            <h5>Lender Comments</h5>
                            <p>{loan.lenderComments || 'No comments yet'}</p>
                          </div>
                        </div>
                        <div className="loan-actions">
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => navigate(`/loans/${loan.id}`)}
                          >
                            View Details
                          </button>
                          <button className="btn btn-sm btn-secondary">Make Payment</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No loans found. Apply for a loan to get started.</p>
                  )}

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
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
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
                        {new Date(payment.date).toLocaleDateString()}
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
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              {customerData && Object.keys(customerData).length > 0 ? (
                <>
                  {console.log('Rendering CustomerProfile with customerData:', customerData)}
                  <CustomerProfile 
                    customer={customerData} 
                    onUpdate={(updatedCustomer) => setCustomerData(updatedCustomer)} 
                    onDelete={() => navigate('/')} 
                    onClose={() => setActiveTab('overview')}
                  />
                </>
              ) : (
                <div>Loading profile...</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard