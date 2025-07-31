import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Plus,
  Eye,
  Phone,
  MapPin,
  Calendar,
  CreditCard
} from 'lucide-react'
import { analyticsService } from '../../services/analyticsService'
import { customerService } from '../../services/customerService'

const LenderDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('overview')

  const [stats, setStats] = useState({
    myCustomers: 0,
    activeLoans: 0,
    totalLoanValue: 0, // KSH
    collectionRate: 0,
    overduePayments: 0,
    todayTarget: 0,
    todayCollected: 0
  })

  const [recentCustomers, setRecentCustomers] = useState([])
  const [todayTasks, setTodayTasks] = useState([])
  const [lenderCustomers, setLenderCustomers] = useState([])

  useEffect(() => {
    const handleTabChange = (e) => {
      setActiveTab(e.detail)
    }
    window.addEventListener('lenderTabChange', handleTabChange)
    return () => {
      window.removeEventListener('lenderTabChange', handleTabChange)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (activeTab === 'customers') {
      fetchLenderCustomers()
    }
  }, [activeTab])

  const fetchDashboardData = async () => {
    try {
      const overview = await analyticsService.getOverview()
      // Map overview data to stats state
      setStats({
        myCustomers: overview.myCustomers || 0,
        activeLoans: overview.activeLoans || 0,
        totalLoanValue: overview.totalLoanValue || 0,
        collectionRate: overview.collectionRate || 0,
        overduePayments: overview.overduePayments || 0,
        todayTarget: overview.todayTarget || 0,
        todayCollected: overview.todayCollected || 0
      })

      // For recentCustomers and todayTasks, you may need additional API calls or data processing
      // For now, clear mock data
      setRecentCustomers([])
      setTodayTasks([])

    } catch (error) {
      console.error('Failed to fetch lender dashboard data:', error)
    }
  }

  const fetchLenderCustomers = async () => {
    try {
      const response = await customerService.getMyCustomers()
      setLenderCustomers(response)
    } catch (error) {
      console.error('Failed to fetch lender customers:', error)
    }
  }

  const getBusinessTypeIcon = (type) => {
    const icons = {
      mama_mboga: '🥬',
      general_store: '🏪',
      restaurant: '🍽️',
      salon: '💇‍♀️',
      tailoring: '👗',
      transport: '🚗',
      other: '🏢'
    }
    return icons[type] || '🏢'
  }

  const StatCard = ({ title, value, icon: Icon, color, change, subtitle }) => (
    <div className="stat-card">
      <div className="stat-header">
        <div className={`stat-icon ${color}`}>
          {Icon && <Icon size={24} />}
        </div>
        {change && (
          <span className={`stat-change ${change > 0 ? 'positive' : 'negative'}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="stat-content">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  )

  return (
    <div className="lender-dashboard">
      <div className="dashboard-header">
        <h1 className="heading-2">
          Welcome back, {user?.full_name?.split(' ')[0] || 'Lender'}! 👋
        </h1>
        <p className="text-muted">
          Here's your portfolio overview for today
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
          className={`tab-button ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          My Customers
        </button>
        <button 
          className={`tab-button ${activeTab === 'loans' ? 'active' : ''}`}
          onClick={() => setActiveTab('loans')}
        >
          Loans
        </button>
        <button 
          className={`tab-button ${activeTab === 'collections' ? 'active' : ''}`}
          onClick={() => setActiveTab('collections')}
        >
          Collections
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard
              title="My Customers"
              value={stats.myCustomers}
              icon={Users}
              color="blue"
              change={8}
            />
            <StatCard
              title="Active Loans"
              value={stats.activeLoans}
              icon={DollarSign}
              color="green"
              subtitle={`KSH ${(stats.totalLoanValue / 1000).toFixed(0)}K total`}
            />
            <StatCard
              title="Collection Rate"
              value={`${stats.collectionRate}%`}
              icon={TrendingUp}
              color="purple"
              change={2.1}
            />
            <StatCard
              title="Today's Target"
              value={`KSH ${(stats.todayCollected / 1000).toFixed(0)}K`}
              icon={CreditCard}
              color="orange"
              subtitle={`of ${(stats.todayTarget / 1000).toFixed(0)}K target`}
            />
            <StatCard
              title="Overdue Payments"
              value={stats.overduePayments}
              icon={AlertCircle}
              color="red"
            />
          </div>

          {/* Today's Tasks */}
          <div className="dashboard-content">
            <div className="card">
              <div className="card-header">
                <h3 className="heading-3">Today's Schedule</h3>
                <span className="badge badge-info">{todayTasks.length} tasks</span>
              </div>
              <div className="card-body">
                <div className="task-list">
                  {todayTasks.map((task, index) => (
                    <div key={index} className="task-item">
                      <div className="task-time">{task.time}</div>
                      <div className="task-details">
                        <div className="task-type">
                          {task.type === 'payment_due' && '💰 Payment Collection'}
                          {task.type === 'new_customer' && '👤 New Customer Meeting'}
                          {task.type === 'loan_followup' && '📋 Loan Follow-up'}
                        </div>
                        <div className="task-info">
                          <span className="customer-name">{task.customer}</span>
                          <span className="task-location">📍 {task.location}</span>
                          {task.amount && (
                            <span className="task-amount">KSH {task.amount.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="task-actions">
                        <button className="btn btn-sm btn-primary">
                          <Phone size={14} />
                          Call
                        </button>
                        <button className="btn btn-sm btn-secondary">
                          <MapPin size={14} />
                          Navigate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Customers */}
            <div className="card">
              <div className="card-header">
                <h3 className="heading-3">Recent Customers</h3>
                <button className="btn btn-primary">
                  <Plus size={16} />
                  Add Customer
                </button>
              </div>
              <div className="card-body">
                <div className="customer-list">
                  {recentCustomers.map(customer => (
                    <div key={customer.id} className="customer-item">
                      <div className="customer-avatar">
                        {getBusinessTypeIcon(customer.business_type)}
                      </div>
                      <div className="customer-info">
                        <h4>{customer.full_name}</h4>
                        <p>{customer.business_name}</p>
                        <div className="customer-meta">
                          <span>📱 {customer.phone}</span>
                          <span>📍 {customer.location}</span>
                          <span>📅 {customer.created_at}</span>
                        </div>
                      </div>
                      <div className="customer-status">
                        {customer.active_loan ? (
                          <div className="loan-info">
                            <div className="loan-amount">
                              KSH {customer.active_loan.amount.toLocaleString()}
                            </div>
                            <div className="next-payment">
                              Next: {customer.active_loan.next_payment}
                            </div>
                            <div className="payment-amount">
                              KSH {customer.active_loan.payment_amount.toLocaleString()}
                            </div>
                          </div>
                        ) : (
                          <div className="no-loan">
                            <span>No active loan</span>
                            <button className="btn btn-sm btn-outline">Create Loan</button>
                          </div>
                        )}
                      </div>
                      <div className="customer-actions">
                        <button className="btn btn-sm btn-secondary">
                          <Eye size={14} />
                          View
                        </button>
                        <button className="btn btn-sm btn-primary">
                          <Phone size={14} />
                          Call
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Other tabs content */}
      {activeTab === 'customers' && (
        <div className="dashboard-content">
          <div className="card">
            <div className="card-header">
              <h3 className="heading-3">My Customers</h3>
            </div>
            <div className="card-body">
              {lenderCustomers.length === 0 ? (
                <p>No customers found.</p>
              ) : (
                <div className="customer-list">
                  {lenderCustomers.map(customer => (
                    <div key={customer.id} className="customer-item">
                      <div className="customer-avatar">
                        {getBusinessTypeIcon(customer.business_type)}
                      </div>
                      <div className="customer-info">
                        <h4>{customer.full_name}</h4>
                        <p>{customer.business_name}</p>
                        <div className="customer-meta">
                          <span>📱 {customer.phone}</span>
                          <span>📍 {customer.location}</span>
                        </div>
                      </div>
                      <div className="customer-actions">
                        <button className="btn btn-sm btn-secondary">
                          <Eye size={14} />
                          View
                        </button>
                        <button className="btn btn-sm btn-primary">
                          <Phone size={14} />
                          Call
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'loans' && (
        <div className="dashboard-content">
          <div className="card">
            <div className="card-header">
              <h3 className="heading-3">Loan Management</h3>
            </div>
            <div className="card-body">
              <p>Loan management interface will be implemented here...</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'collections' && (
        <div className="dashboard-content">
          <div className="card">
            <div className="card-header">
              <h3 className="heading-3">Payment Collections</h3>
            </div>
            <div className="card-body">
              <p>Payment collection interface will be implemented here...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LenderDashboard
