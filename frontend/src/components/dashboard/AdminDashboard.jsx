import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  Users, 
  UserCheck, 
  UserX, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Eye,
  Check,
  X,
  Clock,
  Building
} from 'lucide-react'
import { customerService } from '../../services/customerService'
import AnalyticsDashboard from '../analytics/AnalyticsDashboard'
import '../../styles/dashboard.css'

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  console.log('AdminDashboard user:', user)
  const [activeTab, setActiveTab] = useState('overview')

  React.useEffect(() => {
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

  const [pendingLenders, setPendingLenders] = useState([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await customerService.getCustomerStats()
        setStats({
          totalLenders: response.data.totalLenders || 0,
          pendingLenders: response.data.pendingLenders || 0,
          activeLenders: response.data.activeLenders || 0,
          totalCustomers: response.data.totalCustomers || 0,
          totalLoans: response.data.totalLoans || 0,
          systemHealth: response.data.systemHealth || 0
        })
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }

    const fetchPendingLenders = async () => {
      try {
        const response = await customerService.listCustomers({ status: 'pending', role: 'lender' })
        setPendingLenders(response.data.customers || [])
      } catch (error) {
        console.error('Failed to fetch pending lenders:', error)
      }
    }

    fetchStats()
    fetchPendingLenders()
  }, [])

  const handleApproveLender = (lenderId) => {
    setPendingLenders(prev => prev.filter(l => l.id !== lenderId))
    setStats(prev => ({
      ...prev,
      pendingLenders: prev.pendingLenders - 1,
      activeLenders: prev.activeLenders + 1
    }))
    // TODO: API call to approve lender
  }

  const handleRejectLender = (lenderId) => {
    setPendingLenders(prev => prev.filter(l => l.id !== lenderId))
    setStats(prev => ({
      ...prev,
      pendingLenders: prev.pendingLenders - 1
    }))
    // TODO: API call to reject lender
  }

  const StatCard = ({ title, value, icon, color, change }) => (
    <div className="stat-card">
      <div className="stat-header">
        <div className={`stat-icon ${color}`}>
          {icon}
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
              {pendingLenders.length === 0 ? (
                <div className="empty-state">
                  <UserCheck size={48} style={{ color: 'var(--gray-400)' }} />
                  <h4>All caught up!</h4>
                  <p>No pending lender applications to review.</p>
                </div>
              ) : (
                <div className="lender-list">
                  {pendingLenders.map(lender => (
                    <div key={lender.id} className="lender-item">
                      <div className="lender-info">
                        <div className="lender-avatar">
                          {lender.full_name.charAt(0)}
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
              <button className="btn btn-primary">Add New Lender</button>
            </div>
          </div>
          <div className="card-body">
            <p>Lender management interface will be implemented here...</p>
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

    {/* Loans Tab */}
    {activeTab === 'loans' && (
      <div className="dashboard-content">
        <div className="card">
          <div className="card-header">
            <h3 className="heading-3">Loan Portfolio</h3>
          </div>
          <div className="card-body">
            <p>Loan portfolio management interface will be implemented here...</p>
          </div>
        </div>
      </div>
    )}

    {/* Reports Tab */}
    {activeTab === 'reports' && (
      <div className="dashboard-content">
        <div className="card">
          <div className="card-header">
            <h3 className="heading-3">Reports</h3>
          </div>
          <div className="card-body">
            <p>Reports and analytics interface will be implemented here...</p>
          </div>
        </div>
      </div>
    )}

    {/* Settings Tab */}
    {activeTab === 'settings' && (
      <div className="dashboard-content">
        <div className="card">
          <div className="card-header">
            <h3 className="heading-3">System Settings</h3>
          </div>
          <div className="card-body">
            <p>System settings interface will be implemented here...</p>
          </div>
        </div>
      </div>
    )}
    </div>
  )
}

export default AdminDashboard
