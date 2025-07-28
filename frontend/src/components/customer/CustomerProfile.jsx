import React, { useState } from 'react'
import { 
  X, 
  Edit, 
  Phone, 
  MessageSquare, 
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  CreditCard,
  Building,
  User,
  Heart,
  Baby,
  GraduationCap,
  Home,
  Briefcase,
  Plus,
  Download,
  Send,
  Eye,
  Ban,
  Shield
} from 'lucide-react'

const CustomerProfile = ({ customer, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editedCustomer, setEditedCustomer] = useState(customer)
  const [newNote, setNewNote] = useState('')
  const [newCommunication, setNewCommunication] = useState({ type: 'call', content: '' })

  const handleSave = () => {
    onUpdate(editedCustomer)
    setIsEditing(false)
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      const updatedCustomer = {
        ...editedCustomer,
        notes: editedCustomer.notes + '\n\n' + new Date().toLocaleDateString() + ': ' + newNote
      }
      setEditedCustomer(updatedCustomer)
      setNewNote('')
    }
  }

  const handleAddCommunication = () => {
    if (newCommunication.content.trim()) {
      const communication = {
        id: Date.now(),
        type: newCommunication.type,
        date: new Date().toISOString(),
        method: newCommunication.type === 'call' ? 'call' : 'sms',
        content: newCommunication.content,
        status: 'completed'
      }
      
      const updatedCustomer = {
        ...editedCustomer,
        communications: [communication, ...editedCustomer.communications]
      }
      setEditedCustomer(updatedCustomer)
      setNewCommunication({ type: 'call', content: '' })
    }
  }

  const getRiskColor = (risk) => {
    const colors = {
      'low': '#10B981',
      'medium': '#F59E0B',
      'high': '#EF4444'
    }
    return colors[risk] || '#6B7280'
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

  const OverviewTab = () => (
    <div className="profile-overview">
      <div className="overview-grid">
        {/* Personal Information */}
        <div className="profile-section">
          <h3>Personal Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <User size={16} />
              <div>
                <label>Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedCustomer.name}
                    onChange={(e) => setEditedCustomer(prev => ({ ...prev, name: e.target.value }))}
                    className="edit-input"
                  />
                ) : (
                  <value>{customer.name}</value>
                )}
              </div>
            </div>

            <div className="info-item">
              <Calendar size={16} />
              <div>
                <label>Date of Birth</label>
                <value>{new Date(customer.personalInfo.dateOfBirth).toLocaleDateString()}</value>
              </div>
            </div>

            <div className="info-item">
              <Heart size={16} />
              <div>
                <label>Marital Status</label>
                <value>{customer.personalInfo.maritalStatus}</value>
              </div>
            </div>

            <div className="info-item">
              <Baby size={16} />
              <div>
                <label>Dependents</label>
                <value>{customer.personalInfo.dependents}</value>
              </div>
            </div>

            <div className="info-item">
              <GraduationCap size={16} />
              <div>
                <label>Education</label>
                <value>{customer.personalInfo.education}</value>
              </div>
            </div>

            <div className="info-item">
              <Home size={16} />
              <div>
                <label>Address</label>
                <value>{customer.personalInfo.address}</value>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="profile-section">
          <h3>Contact Information</h3>
          <div className="contact-info">
            <div className="contact-item">
              <Phone size={16} />
              <div>
                <label>Phone Number</label>
                <value>{customer.phone}</value>
                <button 
                  className="contact-action"
                  onClick={() => window.open(`tel:${customer.phone}`)}
                >
                  Call
                </button>
              </div>
            </div>

            {customer.email && (
              <div className="contact-item">
                <Mail size={16} />
                <div>
                  <label>Email Address</label>
                  <value>{customer.email}</value>
                  <button 
                    className="contact-action"
                    onClick={() => window.open(`mailto:${customer.email}`)}
                  >
                    Email
                  </button>
                </div>
              </div>
            )}

            <div className="contact-item">
              <MessageSquare size={16} />
              <div>
                <label>WhatsApp</label>
                <value>{customer.phone}</value>
                <button 
                  className="contact-action"
                  onClick={() => window.open(`https://wa.me/${customer.phone.replace('+', '')}`)}
                >
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="profile-section">
          <h3>Business Information</h3>
          <div className="business-info">
            <div className="business-header">
              <Building size={20} />
              <div>
                <h4>{customer.business.name}</h4>
                <p>{customer.business.type.replace('_', ' ')}</p>
              </div>
            </div>

            <div className="business-details">
              <div className="detail-item">
                <label>Location</label>
                <value>
                  <MapPin size={14} />
                  {customer.business.location}
                </value>
              </div>
              <div className="detail-item">
                <label>Established</label>
                <value>{new Date(customer.business.established).toLocaleDateString()}</value>
              </div>
              <div className="detail-item">
                <label>Description</label>
                <value>{customer.business.description}</value>
              </div>
            </div>
          </div>
        </div>

        {/* Credit Profile */}
        <div className="profile-section">
          <h3>Credit Profile</h3>
          <div className="credit-profile">
            <div className="credit-score-display">
              <div className="score-circle" style={{ borderColor: getRiskColor(customer.riskLevel) }}>
                <span className="score-value">{customer.creditProfile.score}</span>
                <span className="score-rating">{customer.creditProfile.rating}</span>
              </div>
              <div className="risk-info">
                <span style={{ color: getRiskColor(customer.riskLevel) }}>
                  {customer.riskLevel.toUpperCase()} RISK
                </span>
              </div>
            </div>

            <div className="credit-metrics">
              <div className="metric-row">
                <div className="metric">
                  <label>Total Loans</label>
                  <value>{customer.creditProfile.totalLoans}</value>
                </div>
                <div className="metric">
                  <label>Active Loans</label>
                  <value>{customer.creditProfile.activeLoans}</value>
                </div>
              </div>

              <div className="metric-row">
                <div className="metric">
                  <label>Total Borrowed</label>
                  <value>KSH {customer.creditProfile.totalBorrowed.toLocaleString()}</value>
                </div>
                <div className="metric">
                  <label>Total Repaid</label>
                  <value>KSH {customer.creditProfile.totalRepaid.toLocaleString()}</value>
                </div>
              </div>

              <div className="metric-row">
                <div className="metric">
                  <label>Current Balance</label>
                  <value>KSH {customer.creditProfile.currentBalance.toLocaleString()}</value>
                </div>
                <div className="metric">
                  <label>Payment History</label>
                  <value>{customer.creditProfile.paymentHistory}%</value>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="profile-section">
          <h3>Financial Information</h3>
          <div className="financial-info">
            <div className="income-breakdown">
              <div className="income-item positive">
                <TrendingUp size={16} />
                <div>
                  <label>Monthly Income</label>
                  <value>KSH {customer.financial.monthlyIncome.toLocaleString()}</value>
                </div>
              </div>

              <div className="income-item negative">
                <TrendingDown size={16} />
                <div>
                  <label>Monthly Expenses</label>
                  <value>KSH {customer.financial.monthlyExpenses.toLocaleString()}</value>
                </div>
              </div>

              <div className="income-item net">
                <DollarSign size={16} />
                <div>
                  <label>Net Income</label>
                  <value>KSH {customer.financial.netIncome.toLocaleString()}</value>
                </div>
              </div>
            </div>

            <div className="banking-info">
              <div className="banking-item">
                <label>Bank Account</label>
                <value>
                  {customer.financial.bankAccount ? (
                    <CheckCircle size={16} style={{ color: '#10B981' }} />
                  ) : (
                    <X size={16} style={{ color: '#EF4444' }} />
                  )}
                  {customer.financial.bankAccount ? 'Yes' : 'No'}
                </value>
              </div>
              <div className="banking-item">
                <label>Savings Account</label>
                <value>
                  {customer.financial.savingsAccount ? (
                    <CheckCircle size={16} style={{ color: '#10B981' }} />
                  ) : (
                    <X size={16} style={{ color: '#EF4444' }} />
                  )}
                  {customer.financial.savingsAccount ? 'Yes' : 'No'}
                </value>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Tags and Notes */}
        <div className="profile-section full-width">
          <h3>Tags and Notes</h3>
          <div className="tags-section">
            <div className="customer-tags">
              {customer.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>

          <div className="notes-section">
            <div className="notes-content">
              <pre>{customer.notes}</pre>
            </div>
            <div className="add-note">
              <textarea
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={3}
              />
              <button 
                className="btn btn-sm btn-primary"
                onClick={handleAddNote}
                disabled={!newNote.trim()}
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const LoansTab = () => {
    // Mock loan data for this customer
    const loans = [
      {
        id: 'LN202401234',
        amount: 75000,
        disbursedAmount: 75000,
        balance: 25000,
        status: 'active',
        startDate: '2023-12-01',
        endDate: '2024-06-01',
        duration: 6,
        interestRate: 12,
        paymentFrequency: 'weekly',
        purpose: 'Business expansion',
        paymentsTotal: 26,
        paymentsMade: 18,
        paymentsRemaining: 8,
        nextPaymentDate: '2024-01-28',
        nextPaymentAmount: 3200
      },
      {
        id: 'LN202308156',
        amount: 50000,
        disbursedAmount: 50000,
        balance: 0,
        status: 'completed',
        startDate: '2023-08-15',
        endDate: '2023-11-15',
        duration: 3,
        interestRate: 12,
        paymentFrequency: 'weekly',
        purpose: 'Inventory purchase',
        paymentsTotal: 13,
        paymentsMade: 13,
        paymentsRemaining: 0,
        completedDate: '2023-11-10'
      }
    ]

    return (
      <div className="profile-loans">
        <div className="loans-summary">
          <div className="summary-stats">
            <div className="stat">
              <label>Active Loans</label>
              <value>{loans.filter(l => l.status === 'active').length}</value>
            </div>
            <div className="stat">
              <label>Total Outstanding</label>
              <value>KSH {loans.reduce((sum, l) => sum + l.balance, 0).toLocaleString()}</value>
            </div>
            <div className="stat">
              <label>Completed Loans</label>
              <value>{loans.filter(l => l.status === 'completed').length}</value>
            </div>
          </div>
        </div>

        <div className="loans-list">
          {loans.map(loan => (
            <div key={loan.id} className={`loan-card ${loan.status}`}>
              <div className="loan-header">
                <div className="loan-id">
                  <CreditCard size={16} />
                  <span>{loan.id}</span>
                </div>
                <span className={`loan-status ${loan.status}`}>
                  {loan.status}
                </span>
              </div>

              <div className="loan-details">
                <div className="loan-amount">
                  <label>Loan Amount</label>
                  <value>KSH {loan.amount.toLocaleString()}</value>
                </div>
                <div className="loan-balance">
                  <label>Outstanding Balance</label>
                  <value>KSH {loan.balance.toLocaleString()}</value>
                </div>
                <div className="loan-progress">
                  <label>Progress</label>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${(loan.paymentsMade / loan.paymentsTotal) * 100}%` }}
                    ></div>
                  </div>
                  <span>{loan.paymentsMade}/{loan.paymentsTotal} payments</span>
                </div>
              </div>

              <div className="loan-terms">
                <div className="term">
                  <label>Duration</label>
                  <value>{loan.duration} months</value>
                </div>
                <div className="term">
                  <label>Interest Rate</label>
                  <value>{loan.interestRate}%</value>
                </div>
                <div className="term">
                  <label>Frequency</label>
                  <value>{loan.paymentFrequency}</value>
                </div>
                <div className="term">
                  <label>Purpose</label>
                  <value>{loan.purpose}</value>
                </div>
              </div>

              {loan.status === 'active' && (
                <div className="next-payment">
                  <div className="payment-info">
                    <Clock size={14} />
                    <span>Next payment: KSH {loan.nextPaymentAmount.toLocaleString()} due on {new Date(loan.nextPaymentDate).toLocaleDateString()}</span>
                  </div>
                  <button className="btn btn-sm btn-primary">
                    Collect Payment
                  </button>
                </div>
              )}

              {loan.status === 'completed' && (
                <div className="completed-info">
                  <CheckCircle size={14} style={{ color: '#10B981' }} />
                  <span>Completed on {new Date(loan.completedDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const PaymentsTab = () => {
    // Mock payment history
    const payments = [
      {
        id: 1,
        date: '2024-01-20',
        amount: 3200,
        method: 'M-Pesa',
        status: 'completed',
        loanId: 'LN202401234',
        transactionId: 'TXN123456789',
        daysLate: 0
      },
      {
        id: 2,
        date: '2024-01-13',
        amount: 3200,
        method: 'Cash',
        status: 'completed',
        loanId: 'LN202401234',
        transactionId: null,
        daysLate: 1
      },
      {
        id: 3,
        date: '2024-01-06',
        amount: 3200,
        method: 'M-Pesa',
        status: 'completed',
        loanId: 'LN202401234',
        transactionId: 'TXN987654321',
        daysLate: 0
      }
    ]

    return (
      <div className="profile-payments">
        <div className="payments-summary">
          <div className="summary-cards">
            <div className="summary-card">
              <h4>Payment Performance</h4>
              <div className="performance-metric">
                <span className="metric-value">{customer.creditProfile.paymentHistory}%</span>
                <span className="metric-label">On-time payments</span>
              </div>
            </div>
            <div className="summary-card">
              <h4>Average Payment Time</h4>
              <div className="performance-metric">
                <span className="metric-value">{customer.creditProfile.averagePaymentDays}</span>
                <span className="metric-label">Days after due date</span>
              </div>
            </div>
            <div className="summary-card">
              <h4>Last Payment</h4>
              <div className="performance-metric">
                <span className="metric-value">{new Date(customer.creditProfile.lastPaymentDate).toLocaleDateString()}</span>
                <span className="metric-label">Most recent</span>
              </div>
            </div>
          </div>
        </div>

        <div className="payments-history">
          <h4>Payment History</h4>
          <div className="payments-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Loan ID</th>
                  <th>Status</th>
                  <th>Days Late</th>
                  <th>Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment.id}>
                    <td>{new Date(payment.date).toLocaleDateString()}</td>
                    <td>KSH {payment.amount.toLocaleString()}</td>
                    <td>{payment.method}</td>
                    <td>{payment.loanId}</td>
                    <td>
                      <span className={`payment-status ${payment.status}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td>
                      <span className={payment.daysLate > 0 ? 'late' : 'on-time'}>
                        {payment.daysLate}
                      </span>
                    </td>
                    <td>{payment.transactionId || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const CommunicationsTab = () => (
    <div className="profile-communications">
      <div className="add-communication">
        <h4>Add Communication</h4>
        <div className="communication-form">
          <select
            value={newCommunication.type}
            onChange={(e) => setNewCommunication(prev => ({ ...prev, type: e.target.value }))}
          >
            <option value="call">Phone Call</option>
            <option value="sms">SMS</option>
            <option value="visit">Field Visit</option>
            <option value="email">Email</option>
          </select>
          <textarea
            placeholder="Communication details..."
            value={newCommunication.content}
            onChange={(e) => setNewCommunication(prev => ({ ...prev, content: e.target.value }))}
            rows={3}
          />
          <button 
            className="btn btn-primary"
            onClick={handleAddCommunication}
            disabled={!newCommunication.content.trim()}
          >
            <Plus size={16} />
            Add Communication
          </button>
        </div>
      </div>

      <div className="communications-history">
        <h4>Communication History</h4>
        <div className="communications-timeline">
          {customer.communications.map(comm => (
            <div key={comm.id} className="communication-item">
              <div className="comm-icon">
                {comm.type === 'call' && <Phone size={16} />}
                {comm.type === 'sms' && <MessageSquare size={16} />}
                {comm.type === 'email' && <Mail size={16} />}
                {comm.type === 'visit' && <MapPin size={16} />}
              </div>
              <div className="comm-content">
                <div className="comm-header">
                  <span className="comm-type">{comm.type.replace('_', ' ')}</span>
                  <span className="comm-date">{new Date(comm.date).toLocaleDateString()}</span>
                </div>
                <div className="comm-message">{comm.content}</div>
                <div className="comm-status">
                  <span className={`status ${comm.status}`}>{comm.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const DocumentsTab = () => (
    <div className="profile-documents">
      <div className="documents-grid">
        {Object.entries(customer.documents).map(([key, doc]) => (
          <div key={key} className={`document-card ${doc.status}`}>
            <div className="document-header">
              <FileText size={24} />
              <div className="document-info">
                <h4>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</h4>
                <p>Status: {doc.status}</p>
                {doc.uploadDate && (
                  <p>Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</p>
                )}
              </div>
              <div className="document-status-icon">
                {doc.status === 'verified' && <CheckCircle size={20} style={{ color: '#10B981' }} />}
                {doc.status === 'pending' && <Clock size={20} style={{ color: '#F59E0B' }} />}
                {doc.status === 'expired' && <AlertTriangle size={20} style={{ color: '#EF4444' }} />}
                {doc.status === 'missing' && <X size={20} style={{ color: '#EF4444' }} />}
              </div>
            </div>
            <div className="document-actions">
              {doc.status !== 'missing' && (
                <>
                  <button className="btn btn-sm btn-secondary">
                    <Eye size={14} />
                    View
                  </button>
                  <button className="btn btn-sm btn-secondary">
                    <Download size={14} />
                    Download
                  </button>
                </>
              )}
              {doc.status === 'pending' && (
                <button className="btn btn-sm btn-success">
                  <CheckCircle size={14} />
                  Verify
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal">
        <div className="profile-header">
          <div className="customer-summary">
            <div className="customer-avatar large">
              {customer.name.charAt(0)}
            </div>
            <div className="customer-info">
              <h2>{customer.name}</h2>
              <p>{customer.business.name}</p>
              <div className="customer-meta">
                <span>
                  <Phone size={14} />
                  {customer.phone}
                </span>
                <span>
                  <MapPin size={14} />
                  {customer.business.location}
                </span>
                <span>
                  <Calendar size={14} />
                  Member since {new Date(customer.registrationDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="customer-status">
              <span 
                className="status-badge large"
                style={{ backgroundColor: `${getStatusColor(customer.status)}20`, color: getStatusColor(customer.status) }}
              >
                {customer.status.replace('_', ' ')}
              </span>
              <div className="credit-summary">
                <span className="credit-score">{customer.creditProfile.score}</span>
                <span className="credit-label">Credit Score</span>
              </div>
            </div>
          </div>
          
          <div className="profile-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => window.open(`tel:${customer.phone}`)}
            >
              <Phone size={16} />
              Call
            </button>
            <button className="btn btn-secondary">
              <MessageSquare size={16} />
              Message
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit size={16} />
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
            {isEditing && (
              <button 
                className="btn btn-primary"
                onClick={handleSave}
              >
                Save Changes
              </button>
            )}
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="profile-tabs">
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
            Loans
          </button>
          <button 
            className={`tab-button ${activeTab === 'payments' ? 'active' : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            Payments
          </button>
          <button 
            className={`tab-button ${activeTab === 'communications' ? 'active' : ''}`}
            onClick={() => setActiveTab('communications')}
          >
            Communications
          </button>
          <button 
            className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Documents
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'loans' && <LoansTab />}
          {activeTab === 'payments' && <PaymentsTab />}
          {activeTab === 'communications' && <CommunicationsTab />}
          {activeTab === 'documents' && <DocumentsTab />}
        </div>
      </div>
    </div>
  )
}

export default CustomerProfile