import React, { useState } from 'react'
import { 
  X, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  Download,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Building,
  FileText,
  Camera,
  MessageSquare,
  Clock,
  TrendingUp,
  Shield,
  Star,
  ThumbsUp,
  ThumbsDown,
  Send,
  Calculator
} from 'lucide-react'
import CreditScoring from './CreditScoring'

const LoanApplicationReview = ({ application, onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [decision, setDecision] = useState('')
  const [comments, setComments] = useState('')
  const [conditions, setConditions] = useState('')
  const [recommendedAmount, setRecommendedAmount] = useState(application.loan.amount)
  const [recommendedRate, setRecommendedRate] = useState(application.loan.requestedRate)
  const [showCreditScoring, setShowCreditScoring] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleApprove = async () => {
    setIsProcessing(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const updatedApplication = {
      ...application,
      status: 'approved',
      approvedAmount: recommendedAmount,
      approvedRate: recommendedRate,
      approvedBy: 'Current User',
      approvedDate: new Date().toISOString(),
      conditions: conditions,
      comments: comments,
      timeline: [
        ...application.timeline,
        {
          date: new Date().toISOString(),
          action: 'Application approved',
          user: 'Current User',
          details: {
            amount: recommendedAmount,
            rate: recommendedRate,
            conditions: conditions
          }
        }
      ]
    }
    
    onUpdate(updatedApplication)
    setIsProcessing(false)
  }

  const handleReject = async () => {
    setIsProcessing(true)
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const updatedApplication = {
      ...application,
      status: 'rejected',
      rejectedBy: 'Current User',
      rejectedDate: new Date().toISOString(),
      rejectionReason: comments,
      timeline: [
        ...application.timeline,
        {
          date: new Date().toISOString(),
          action: 'Application rejected',
          user: 'Current User',
          details: {
            reason: comments
          }
        }
      ]
    }
    
    onUpdate(updatedApplication)
    setIsProcessing(false)
  }

  const handleConditionalApproval = async () => {
    setIsProcessing(true)
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const updatedApplication = {
      ...application,
      status: 'conditional_approval',
      approvedAmount: recommendedAmount,
      approvedRate: recommendedRate,
      conditions: conditions,
      comments: comments,
      timeline: [
        ...application.timeline,
        {
          date: new Date().toISOString(),
          action: 'Conditional approval granted',
          user: 'Current User',
          details: {
            amount: recommendedAmount,
            rate: recommendedRate,
            conditions: conditions
          }
        }
      ]
    }
    
    onUpdate(updatedApplication)
    setIsProcessing(false)
  }

  const calculateMonthlyPayment = () => {
    const principal = recommendedAmount
    const monthlyRate = recommendedRate / 100 / 12
    const numberOfPayments = application.loan.duration

    if (monthlyRate === 0) {
      return principal / numberOfPayments
    }

    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    return monthlyPayment
  }

  const OverviewTab = () => (
    <div className="review-overview">
      <div className="overview-grid">
        {/* Customer Summary */}
        <div className="review-section">
          <h3>Customer Profile</h3>
          <div className="customer-profile">
            <div className="profile-header">
              <div className="customer-avatar large">
                {application.customer.name.charAt(0)}
              </div>
              <div className="customer-info">
                <h4>{application.customer.name}</h4>
                <p>{application.customer.business}</p>
                <div className="contact-info">
                  <span><Phone size={14} /> {application.customer.phone}</span>
                  <span><MapPin size={14} /> {application.customer.location}</span>
                </div>
              </div>
              <div className="customer-score">
                <div className="credit-score">
                  <span className="score-value">{application.customer.creditScore}</span>
                  <span className="score-label">Credit Score</span>
                </div>
              </div>
            </div>

            <div className="customer-stats">
              <div className="stat-item">
                <label>Member Since</label>
                <value>{new Date(application.customer.memberSince).toLocaleDateString()}</value>
              </div>
              <div className="stat-item">
                <label>Total Loans</label>
                <value>{application.customer.totalLoans}</value>
              </div>
              <div className="stat-item">
                <label>Payment History</label>
                <value>{application.customer.repaymentHistory || 'N/A'}%</value>
              </div>
            </div>
          </div>
        </div>

        {/* Loan Details */}
        <div className="review-section">
          <h3>Loan Request</h3>
          <div className="loan-details">
            <div className="loan-amount-display">
              <DollarSign size={24} />
              <span>KSH {application.loan.amount.toLocaleString()}</span>
            </div>
            
            <div className="loan-terms">
              <div className="term-item">
                <label>Purpose</label>
                <value>{application.loan.purpose}</value>
              </div>
              <div className="term-item">
                <label>Type</label>
                <value>{application.loan.type}</value>
              </div>
              <div className="term-item">
                <label>Duration</label>
                <value>{application.loan.duration} months</value>
              </div>
              <div className="term-item">
                <label>Frequency</label>
                <value>{application.loan.frequency}</value>
              </div>
              <div className="term-item">
                <label>Requested Rate</label>
                <value>{application.loan.requestedRate}% annual</value>
              </div>
              <div className="term-item">
                <label>Collateral</label>
                <value>{application.loan.collateral}</value>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Assessment */}
        <div className="review-section">
          <h3>Financial Assessment</h3>
          <div className="financial-summary">
            <div className="income-analysis">
              <h4>Monthly Financials</h4>
              <div className="financial-breakdown">
                <div className="financial-item positive">
                  <span>Revenue</span>
                  <span>+KSH {application.financial.monthlyRevenue.toLocaleString()}</span>
                </div>
                <div className="financial-item negative">
                  <span>Expenses</span>
                  <span>-KSH {application.financial.monthlyExpenses.toLocaleString()}</span>
                </div>
                <div className="financial-item net">
                  <span>Net Income</span>
                  <span>KSH {application.financial.netIncome.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="debt-analysis">
              <h4>Debt Analysis</h4>
              <div className="debt-info">
                <div className="debt-item">
                  <label>Other Loans</label>
                  <value>{application.financial.otherLoans ? 'Yes' : 'No'}</value>
                </div>
                <div className="debt-item">
                  <label>Debt-to-Income</label>
                  <value>{((recommendedAmount * 0.12 / 12) / application.financial.netIncome * 100).toFixed(1)}%</value>
                </div>
                <div className="debt-item">
                  <label>Loan-to-Revenue</label>
                  <value>{(recommendedAmount / application.financial.monthlyRevenue * 100).toFixed(1)}%</value>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="review-section">
          <h3>Risk Assessment</h3>
          <div className="risk-assessment">
            <div className="risk-score-display">
              <div className="risk-circle large" style={{ 
                borderColor: application.riskScore >= 70 ? '#10B981' : 
                           application.riskScore >= 50 ? '#F59E0B' : '#EF4444' 
              }}>
                <span className="risk-value">{application.riskScore}</span>
                <span className="risk-max">/100</span>
              </div>
              <div className="risk-interpretation">
                <h4>
                  {application.riskScore >= 70 ? 'Low Risk' : 
                   application.riskScore >= 50 ? 'Medium Risk' : 'High Risk'}
                </h4>
                <p>
                  {application.riskScore >= 70 ? 'Excellent creditworthiness with low default probability' : 
                   application.riskScore >= 50 ? 'Moderate risk requiring standard monitoring' : 
                   'High risk requiring additional security or rejection'}
                </p>
              </div>
            </div>

            <div className="ai-recommendation">
              <h4>AI Recommendation</h4>
              <div className="recommendation-badge">
                {application.recommendedAction === 'approve' && <CheckCircle size={16} style={{ color: '#10B981' }} />}
                {application.recommendedAction === 'reject' && <XCircle size={16} style={{ color: '#EF4444' }} />}
                {application.recommendedAction === 'conditional' && <AlertTriangle size={16} style={{ color: '#F59E0B' }} />}
                <span>{application.recommendedAction.toUpperCase()}</span>
              </div>
              
              <div className="ai-insights">
                <h5>Key Insights</h5>
                <ul>
                  {application.aiInsights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const DocumentsTab = () => (
    <div className="review-documents">
      <h3>Document Verification</h3>
      <div className="documents-grid">
        {Object.entries(application.documents).map(([key, doc]) => (
          <div key={key} className={`document-card ${doc.verified ? 'verified' : doc.uploaded ? 'uploaded' : 'missing'}`}>
            <div className="document-header">
              <div className="document-icon">
                <FileText size={24} />
              </div>
              <div className="document-info">
                <h4>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</h4>
                <p>
                  {doc.verified ? 'Verified' : 
                   doc.uploaded ? 'Uploaded - Pending Verification' : 
                   'Not Uploaded'}
                </p>
              </div>
              <div className="document-status">
                {doc.verified ? <CheckCircle size={20} style={{ color: '#10B981' }} /> : 
                 doc.uploaded ? <Clock size={20} style={{ color: '#F59E0B' }} /> : 
                 <XCircle size={20} style={{ color: '#EF4444' }} />}
              </div>
            </div>
            
            {doc.uploaded && (
              <div className="document-actions">
                <button className="btn btn-sm btn-secondary">
                  <Eye size={14} />
                  View Document
                </button>
                <button className="btn btn-sm btn-secondary">
                  <Download size={14} />
                  Download
                </button>
                {!doc.verified && (
                  <>
                    <button className="btn btn-sm btn-success">
                      <CheckCircle size={14} />
                      Verify
                    </button>
                    <button className="btn btn-sm btn-danger">
                      <XCircle size={14} />
                      Reject
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="verification-summary">
        <div className="summary-stats">
          <div className="summary-item">
            <span>Total Documents</span>
            <span>{Object.keys(application.documents).length}</span>
          </div>
          <div className="summary-item">
            <span>Verified</span>
            <span>{Object.values(application.documents).filter(doc => doc.verified).length}</span>
          </div>
          <div className="summary-item">
            <span>Pending</span>
            <span>{Object.values(application.documents).filter(doc => doc.uploaded && !doc.verified).length}</span>
          </div>
          <div className="summary-item">
            <span>Missing</span>
            <span>{Object.values(application.documents).filter(doc => !doc.uploaded).length}</span>
          </div>
        </div>
      </div>
    </div>
  )

  const TimelineTab = () => (
    <div className="review-timeline">
      <h3>Application Timeline</h3>
      <div className="timeline">
        {application.timeline.map((event, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-marker">
              <div className="timeline-dot"></div>
              {index < application.timeline.length - 1 && <div className="timeline-line"></div>}
            </div>
            <div className="timeline-content">
              <div className="timeline-header">
                <h4>{event.action}</h4>
                <span className="timeline-date">
                  {new Date(event.date).toLocaleString()}
                </span>
              </div>
              <p>By: {event.user}</p>
              {event.details && (
                <div className="timeline-details">
                  {Object.entries(event.details).map(([key, value]) => (
                    <span key={key}>{key}: {value}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const DecisionTab = () => (
    <div className="review-decision">
      <h3>Loan Decision</h3>
      
      <div className="decision-form">
        {/* Decision Type */}
        <div className="form-group">
          <label className="form-label">Decision *</label>
          <div className="decision-options">
            <label className="decision-option approve">
              <input
                type="radio"
                name="decision"
                value="approve"
                checked={decision === 'approve'}
                onChange={(e) => setDecision(e.target.value)}
              />
              <div className="decision-card">
                <CheckCircle size={24} />
                <span>Approve</span>
              </div>
            </label>
            
            <label className="decision-option conditional">
              <input
                type="radio"
                name="decision"
                value="conditional"
                checked={decision === 'conditional'}
                onChange={(e) => setDecision(e.target.value)}
              />
              <div className="decision-card">
                <AlertTriangle size={24} />
                <span>Conditional</span>
              </div>
            </label>
            
            <label className="decision-option reject">
              <input
                type="radio"
                name="decision"
                value="reject"
                checked={decision === 'reject'}
                onChange={(e) => setDecision(e.target.value)}
              />
              <div className="decision-card">
                <XCircle size={24} />
                <span>Reject</span>
              </div>
            </label>
          </div>
        </div>

        {(decision === 'approve' || decision === 'conditional') && (
          <>
            {/* Loan Terms Adjustment */}
            <div className="terms-adjustment">
              <h4>Adjust Loan Terms</h4>
              <div className="terms-grid">
                <div className="form-group">
                  <label className="form-label">Approved Amount (KSH)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={recommendedAmount}
                    onChange={(e) => setRecommendedAmount(parseInt(e.target.value))}
                    min="1000"
                    step="1000"
                  />
                  <div className="adjustment-note">
                    {recommendedAmount !== application.loan.amount && (
                      <span>
                        {recommendedAmount > application.loan.amount ? 'Increased' : 'Reduced'} by 
                        KSH {Math.abs(recommendedAmount - application.loan.amount).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Interest Rate (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={recommendedRate}
                    onChange={(e) => setRecommendedRate(parseFloat(e.target.value))}
                    min="1"
                    max="36"
                    step="0.5"
                  />
                </div>
              </div>

              {/* Payment Calculation */}
              <div className="payment-calculation">
                <h5>Payment Schedule</h5>
                <div className="calculation-result">
                  <div className="calc-item">
                    <label>Monthly Payment</label>
                    <value>KSH {calculateMonthlyPayment().toLocaleString()}</value>
                  </div>
                  <div className="calc-item">
                    <label>Total Interest</label>
                    <value>KSH {(calculateMonthlyPayment() * application.loan.duration - recommendedAmount).toLocaleString()}</value>
                  </div>
                  <div className="calc-item">
                    <label>Total Repayment</label>
                    <value>KSH {(calculateMonthlyPayment() * application.loan.duration).toLocaleString()}</value>
                  </div>
                </div>
              </div>
            </div>

            {/* Conditions */}
            {decision === 'conditional' && (
              <div className="form-group">
                <label className="form-label">Conditions for Approval *</label>
                <textarea
                  className="form-input form-textarea"
                  rows={4}
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  placeholder="Specify conditions that must be met for loan approval..."
                />
              </div>
            )}
          </>
        )}

        {/* Comments */}
        <div className="form-group">
          <label className="form-label">
            {decision === 'reject' ? 'Rejection Reason *' : 'Comments (Optional)'}
          </label>
          <textarea
            className="form-input form-textarea"
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={
              decision === 'reject' 
                ? "Explain the reason for rejection..."
                : "Additional comments or notes..."
            }
          />
        </div>

        {/* Action Buttons */}
        <div className="decision-actions">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
          
          {decision && (
            <button
              className={`btn ${
                decision === 'approve' ? 'btn-success' : 
                decision === 'conditional' ? 'btn-warning' : 
                'btn-danger'
              }`}
              onClick={
                decision === 'approve' ? handleApprove :
                decision === 'conditional' ? handleConditionalApproval :
                handleReject
              }
              disabled={
                isProcessing || 
                (decision === 'reject' && !comments.trim()) ||
                (decision === 'conditional' && !conditions.trim())
              }
            >
              {isProcessing ? (
                <>
                  <div className="loading-spinner small"></div>
                  Processing...
                </>
              ) : (
                <>
                  {decision === 'approve' && <><CheckCircle size={16} /> Approve Loan</>}
                  {decision === 'conditional' && <><AlertTriangle size={16} /> Conditional Approval</>}
                  {decision === 'reject' && <><XCircle size={16} /> Reject Application</>}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="review-modal-overlay">
      <div className="review-modal">
        <div className="review-header">
          <div className="header-info">
            <h2>Loan Application Review</h2>
            <span className="application-id">{application.id}</span>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setShowCreditScoring(true)}
            >
              <Calculator size={14} />
              Credit Analysis
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => window.open(`tel:${application.customer.phone}`)}
            >
              <Phone size={14} />
              Call Customer
            </button>
            <button 
              className="close-btn"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="review-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Documents
          </button>
          <button 
            className={`tab-button ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            Timeline
          </button>
          <button 
            className={`tab-button ${activeTab === 'decision' ? 'active' : ''}`}
            onClick={() => setActiveTab('decision')}
          >
            Decision
          </button>
        </div>

        <div className="review-content">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'documents' && <DocumentsTab />}
          {activeTab === 'timeline' && <TimelineTab />}
          {activeTab === 'decision' && <DecisionTab />}
        </div>
      </div>

      {/* Credit Scoring Modal */}
      {showCreditScoring && (
        <CreditScoring
          customer={application.customer}
          application={application}
          onClose={() => setShowCreditScoring(false)}
        />
      )}
    </div>
  )
}

export default LoanApplicationReview