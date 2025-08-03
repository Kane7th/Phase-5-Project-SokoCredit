import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  Users, 
  UserCheck, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Building, 
  Eye, 
  Check, 
  X 
} from 'lucide-react'
import { adminService } from '../../services/adminService'
import AnalyticsDashboard from '../analytics/AnalyticsDashboard'
import AddLenderForm from './AddLenderForm'
import LoanPortfolio from './LoanPortfolio'
import '../../styles/dashboard.css'
import '../../styles/adminDashboard.css'

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  console.log('AdminDashboard user:', user)
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddLenderForm, setShowAddLenderForm] = useState(false)

  const [lenders, setLenders] = useState([])
  const [pendingLendersList, setPendingLendersList] = useState([])

  useEffect(() => {
    const handleTabChange = (e) => {
      setActiveTab(e.detail)
    }
    window.addEventListener('adminTabChange', handleTabChange)
    return () => {
      window.removeEventListener('adminTabChange', handleTabChange)
    }
  }, [])

  const [stats, setStats] = useState({
    totalLenders: 0,
    pendingLenders: 0,
    activeLenders: 0,
    totalCustomers: 0,
    totalLoans: 0, // KSH
    systemHealth: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminService.getDashboardStats()
        setStats({
          totalLenders: response.totalLenders || 0,
          pendingLenders: response.pendingLenders || 0,
          activeLenders: response.activeLenders || 0,
          totalCustomers: response.totalCustomers || 0,
          totalLoans: response.totalLoans || 0,
          systemHealth: response.systemHealth || 0
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    const fetchPendingLenders = async () => {
      try {
        const response = await adminService.listPendingLenders()
        setPendingLendersList(response || [])
      } catch (error) {
        console.error('Failed to fetch pending lenders:', error)
      }
    }

    const fetchLenders = async () => {
      try {
        const response = await adminService.listLenders()
        setLenders(response || [])
      } catch (error) {
        console.error('Failed to fetch lenders:', error)
      }
    }

    fetchStats()
    fetchPendingLenders()
    fetchLenders()
  }, [])

  const fetchLenders = async () => {
    try {
      const response = await adminService.listLenders()
      setLenders(response || [])
    } catch (error) {
      console.error('Failed to fetch lenders:', error)
    }
  }

  const fetchPendingLenders = async () => {
    try {
      const response = await adminService.listPendingLenders()
      setPendingLendersList(response || [])
    } catch (error) {
      console.error('Failed to fetch pending lenders:', error)
    }
  }

  const handleApproveLender = async (lenderId) => {
    try {
      await adminService.approveLender(lenderId)
      setPendingLendersList(prev => prev.filter(l => l.id !== lenderId))
      setStats(prev => ({
        ...prev,
        pendingLenders: prev.pendingLenders - 1,
        activeLenders: prev.activeLenders + 1
      }))
    } catch (error) {
      console.error('Failed to approve lender:', error)
    }
  }

  const handleRejectLender = async (lenderId) => {
    try {
      await adminService.rejectLender(lenderId)
      setPendingLendersList(prev => prev.filter(l => l.id !== lenderId))
      setStats(prev => ({
        ...prev,
        pendingLenders: prev.pendingLenders - 1
      }))
    } catch (error) {
      console.error('Failed to reject lender:', error)
    }
  }

  const StatCard = ({ title, value, icon, color, change }) => (
    <div className="stat-card">
      <div className="stat-header">
        <div className={`stat-icon ${color}`}>
          {icon}
        </div>
        {change !== undefined && (
          <span className={`stat-change ${change > 0 ? 'positive' : 'negative'}`}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="stat-content">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
      </div>
    </div>
  )


  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1 className="heading-2">
          Admin Dashboard 👑
        </h1>
        <p className="text-muted">
          System overview and lender management
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-nav">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'lenders' ? 'active' : ''}`}
          onClick={() => setActiveTab('lenders')}
        >
          Lender Management
        </button>
        <button
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button
          className={`tab-button ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          Loan Portfolio
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard
              title="Total Lenders"
              value={stats.totalLenders}
              icon={<Users size={24} />}
              color="blue"
              change={12}
            />
            <StatCard
              title="Pending Approvals"
              value={stats.pendingLenders}
              icon={<Clock size={24} />}
              color="orange"
            />
            <StatCard
              title="Active Lenders"
              value={stats.activeLenders}
              icon={<UserCheck size={24} />}
              color="green"
              change={8}
            />
            <StatCard
              title="Total Customers"
              value={stats.totalCustomers.toLocaleString()}
              icon={<Building size={24} />}
              color="purple"
              change={15}
            />
            <StatCard
              title="Total Loans Value"
              value={`KSH ${(stats.totalLoans / 1000000).toFixed(1)}M`}
              icon={<DollarSign size={24} />}
              color="green"
              change={22}
            />
            <StatCard
              title="System Health"
              value={`${stats.systemHealth}%`}
              icon={<TrendingUp size={24} />}
              color="blue"
            />
          </div>

          {/* Quick Actions */}
          <div className="dashboard-content">
            <div className="card">
              <div className="card-header">
                <h3 className="heading-3">Pending Lender Approvals</h3>
                <span className="badge badge-warning">{stats.pendingLenders} pending</span>
              </div>
              <div className="card-body">
                {pendingLendersList.length === 0 ? (
                  <div className="empty-state">
                    <UserCheck size={48} style={{ color: 'var(--gray-400)' }} />
                    <h4>All caught up!</h4>
                    <p>No pending lender applications to review.</p>
                  </div>
                ) : (
                  <div className="lender-list">
                    {pendingLendersList.map(lender => (
                      <div key={lender.id} className="lender-item">
                        <div className="lender-info">
                          <div className="lender-avatar">
                            {lender.full_name ? lender.full_name.charAt(0) : '?'}
                          </div>
                          <div className="lender-details">
                            <h4>{lender.full_name}</h4>
                            <p>{lender.business_name}</p>
                            <div className="lender-meta">
                              <span>📧 {lender.email}</span>
                              <span>📱 {lender.phone}</span>
                              <span>📍 {lender.location}</span>
                              <span>📅 Applied {lender.created_at}</span>
                            </div>
                          </div>
                        </div>
                        <div className="lender-status">
                          <div className="document-status">
                            {lender.documents_complete ? (
                              <span className="status-complete">✅ Documents Complete</span>
                            ) : (
                              <span className="status-incomplete">⚠️ Documents Incomplete</span>
                            )}
                          </div>
                          <div className="lender-actions">
                            <button className="btn btn-sm btn-secondary">
                              <Eye size={16} />
                              Review
                            </button>
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => handleApproveLender(lender.id)}
                              disabled={!lender.documents_complete}
                            >
                              <Check size={16} />
                              Approve
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleRejectLender(lender.id)}
                            >
                              <X size={16} />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Lender Management Tab */}
          {activeTab === 'lenders' && (
            <div className="dashboard-content">
              <div className="card">
                <div className="card-header">
                  <h3 className="heading-3">All Lenders</h3>
                  <div className="header-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowAddLenderForm(true)}
                    >
                      Add New Lender
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  {showAddLenderForm ? (
                    <AddLenderForm 
                      onClose={() => setShowAddLenderForm(false)} 
                      onLenderAdded={() => {
                        setShowAddLenderForm(false)
                        fetchLenders()
                        fetchPendingLenders()
                      }}
                    />
                  ) : (
                    <>
                      {lenders.length === 0 && pendingLendersList.length === 0 ? (
                        <p>No lenders found.</p>
                      ) : (
                        <>
                          {pendingLendersList.length > 0 && (
                            <>
                              <h4>Pending Lenders</h4>
                              <table className="lender-table pending">
                                <thead>
                                  <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Organisation</th>
                                    <th>Loan Product</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {pendingLendersList.map((lender) => (
                                    <tr key={lender.id}>
                                      <td>{lender.name}</td>
                                      <td>{lender.email}</td>
                                      <td>{lender.phone}</td>
                                      <td>{lender.organisation || '-'}</td>
                                      <td>{lender.loan_product || '-'}</td>
                                      <td>{lender.status}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </>
                          )}
                          {lenders.length > 0 && (
                            <>
                              <h4>Approved Lenders</h4>
                              <table className="lender-table approved">
                                <thead>
                                  <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Organisation</th>
                                    <th>Loan Product</th>
                                    <th>Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {lenders.map((lender) => (
                                    <tr key={lender.id}>
                                      <td>{lender.name}</td>
                                      <td>{lender.email}</td>
                                      <td>{lender.phone}</td>
                                      <td>{lender.organisation || '-'}</td>
                                      <td>{lender.loan_product || '-'}</td>
                                      <td>{lender.status}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="dashboard-content">
          <AnalyticsDashboard />
        </div>
      )}

      {/* Loan Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <div className="dashboard-content">
          <LoanPortfolio />
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
