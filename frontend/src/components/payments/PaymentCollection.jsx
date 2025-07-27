import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { 
  Search, 
  MapPin, 
  Phone, 
  DollarSign, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Plus,
  Filter,
  Download,
  Navigation,
  Camera,
  Mic
} from 'lucide-react'

const PaymentCollection = () => {
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('today')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showCollectionForm, setShowCollectionForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data
  const [collectionsData, setCollectionsData] = useState({
    today: {
      target: 45000,
      collected: 28500,
      remaining: 16500,
      customers: 15,
      completed: 9,
      pending: 6
    },
    payments: [
      {
        id: 1,
        customer: {
          name: 'Mary Wanjiku',
          phone: '+254712345678',
          business: 'Vegetable Vendor',
          location: 'Kawangware Market',
          gps: { lat: -1.2921, lng: 36.8219 }
        },
        loan: {
          id: 'LN202401234',
          amount: 2500,
          dueDate: '2024-01-25',
          overdueDays: 0
        },
        status: 'pending',
        scheduledTime: '10:00 AM',
        priority: 'high'
      },
      {
        id: 2,
        customer: {
          name: 'Grace Akinyi',
          phone: '+254787654321',
          business: 'Fruit Seller',
          location: 'Kisumu Central',
          gps: { lat: -0.0917, lng: 34.7680 }
        },
        loan: {
          id: 'LN202401189',
          amount: 1800,
          dueDate: '2024-01-24',
          overdueDays: 1
        },
        status: 'overdue',
        scheduledTime: '11:30 AM',
        priority: 'urgent'
      },
      {
        id: 3,
        customer: {
          name: 'Susan Nyakio',
          phone: '+254723456789',
          business: 'General Store',
          location: 'Nakuru Town',
          gps: { lat: -0.3031, lng: 36.0800 }
        },
        loan: {
          id: 'LN202401156',
          amount: 3200,
          dueDate: '2024-01-25',
          overdueDays: 0
        },
        status: 'collected',
        scheduledTime: '2:00 PM',
        priority: 'normal',
        collectedAt: '2024-01-25 14:15:00',
        collectedAmount: 3200,
        method: 'M-Pesa'
      }
    ]
  })

  const getStatusColor = (status) => {
    const colors = {
      pending: 'var(--warning-orange)',
      overdue: 'var(--danger-red)',
      collected: 'var(--success-green)',
      scheduled: 'var(--primary-blue)'
    }
    return colors[status] || 'var(--gray-500)'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'var(--danger-red)',
      high: 'var(--warning-orange)',
      normal: 'var(--primary-blue)',
      low: 'var(--gray-500)'
    }
    return colors[priority] || 'var(--gray-500)'
  }

  const filteredPayments = collectionsData.payments.filter(payment => {
    const matchesSearch = payment.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.customer.business.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.customer.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || payment.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const handleNavigateToCustomer = (customer) => {
    const url = `https://maps.google.com/?q=${customer.gps.lat},${customer.gps.lng}`
    window.open(url, '_blank')
  }

  const handleCallCustomer = (phone) => {
    window.open(`tel:${phone}`)
  }

  const handleCollectPayment = (payment) => {
    setSelectedCustomer(payment)
    setShowCollectionForm(true)
  }

  const CollectionStats = () => (
    <div className="collection-stats">
      <div className="stats-header">
        <h3>Today's Collection Summary</h3>
        <span className="date">{new Date().toLocaleDateString()}</span>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">
              KSH {collectionsData.today.collected.toLocaleString()}
            </div>
            <div className="stat-label">Collected Today</div>
            <div className="stat-progress">
              <div 
                className="progress-bar"
                style={{ 
                  width: `${(collectionsData.today.collected / collectionsData.today.target) * 100}%` 
                }}
              ></div>
            </div>
            <div className="stat-target">
              Target: KSH {collectionsData.today.target.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{collectionsData.today.completed}</div>
            <div className="stat-label">Completed</div>
            <div className="stat-subtitle">
              of {collectionsData.today.customers} customers
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{collectionsData.today.pending}</div>
            <div className="stat-label">Pending</div>
            <div className="stat-subtitle">
              KSH {collectionsData.today.remaining.toLocaleString()} remaining
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const PaymentItem = ({ payment }) => (
    <div className={`payment-item ${payment.status}`}>
      <div className="payment-header">
        <div className="customer-info">
          <div className="customer-avatar">
            {payment.customer.name.charAt(0)}
          </div>
          <div className="customer-details">
            <h4>{payment.customer.name}</h4>
            <p>{payment.customer.business}</p>
            <div className="customer-meta">
              <span>
                <MapPin size={14} />
                {payment.customer.location}
              </span>
              <span>
                <Phone size={14} />
                {payment.customer.phone}
              </span>
            </div>
          </div>
        </div>
        
        <div className="payment-status">
          <span 
            className="status-badge"
            style={{ backgroundColor: `${getStatusColor(payment.status)}20`, color: getStatusColor(payment.status) }}
          >
            {payment.status}
          </span>
          <span 
            className="priority-badge"
            style={{ backgroundColor: `${getPriorityColor(payment.priority)}20`, color: getPriorityColor(payment.priority) }}
          >
            {payment.priority}
          </span>
        </div>
      </div>

      <div className="payment-details">
        <div className="loan-info">
          <div className="info-item">
            <label>Loan ID:</label>
            <value>{payment.loan.id}</value>
          </div>
          <div className="info-item">
            <label>Amount Due:</label>
            <value>KSH {payment.loan.amount.toLocaleString()}</value>
          </div>
          <div className="info-item">
            <label>Due Date:</label>
            <value>{payment.loan.dueDate}</value>
          </div>
          <div className="info-item">
            <label>Scheduled:</label>
            <value>{payment.scheduledTime}</value>
          </div>
          {payment.loan.overdueDays > 0 && (
            <div className="info-item overdue">
              <label>Overdue:</label>
              <value>{payment.loan.overdueDays} days</value>
            </div>
          )}
        </div>

        {payment.status === 'collected' && (
          <div className="collection-info">
            <div className="collected-badge">
              <CheckCircle size={16} />
              <span>Collected: KSH {payment.collectedAmount.toLocaleString()}</span>
            </div>
            <div className="collection-details">
              <span>Method: {payment.method}</span>
              <span>Time: {new Date(payment.collectedAt).toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </div>

      <div className="payment-actions">
        {payment.status !== 'collected' ? (
          <>
            <button 
              className="btn btn-sm btn-primary"
              onClick={() => handleCollectPayment(payment)}
            >
              <DollarSign size={14} />
              Collect
            </button>
            <button 
              className="btn btn-sm btn-secondary"
              onClick={() => handleCallCustomer(payment.customer.phone)}
            >
              <Phone size={14} />
              Call
            </button>
            <button 
              className="btn btn-sm btn-secondary"
              onClick={() => handleNavigateToCustomer(payment.customer)}
            >
              <Navigation size={14} />
              Navigate
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-sm btn-secondary">
              <Eye size={14} />
              View Receipt
            </button>
            <button className="btn btn-sm btn-secondary">
              <Download size={14} />
              Download
            </button>
          </>
        )}
      </div>
    </div>
  )

  const CollectionForm = () => {
    const [formData, setFormData] = useState({
      amount: selectedCustomer?.loan.amount || '',
      method: 'mpesa',
      phone: selectedCustomer?.customer.phone || '',
      transactionId: '',
      notes: '',
      location: ''
    })
    const [currentLocation, setCurrentLocation] = useState(null)

    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            })
          },
          (error) => {
            console.error('Error getting location:', error)
          }
        )
      }
    }

    React.useEffect(() => {
      getCurrentLocation()
    }, [])

    const handleSubmitCollection = (e) => {
      e.preventDefault()
      
      // Update payment status
      const updatedPayments = collectionsData.payments.map(payment => {
        if (payment.id === selectedCustomer.id) {
          return {
            ...payment,
            status: 'collected',
            collectedAt: new Date().toISOString(),
            collectedAmount: parseFloat(formData.amount),
            method: formData.method
          }
        }
        return payment
      })

      setCollectionsData(prev => ({
        ...prev,
        payments: updatedPayments,
        today: {
          ...prev.today,
          collected: prev.today.collected + parseFloat(formData.amount),
          completed: prev.today.completed + 1,
          pending: prev.today.pending - 1
        }
      }))

      setShowCollectionForm(false)
      setSelectedCustomer(null)
    }

    return (
      <div className="collection-form-overlay">
        <div className="collection-form">
          <div className="form-header">
            <h3>Record Payment Collection</h3>
            <button 
              className="close-btn"
              onClick={() => setShowCollectionForm(false)}
            >
              ×
            </button>
          </div>

          <div className="customer-summary">
            <div className="customer-info">
              <h4>{selectedCustomer?.customer.name}</h4>
              <p>{selectedCustomer?.customer.business}</p>
              <p>{selectedCustomer?.customer.location}</p>
            </div>
            <div className="loan-summary">
              <span>Loan: {selectedCustomer?.loan.id}</span>
              <span>Due: KSH {selectedCustomer?.loan.amount.toLocaleString()}</span>
            </div>
          </div>

          <form onSubmit={handleSubmitCollection}>
            <div className="form-group">
              <label className="form-label">Amount Collected (KSH) *</label>
              <input
                type="number"
                className="form-input"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
                min="0"
                step="10"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <select
                className="form-select"
                value={formData.method}
                onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value }))}
                required
              >
                <option value="mpesa">M-Pesa</option>
                <option value="airtel">Airtel Money</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            {(formData.method === 'mpesa' || formData.method === 'airtel') && (
              <div className="form-group">
                <label className="form-label">Transaction ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.transactionId}
                  onChange={(e) => setFormData(prev => ({ ...prev, transactionId: e.target.value }))}
                  placeholder="Enter mobile money transaction ID"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Customer Phone</label>
              <input
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+254712345678"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <textarea
                className="form-input form-textarea"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes about this collection..."
              />
            </div>

            <div className="location-section">
              <div className="location-header">
                <label className="form-label">Location Verification</label>
                {currentLocation && (
                  <span className="location-status">
                    <MapPin size={14} />
                    Location captured
                  </span>
                )}
              </div>
              {!currentLocation && (
                <button 
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={getCurrentLocation}
                >
                  <MapPin size={14} />
                  Capture Location
                </button>
              )}
            </div>

            <div className="form-actions">
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowCollectionForm(false)}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn btn-success"
              >
                <CheckCircle size={16} />
                Record Collection
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="payment-collection-container">
      <div className="collection-header">
        <h1>Payment Collection</h1>
        <div className="header-actions">
          <button className="btn btn-secondary">
            <Download size={16} />
            Export Report
          </button>
          <button className="btn btn-primary">
            <Plus size={16} />
            Schedule Collection
          </button>
        </div>
      </div>

      <CollectionStats />

      {/* Collection Tabs */}
      <div className="collection-tabs">
        <button 
          className={`tab-button ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          Today's Collections
        </button>
        <button 
          className={`tab-button ${activeTab === 'overdue' ? 'active' : ''}`}
          onClick={() => setActiveTab('overdue')}
        >
          Overdue Payments
        </button>
        <button 
          className={`tab-button ${activeTab === 'scheduled' ? 'active' : ''}`}
          onClick={() => setActiveTab('scheduled')}
        >
          Scheduled Collections
        </button>
      </div>

      {/* Filters and Search */}
      <div className="collection-filters">
        <div className="search-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search customers, locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-wrapper">
          <Filter size={16} />
          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="collected">Collected</option>
          </select>
        </div>
      </div>

      {/* Payment List */}
      <div className="payment-list">
        {filteredPayments.map(payment => (
          <PaymentItem key={payment.id} payment={payment} />
        ))}
      </div>

      {/* Collection Form Modal */}
      {showCollectionForm && <CollectionForm />}
    </div>
  )
}

export default PaymentCollection