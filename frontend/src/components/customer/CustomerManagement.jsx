import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Eye, 
  Phone, 
  MessageSquare,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Building,
  CreditCard,
  FileText,
  Edit,
  Trash2,
  Send,
  UserPlus,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react'
import CustomerProfile from './CustomerProfile'
import AddCustomerModal from './AddCustomerModal'
import { customerService } from '../../services/customerService'
import '../../styles/customer-management.css'

const CustomerManagement = () => {
  const { user } = useSelector((state) => state.auth)
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterSegment, setFilterSegment] = useState('all')
  const [sortBy, setSortBy] = useState('name_asc')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showCustomerProfile, setShowCustomerProfile] = useState(false)
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [selectedCustomers, setSelectedCustomers] = useState([])

  const [customers, setCustomers] = useState([])
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    newThisMonth: 0,
    watchList: 0,
    totalPortfolio: 0,
    averageScore: 0,
    collectionRate: 0
  })

  useEffect(() => {
    fetchCustomers()
    fetchStats()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await customerService.listCustomers()
      setCustomers(response.data)
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await customerService.getCustomerStats()
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch customer stats:', error)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'active': '#10B981',
      'inactive': '#6B7280',
      'watch_list': '#F59E0B',
      'suspended': '#EF4444'
    }
    return colors[status] || '#6B7280'
  }

  const getRiskColor = (risk) => {
    const colors = {
      'low': '#10B981',
      'medium': '#F59E0B',
      'high': '#EF4444'
    }
    return colors[risk] || '#6B7280'
  }

  const getSegmentColor = (segment) => {
    const colors = {
      'premium': '#8B5CF6',
      'standard': '#3B82F6',
      'basic': '#6B7280'
    }
    return colors[segment] || '#6B7280'
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = searchTerm === '' || 
                         customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm) ||
                         customer.business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.business.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus
    const matchesSegment = filterSegment === 'all' || customer.segment === filterSegment
    
    return matchesSearch && matchesStatus && matchesSegment
  })

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortBy) {
      case 'name_asc':
        return a.name.localeCompare(b.name)
      case 'name_desc':
        return b.name.localeCompare(a.name)
      case 'score_desc':
        return b.creditProfile.score - a.creditProfile.score
      case 'score_asc':
        return a.creditProfile.score - b.creditProfile.score
      case 'balance_desc':
        return b.creditProfile.currentBalance - a.creditProfile.currentBalance
      case 'balance_asc':
        return a.creditProfile.currentBalance - b.creditProfile.currentBalance
      case 'date_desc':
        return new Date(b.registrationDate) - new Date(a.registrationDate)
      case 'date_asc':
        return new Date(a.registrationDate) - new Date(b.registrationDate)
      default:
        return 0
    }
  })

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    )
  }

  const handleBulkAction = async (action) => {
    try {
      await customerService.bulkAction({ action, customerIds: selectedCustomers })
      setSelectedCustomers([])
      fetchCustomers()
    } catch (error) {
      console.error('Bulk action failed:', error)
    }
  }

  const StatsOverview = () => (
    <div className="customer-stats">
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalCustomers}</div>
            <div className="stat-label">Total Customers</div>
            <div className="stat-change positive">+{stats.newThisMonth} this month</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeCustomers}</div>
            <div className="stat-label">Active Customers</div>
            <div className="stat-subtitle">{((stats.activeCustomers / stats.totalCustomers) * 100).toFixed(1)}% of total</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.watchList}</div>
            <div className="stat-label">Watch List</div>
            <div className="stat-subtitle">Require attention</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">KSH {(stats.totalPortfolio / 1000000).toFixed(1)}M</div>
            <div className="stat-label">Total Portfolio</div>
            <div className="stat-subtitle">Outstanding loans</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Star size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.averageScore}</div>
            <div className="stat-label">Avg Credit Score</div>
            <div className="stat-subtitle">Portfolio average</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.collectionRate}%</div>
            <div className="stat-label">Collection Rate</div>
            <div className="stat-subtitle">Last 30 days</div>
          </div>
        </div>
      </div>
    </div>
  )

  const CustomerCard = ({ customer }) => (
    <div className={`customer-card ${customer.status} ${selectedCustomers.includes(customer.id) ? 'selected' : ''}`}>
      <div className="card-header">
        <div className="customer-select">
          <input
            type="checkbox"
            checked={selectedCustomers.includes(customer.id)}
            onChange={() => handleCustomerSelect(customer.id)}
          />
        </div>
        <div className="customer-avatar">
          {customer.name.charAt(0)}
        </div>
        <div className="customer-badges">
          <span 
            className="status-badge"
            style={{ backgroundColor: `${getStatusColor(customer.status)}20`, color: getStatusColor(customer.status) }}
          >
            {customer.status.replace('_', ' ')}
          </span>
          <span 
            className="segment-badge"
            style={{ backgroundColor: `${getSegmentColor(customer.segment)}20`, color: getSegmentColor(customer.segment) }}
          >
            {customer.segment}
          </span>
        </div>
      </div>

      <div className="card-content">
        <div className="customer-info">
          <h3>{customer.name}</h3>
          <p>{customer.business.name}</p>
          <div className="customer-meta">
            <span>
              <MapPin size={12} />
              {customer.business.location}
            </span>
            <span>
              <Phone size={12} />
              {customer.phone}
            </span>
            <span>
              <Building size={12} />
              {customer.business.type.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="financial-summary">
          <div className="credit-score">
            <div className="score-circle" style={{ borderColor: getRiskColor(customer.riskLevel) }}>
              <span>{customer.creditProfile.score}</span>
            </div>
            <div className="score-details">
              <span>Credit Score</span>
              <span className="risk-level" style={{ color: getRiskColor(customer.riskLevel) }}>
                {customer.riskLevel} risk
              </span>
            </div>
          </div>

          <div className="financial-metrics">
            <div className="metric">
              <label>Current Balance</label>
              <value>KSH {customer.creditProfile.currentBalance.toLocaleString()}</value>
            </div>
            <div className="metric">
              <label>Payment History</label>
              <value>{customer.creditProfile.paymentHistory}%</value>
            </div>
            <div className="metric">
              <label>Total Loans</label>
              <value>{customer.creditProfile.totalLoans}</value>
            </div>
          </div>
        </div>

        <div className="customer-tags">
          {customer.tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag.replace('_', ' ')}
            </span>
          ))}
        </div>

        <div className="last-activity">
          <Clock size={12} />
          <span>Last activity: {new Date(customer.lastActivityDate).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="card-actions">
        <button 
          className="btn btn-sm btn-primary"
          onClick={() => {
            setSelectedCustomer(customer)
            setShowCustomerProfile(true)
          }}
        >
          <Eye size={14} />
          View Profile
        </button>
        <button 
          className="btn btn-sm btn-secondary"
          onClick={() => window.open(`tel:${customer.phone}`)}
        >
          <Phone size={14} />
          Call
        </button>
        <button className="btn btn-sm btn-secondary">
          <MessageSquare size={14} />
          Message
        </button>
      </div>
    </div>
  )

  const CustomerRow = ({ customer }) => (
    <tr className={`customer-row ${customer.status} ${selectedCustomers.includes(customer.id) ? 'selected' : ''}`}>
      <td>
        <input
          type="checkbox"
          checked={selectedCustomers.includes(customer.id)}
          onChange={() => handleCustomerSelect(customer.id)}
        />
      </td>
      <td>
        <div className="customer-cell">
          <div className="customer-avatar small">
            {customer.name.charAt(0)}
          </div>
          <div className="customer-details">
            <div className="customer-name">{customer.name}</div>
            <div className="customer-business">{customer.business.name}</div>
          </div>
        </div>
      </td>
      <td>{customer.phone}</td>
      <td>{customer.business.location}</td>
      <td>
        <div className="score-cell">
          <span className="score-value" style={{ color: getRiskColor(customer.riskLevel) }}>
            {customer.creditProfile.score}
          </span>
          <span className="risk-indicator" style={{ color: getRiskColor(customer.riskLevel) }}>
            {customer.riskLevel}
          </span>
        </div>
      </td>
      <td>KSH {customer.creditProfile.currentBalance.toLocaleString()}</td>
      <td>{customer.creditProfile.paymentHistory}%</td>
      <td>
        <span 
          className="status-badge small"
          style={{ backgroundColor: `${getStatusColor(customer.status)}20`, color: getStatusColor(customer.status) }}
        >
          {customer.status.replace('_', ' ')}
        </span>
      </td>
      <td>
        <div className="table-actions">
          <button 
            className="action-btn"
            onClick={() => {
              setSelectedCustomer(customer)
              setShowCustomerProfile(true)
            }}
            title="View Profile"
          >
            <Eye size={14} />
          </button>
          <button 
            className="action-btn"
            onClick={() => window.open(`tel:${customer.phone}`)}
            title="Call Customer"
          >
            <Phone size={14} />
          </button>
          <button className="action-btn" title="Send Message">
            <MessageSquare size={14} />
          </button>
        </div>
      </td>
    </tr>
  )

  return (
    <div className="customer-management">
      <div className="management-header">
        <div className="header-content">
          <h1>Customer Management</h1>
          <p>Manage your customer relationships and track their performance</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddCustomer(true)}
          >
            <UserPlus size={16} />
            Add Customer
          </button>
          <button className="btn btn-secondary">
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>

      <StatsOverview />

      {/* Filters and Controls */}
      <div className="management-controls">
        <div className="search-section">
          <div className="search-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-section">
          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="watch_list">Watch List</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            className="filter-select"
            value={filterSegment}
            onChange={(e) => setFilterSegment(e.target.value)}
          >
            <option value="all">All Segments</option>
            <option value="premium">Premium</option>
            <option value="standard">Standard</option>
            <option value="basic">Basic</option>
          </select>

          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name_asc">Name A-Z</option>
            <option value="name_desc">Name Z-A</option>
            <option value="score_desc">Highest Score</option>
            <option value="score_asc">Lowest Score</option>
            <option value="balance_desc">Highest Balance</option>
            <option value="balance_asc">Lowest Balance</option>
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
          </select>
        </div>

        <div className="view-controls">
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={16} />
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCustomers.length > 0 && (
        <div className="bulk-actions">
          <span>{selectedCustomers.length} customer(s) selected</span>
          <div className="bulk-action-buttons">
            <button 
              className="btn btn-sm btn-secondary"
              onClick={() => handleBulkAction('message')}
            >
              <Send size={14} />
              Send Message
            </button>
            <button 
              className="btn btn-sm btn-secondary"
              onClick={() => handleBulkAction('export')}
            >
              <Download size={14} />
              Export
            </button>
            <button 
              className="btn btn-sm btn-warning"
              onClick={() => handleBulkAction('watch_list')}
            >
              <AlertTriangle size={14} />
              Add to Watch List
            </button>
          </div>
        </div>
      )}

      {/* Customer Display */}
      <div className="customer-display">
        {viewMode === 'grid' ? (
          <div className="customer-grid">
            {sortedCustomers.map(customer => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
        ) : (
          <div className="customer-table-container">
            <table className="customer-table">
              <thead>
                <tr>
                  <th width="40">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.length === sortedCustomers.length && sortedCustomers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCustomers(sortedCustomers.map(c => c.id))
                        } else {
                          setSelectedCustomers([])
                        }
                      }}
                    />
                  </th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Credit Score</th>
                  <th>Balance</th>
                  <th>Payment %</th>
                  <th>Status</th>
                  <th width="120">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedCustomers.map(customer => (
                  <CustomerRow key={customer.id} customer={customer} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {sortedCustomers.length === 0 && (
        <div className="empty-state">
          <Users size={64} style={{ color: 'var(--gray-400)' }} />
          <h3>No customers found</h3>
          <p>Try adjusting your search criteria or add new customers to get started.</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddCustomer(true)}
          >
            <UserPlus size={16} />
            Add Your First Customer
          </button>
        </div>
      )}

      {/* Customer Profile Modal */}
      {showCustomerProfile && selectedCustomer && (
        <CustomerProfile
          customer={selectedCustomer}
          onClose={() => {
            setShowCustomerProfile(false)
            setSelectedCustomer(null)
          }}
          onUpdate={(updatedCustomer) => {
            setCustomers(prev => prev.map(c => 
              c.id === updatedCustomer.id ? updatedCustomer : c
            ))
            setShowCustomerProfile(false)
            setSelectedCustomer(null)
          }}
        />
      )}

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <AddCustomerModal
          onClose={() => setShowAddCustomer(false)}
          onAdd={(newCustomer) => {
            setCustomers(prev => [...prev, { ...newCustomer, id: Date.now() }])
            setShowAddCustomer(false)
          }}
        />
      )}
    </div>
  )
}

export default CustomerManagement