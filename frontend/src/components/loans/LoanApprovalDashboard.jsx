import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  User,
  DollarSign,
  Calendar,
  FileText,
  Phone,
  MapPin,
  TrendingUp,
  Shield,
  Camera,
  Download,
  Filter,
  Search,
  RefreshCw,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from 'lucide-react'
import LoanApplicationReview from './LoanApplicationReview'
import CreditScoring from './CreditScoring'
import { loanService } from '../../services/loanService'
import '../../styles/loan-approval.css'

const LoanApprovalDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('pending')
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date_desc')

  const [applications, setApplications] = useState([])
  const [stats, setStats] = useState({
    pending: 0,
    underReview: 0,
    requiresAttention: 0,
    approved: 0,
    rejected: 0,
    totalValue: 0,
    averageAmount: 0,
    averageProcessingTime: 0
  })

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await loanService.getLoanApplications()
        setApplications(response.data || [])
      } catch (error) {
        console.error('Failed to fetch loan applications:', error)
      }
    }

    const fetchStats = async () => {
      try {
        // Assuming an API endpoint exists for loan stats, else calculate from applications
        // For now, calculate from applications
        const apps = applications
        const pending = apps.filter(a => a.status === 'pending').length
        const underReview = apps.filter(a => a.status === 'under_review').length
        const requiresAttention = apps.filter(a => a.status === 'requires_attention').length
        const approved = apps.filter(a => a.status === 'approved').length
        const rejected = apps.filter(a => a.status === 'rejected').length
        const totalValue = apps.reduce((sum, a) => sum + (a.loan?.amount || 0), 0)
        const averageAmount = apps.length > 0 ? totalValue / apps.length : 0
        const averageProcessingTime = 0 // Placeholder

        setStats({
          pending,
          underReview,
          requiresAttention,
          approved,
          rejected,
          totalValue,
          averageAmount,
          averageProcessingTime
        })
      } catch (error) {
        console.error('Failed to calculate loan stats:', error)
      }
    }

    fetchApplications()
  }, [])

  useEffect(() => {
    // Recalculate stats when applications change
    const apps = applications
    const pending = apps.filter(a => a.status === 'pending').length
    const underReview = apps.filter(a => a.status === 'under_review').length
    const requiresAttention = apps.filter(a => a.status === 'requires_attention').length
    const approved = apps.filter(a => a.status === 'approved').length
    const rejected = apps.filter(a => a.status === 'rejected').length
    const totalValue = apps.reduce((sum, a) => sum + (a.loan?.amount || 0), 0)
    const averageAmount = apps.length > 0 ? totalValue / apps.length : 0
    const averageProcessingTime = 0 // Placeholder

    setStats({
      pending,
      underReview,
      requiresAttention,
      approved,
      rejected,
      totalValue,
      averageAmount,
      averageProcessingTime
    })
  }, [applications])

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#F59E0B',
      'under_review': '#3B82F6',
      'requires_attention': '#EF4444',
      'approved': '#10B981',
      'rejected': '#6B7280',
      'disbursed': '#059669'
    }
    return colors[status] || '#6B7280'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      'urgent': '#EF4444',
      'high': '#F59E0B',
      'medium': '#3B82F6',
      'low': '#6B7280'
    }
    return colors[priority] || '#6B7280'
  }

  const getRiskColor = (score) => {
    if (score >= 70) return '#10B981' // Green
    if (score >= 50) return '#F59E0B' // Orange
    return '#EF4444' // Red
  }

  const getRecommendationIcon = (action) => {
    switch (action) {
      case 'approve':
        return <CheckCircle size={16} style={{ color: '#10B981' }} />
      case 'reject':
        return <XCircle size={16} style={{ color: '#EF4444' }} />
      case 'conditional':
        return <AlertTriangle size={16} style={{ color: '#F59E0B' }} />
      default:
        return <Clock size={16} style={{ color: '#6B7280' }} />
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesTab = activeTab === 'all' || 
                     (activeTab === 'pending' && app.status === 'pending') ||
                     (activeTab === 'review' && app.status === 'under_review') ||
                     (activeTab === 'attention' && app.status === 'requires_attention')
    
    const matchesSearch = searchTerm === '' || 
                         app.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.customer.business.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || app.status === filterStatus
    
    return matchesTab && matchesSearch && matchesFilter
  })

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case 'date_desc':
        return new Date(b.appliedDate) - new Date(a.appliedDate)
      case 'date_asc':
        return new Date(a.appliedDate) - new Date(b.appliedDate)
      case 'amount_desc':
        return b.loan.amount - a.loan.amount
      case 'amount_asc':
        return a.loan.amount - b.loan.amount
      case 'risk_desc':
        return b.riskScore - a.riskScore
      case 'risk_asc':
        return a.riskScore - b.riskScore
      default:
        return 0
    }
  })

  const handleReviewApplication = (application) => {
    setSelectedApplication(application)
    setShowReviewModal(true)
  }

  const handleQuickAction = (applicationId, action) => {
    setApplications(prev => prev.map(app => {
      if (app.id === applicationId) {
        return {
          ...app,
          status: action === 'approve' ? 'approved' : 'rejected',
          timeline: [
            ...app.timeline,
            {
              date: new Date().toISOString(),
              action: `Application ${action}d`,
              user: user?.full_name
            }
          ]
        }
      }
      return app
    }))

    // Update stats
    setStats(prev => ({
      ...prev,
      [action === 'approve' ? 'approved' : 'rejected']: prev[action === 'approve' ? 'approved' : 'rejected'] + 1,
      pending: prev.pending - 1
    }))
  }

  const StatsOverview = () => (
    <div className="approval-stats">
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending Review</div>
            <div className="stat-subtitle">Awaiting decision</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <Eye size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.underReview}</div>
            <div className="stat-label">Under Review</div>
            <div className="stat-subtitle">Being processed</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.requiresAttention}</div>
            <div className="stat-label">Needs Attention</div>
            <div className="stat-subtitle">Urgent review required</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">KSH {(stats.totalValue / 1000000).toFixed(1)}M</div>
            <div className="stat-label">Total Value</div>
            <div className="stat-subtitle">Pending applications</div>
          </div>
        </div>
      </div>
    </div>
  )

  const ApplicationCard = ({ application }) => (
    <div className={`application-card ${application.status} priority-${application.priority}`}>
      <div className="application-header">
        <div className="customer-info">
          <div className="customer-avatar">
            {application.customer.avatar ? (
              <img src={application.customer.avatar} alt={application.customer.name} />
            ) : (
              application.customer.name.charAt(0)
            )}
          </div>
          <div className="customer-details">
            <h4>{application.customer.name}</h4>
            <p>{application.customer.business}</p>
            <div className="customer-meta">
              <span>
                <MapPin size={12} />
                {application.customer.location}
              </span>
              <span>
                <Phone size={12} />
                {application.customer.phone}
              </span>
            </div>
          </div>
        </div>

        <div className="application-badges">
          <span 
            className="status-badge"
            style={{ backgroundColor: `${getStatusColor(application.status)}20`, color: getStatusColor(application.status) }}
          >
            {application.status.replace('_', ' ')}
          </span>
          <span 
            className="priority-badge"
            style={{ backgroundColor: `${getPriorityColor(application.priority)}20`, color: getPriorityColor(application.priority) }}
          >
            {application.priority}
          </span>
        </div>
      </div>

      <div className="application-content">
        <div className="loan-summary">
          <div className="loan-amount">
            <DollarSign size={16} />
            <span>KSH {application.loan.amount.toLocaleString()}</span>
          </div>
          <div className="loan-details">
            <span>{application.loan.duration} months</span>
            <span>{application.loan.type}</span>
            <span>{application.loan.frequency} payments</span>
          </div>
        </div>

        <div className="risk-assessment">
          <div className="risk-score">
            <div className="risk-circle" style={{ borderColor: getRiskColor(application.riskScore) }}>
              <span>{application.riskScore}</span>
            </div>
            <div className="risk-details">
              <span>Risk Score</span>
              <span className="risk-level">
                {application.riskScore >= 70 ? 'Low Risk' : 
                 application.riskScore >= 50 ? 'Medium Risk' : 'High Risk'}
              </span>
            </div>
          </div>

          <div className="ai-recommendation">
            {getRecommendationIcon(application.recommendedAction)}
            <span>AI Recommends: {application.recommendedAction}</span>
          </div>
        </div>

        <div className="customer-history">
          <div className="history-item">
            <Star size={14} />
            <span>Credit Score: {application.customer.creditScore}</span>
          </div>
          {application.customer.repaymentHistory && (
            <div className="history-item">
              <TrendingUp size={14} />
              <span>Payment History: {application.customer.repaymentHistory}%</span>
            </div>
          )}
          <div className="history-item">
            <Calendar size={14} />
            <span>Member since: {new Date(application.customer.memberSince).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="document-status">
          <h5>Document Status</h5>
          <div className="documents-grid">
            {Object.entries(application.documents).map(([key, doc]) => (
              <div key={key} className={`document-item ${doc.verified ? 'verified' : doc.uploaded ? 'uploaded' : 'missing'}`}>
                <div className="document-icon">
                  {doc.verified ? <CheckCircle size={12} /> : 
                   doc.uploaded ? <Clock size={12} /> : 
                   <XCircle size={12} />}
                </div>
                <span>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ai-insights">
          <h5>AI Insights</h5>
          <ul>
            {application.aiInsights.slice(0, 2).map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="application-actions">
        <div className="quick-actions">
          <button 
            className="btn btn-sm btn-success"
            onClick={() => handleQuickAction(application.id, 'approve')}
          >
            <ThumbsUp size={14} />
            Quick Approve
          </button>
          <button 
            className="btn btn-sm btn-danger"
            onClick={() => handleQuickAction(application.id, 'reject')}
          >
            <ThumbsDown size={14} />
            Quick Reject
          </button>
        </div>

        <div className="detailed-actions">
          <button 
            className="btn btn-sm btn-primary"
            onClick={() => handleReviewApplication(application)}
          >
            <Eye size={14} />
            Detailed Review
          </button>
          <button className="btn btn-sm btn-secondary">
            <MessageSquare size={14} />
            Contact
          </button>
        </div>
      </div>

      <div className="application-footer">
        <div className="application-timeline">
          <span>Applied: {new Date(application.appliedDate).toLocaleDateString()}</span>
          <span>•</span>
          <span>Last activity: {new Date(application.timeline[application.timeline.length - 1].date).toLocaleDateString()}</span>
        </div>
        <div className="application-id">
          {application.id}
        </div>
      </div>
    </div>
  )

  return (
    <div className="loan-approval-dashboard">
      <div className="approval-header">
        <div className="header-content">
          <h1>Loan Applications</h1>
          <p>Review and approve loan applications from your customers</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="btn btn-secondary">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      <StatsOverview />

      {/* Tabs */}
      <div className="approval-tabs">
        <button 
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({stats.pending})
        </button>
        <button 
          className={`tab-button ${activeTab === 'review' ? 'active' : ''}`}
          onClick={() => setActiveTab('review')}
        >
          Under Review ({stats.underReview})
        </button>
        <button 
          className={`tab-button ${activeTab === 'attention' ? 'active' : ''}`}
          onClick={() => setActiveTab('attention')}
        >
          Needs Attention ({stats.requiresAttention})
        </button>
        <button 
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Applications
        </button>
      </div>

      {/* Filters */}
      <div className="approval-filters">
        <div className="search-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
            <option value="risk_desc">Highest Risk</option>
            <option value="risk_asc">Lowest Risk</option>
          </select>

          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="requires_attention">Needs Attention</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      <div className="applications-grid">
        {sortedApplications.map(application => (
          <ApplicationCard key={application.id} application={application} />
        ))}
      </div>

      {sortedApplications.length === 0 && (
        <div className="empty-state">
          <FileText size={64} style={{ color: 'var(--gray-400)' }} />
          <h3>No applications found</h3>
          <p>Try adjusting your search criteria or check back later for new applications.</p>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedApplication && (
        <LoanApplicationReview
          application={selectedApplication}
          onClose={() => {
            setShowReviewModal(false)
            setSelectedApplication(null)
          }}
          onUpdate={(updatedApp) => {
            setApplications(prev => prev.map(app => 
              app.id === updatedApp.id ? updatedApp : app
            ))
            setShowReviewModal(false)
            setSelectedApplication(null)
          }}
        />
      )}
    </div>
  )
}

export default LoanApprovalDashboard
