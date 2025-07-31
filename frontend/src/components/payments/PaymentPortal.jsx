import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { 
  Smartphone, 
  CreditCard, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Phone,
  Shield,
  Zap,
  ArrowRight,
  Copy,
  Download
} from 'lucide-react'
import '../../styles/payments.css'

const PaymentPortal = () => {
  const { user } = useSelector((state) => state.auth)
  const [activeMethod, setActiveMethod] = useState('mpesa')
  const [paymentStep, setPaymentStep] = useState('select') // select, process, confirm, success
  const [paymentData, setPaymentData] = useState({
    amount: '',
    phone: user?.phone || '',
    loanId: '',
    method: 'mpesa'
  })
  const [processing, setProcessing] = useState(false)
  const [transactionId, setTransactionId] = useState('')

  // Mock loan data
  const currentLoan = {
    id: 'LN202401234',
    nextPayment: {
      amount: 2500,
      dueDate: '2024-01-25',
      status: 'due'
    },
    balance: 11000
  }

  const paymentMethods = [
    {
      id: 'mpesa',
      name: 'M-Pesa',
      icon: '📱',
      description: 'Pay using Safaricom M-Pesa',
      fees: 'Free for payments under KSH 5,000',
      color: '#00A651',
      available: true
    },
    {
      id: 'airtel',
      name: 'Airtel Money',
      icon: '💰',
      description: 'Pay using Airtel Money',
      fees: 'Small transaction fees apply',
      color: '#FF0000',
      available: true
    },
    {
      id: 'equitel',
      name: 'Equitel',
      icon: '🏦',
      description: 'Pay using Equitel Mobile Banking',
      fees: 'Bank charges apply',
      color: '#1E3A8A',
      available: false
    }
  ]

  const quickAmounts = [
    currentLoan.nextPayment.amount,
    currentLoan.nextPayment.amount * 2,
    5000,
    10000
  ]

  const handlePaymentMethodSelect = (method) => {
    setActiveMethod(method.id)
    setPaymentData(prev => ({ ...prev, method: method.id }))
  }

  const handleAmountSelect = (amount) => {
    setPaymentData(prev => ({ ...prev, amount: amount.toString() }))
  }

  const initiatePayment = async () => {
    setProcessing(true)
    setPaymentStep('process')

    // Simulate payment processing
    setTimeout(() => {
      const mockTransactionId = `TXN${Date.now()}`
      setTransactionId(mockTransactionId)
      setPaymentStep('confirm')
      setProcessing(false)
    }, 3000)
  }

  const confirmPayment = () => {
    setPaymentStep('success')
  }

  const resetPayment = () => {
    setPaymentStep('select')
    setPaymentData(prev => ({ ...prev, amount: '' }))
    setTransactionId('')
  }

  const copyTransactionId = () => {
    navigator.clipboard.writeText(transactionId)
    // Show toast notification
  }

  const renderPaymentMethodSelection = () => (
    <div className="payment-methods-section">
      <h3>Choose Payment Method</h3>
      <div className="payment-methods-grid">
        {paymentMethods.map(method => (
          <div
            key={method.id}
            className={`payment-method-card ${
              activeMethod === method.id ? 'active' : ''
            } ${!method.available ? 'disabled' : ''}`}
            onClick={() => method.available && handlePaymentMethodSelect(method)}
          >
            <div className="method-header">
              <div className="method-icon" style={{ backgroundColor: `${method.color}20` }}>
                <span style={{ color: method.color }}>{method.icon}</span>
              </div>
              <div className="method-info">
                <h4 style={{ color: method.available ? method.color : '#gray' }}>
                  {method.name}
                </h4>
                <p>{method.description}</p>
              </div>
              {!method.available && <span className="coming-soon">Coming Soon</span>}
            </div>
            <div className="method-footer">
              <span className="method-fees">{method.fees}</span>
              {activeMethod === method.id && (
                <CheckCircle size={20} style={{ color: method.color }} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderAmountSelection = () => (
    <div className="amount-selection-section">
      <h3>Enter Payment Amount</h3>
      
      {/* Current Loan Info */}
      <div className="loan-info-card">
        <div className="loan-header">
          <span className="loan-id">Loan: {currentLoan.id}</span>
          <span className={`payment-status ${currentLoan.nextPayment.status}`}>
            {currentLoan.nextPayment.status}
          </span>
        </div>
        <div className="payment-details">
          <div className="detail-item">
            <label>Amount Due:</label>
            <value>KSH {currentLoan.nextPayment.amount.toLocaleString()}</value>
          </div>
          <div className="detail-item">
            <label>Due Date:</label>
            <value>{currentLoan.nextPayment.dueDate}</value>
          </div>
          <div className="detail-item">
            <label>Outstanding Balance:</label>
            <value>KSH {currentLoan.balance.toLocaleString()}</value>
          </div>
        </div>
      </div>

      {/* Quick Amount Buttons */}
      <div className="quick-amounts">
        <label>Quick Select:</label>
        <div className="amount-buttons">
          {quickAmounts.map((amount, index) => (
            <button
              key={index}
              type="button"
              className={`amount-btn ${
                paymentData.amount === amount.toString() ? 'active' : ''
              }`}
              onClick={() => handleAmountSelect(amount)}
            >
              KSH {amount.toLocaleString()}
              {amount === currentLoan.nextPayment.amount && (
                <span className="amount-label">Due Now</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Amount Input */}
      <div className="custom-amount">
        <label className="form-label">
          <DollarSign size={16} />
          Custom Amount (KSH)
        </label>
        <input
          type="number"
          className="form-input amount-input"
          placeholder="Enter amount"
          value={paymentData.amount}
          onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
          min="100"
          max={currentLoan.balance}
        />
      </div>

      {/* Phone Number Verification */}
      <div className="phone-verification">
        <label className="form-label">
          <Phone size={16} />
          {activeMethod === 'mpesa' ? 'M-Pesa' : 'Airtel Money'} Phone Number
        </label>
        <input
          type="tel"
          className="form-input phone-input"
          placeholder="+254712345678"
          value={paymentData.phone}
          onChange={(e) => setPaymentData(prev => ({ ...prev, phone: e.target.value }))}
        />
        <div className="phone-note">
          <Shield size={14} />
          <span>This should be your registered {activeMethod === 'mpesa' ? 'M-Pesa' : 'Airtel Money'} number</span>
        </div>
      </div>
    </div>
  )

  const renderProcessingPayment = () => (
    <div className="processing-section">
      <div className="processing-animation">
        <div className="payment-icon">
          <Smartphone size={48} />
        </div>
        <div className="loading-spinner large"></div>
      </div>
      
      <h3>Processing Payment...</h3>
      <p>Please check your phone for the {activeMethod === 'mpesa' ? 'M-Pesa' : 'Airtel Money'} prompt</p>
      
      <div className="processing-steps">
        <div className="step completed">
          <CheckCircle size={16} />
          <span>Payment request sent</span>
        </div>
        <div className="step active">
          <Clock size={16} />
          <span>Waiting for confirmation</span>
        </div>
        <div className="step">
          <CheckCircle size={16} />
          <span>Payment completed</span>
        </div>
      </div>

      <div className="processing-info">
        <div className="info-card">
          <h4>Payment Details</h4>
          <div className="payment-summary">
            <div className="summary-row">
              <span>Amount:</span>
              <span>KSH {parseInt(paymentData.amount).toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Method:</span>
              <span>{activeMethod === 'mpesa' ? 'M-Pesa' : 'Airtel Money'}</span>
            </div>
            <div className="summary-row">
              <span>Phone:</span>
              <span>{paymentData.phone}</span>
            </div>
            <div className="summary-row">
              <span>Loan ID:</span>
              <span>{currentLoan.id}</span>
            </div>
          </div>
        </div>

        <div className="help-section">
          <h5>Having trouble?</h5>
          <ul>
            <li>Make sure you have sufficient balance</li>
            <li>Check if your phone number is correct</li>
            <li>Ensure your {activeMethod === 'mpesa' ? 'M-Pesa' : 'Airtel Money'} PIN is ready</li>
          </ul>
        </div>
      </div>
    </div>
  )

  const renderConfirmPayment = () => (
    <div className="confirmation-section">
      <div className="confirmation-icon">
        <AlertCircle size={48} style={{ color: '#F59E0B' }} />
      </div>
      
      <h3>Confirm Your Payment</h3>
      <p>Transaction ID: <strong>{transactionId}</strong></p>
      
      <div className="confirmation-details">
        <div className="detail-card">
          <h4>Payment Summary</h4>
          <div className="payment-summary">
            <div className="summary-row highlight">
              <span>Amount Paid:</span>
              <span>KSH {parseInt(paymentData.amount).toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Payment Method:</span>
              <span>{activeMethod === 'mpesa' ? 'M-Pesa' : 'Airtel Money'}</span>
            </div>
            <div className="summary-row">
              <span>From:</span>
              <span>{paymentData.phone}</span>
            </div>
            <div className="summary-row">
              <span>Loan ID:</span>
              <span>{currentLoan.id}</span>
            </div>
            <div className="summary-row">
              <span>Transaction ID:</span>
              <span>
                {transactionId}
                <button 
                  className="copy-btn"
                  onClick={copyTransactionId}
                  title="Copy Transaction ID"
                >
                  <Copy size={14} />
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="confirmation-actions">
        <button 
          className="btn btn-secondary"
          onClick={resetPayment}
        >
          Cancel Payment
        </button>
        <button 
          className="btn btn-success"
          onClick={confirmPayment}
        >
          <CheckCircle size={16} />
          Confirm Payment
        </button>
      </div>
    </div>
  )

  const renderSuccessPayment = () => (
    <div className="success-section">
      <div className="success-animation">
        <div className="success-icon">
          <CheckCircle size={64} style={{ color: '#059669' }} />
        </div>
        <div className="success-particles">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
      </div>
      
      <h2>Payment Successful! 🎉</h2>
      <p>Your payment has been processed successfully</p>
      
      <div className="receipt-card">
        <div className="receipt-header">
          <h4>Payment Receipt</h4>
          <span className="receipt-id">#{transactionId}</span>
        </div>
        
        <div className="receipt-body">
          <div className="receipt-row">
            <span>Date & Time:</span>
            <span>{new Date().toLocaleString()}</span>
          </div>
          <div className="receipt-row">
            <span>Amount:</span>
            <span>KSH {parseInt(paymentData.amount).toLocaleString()}</span>
          </div>
          <div className="receipt-row">
            <span>Method:</span>
            <span>{activeMethod === 'mpesa' ? 'M-Pesa' : 'Airtel Money'}</span>
          </div>
          <div className="receipt-row">
            <span>Loan ID:</span>
            <span>{currentLoan.id}</span>
          </div>
          <div className="receipt-row">
            <span>Status:</span>
            <span className="status-success">Completed</span>
          </div>
          <div className="receipt-row highlight">
            <span>New Balance:</span>
            <span>KSH {(currentLoan.balance - parseInt(paymentData.amount)).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="success-actions">
        <button className="btn btn-secondary">
          <Download size={16} />
          Download Receipt
        </button>
        <button 
          className="btn btn-primary"
          onClick={resetPayment}
        >
          Make Another Payment
        </button>
      </div>

      <div className="next-payment-info">
        <div className="info-card">
          <h5>Next Payment Due</h5>
          <p>Your next payment of <strong>KSH {currentLoan.nextPayment.amount.toLocaleString()}</strong> is due on <strong>{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</strong></p>
          <button className="btn btn-outline btn-sm">
            Set Reminder
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="payment-portal">
      <div className="portal-header">
        <h1>Make Payment</h1>
        <div className="security-badge">
          <Shield size={16} />
          <span>Secure Payment</span>
        </div>
      </div>

      <div className="payment-container">
        {/* Progress Indicator */}
        <div className="payment-progress">
          <div className={`progress-step ${paymentStep === 'select' ? 'active' : paymentStep !== 'select' ? 'completed' : ''}`}>
            <div className="step-circle">1</div>
            <span>Select Method</span>
          </div>
          <div className={`progress-step ${paymentStep === 'process' ? 'active' : paymentStep === 'confirm' || paymentStep === 'success' ? 'completed' : ''}`}>
            <div className="step-circle">2</div>
            <span>Process</span>
          </div>
          <div className={`progress-step ${paymentStep === 'confirm' ? 'active' : paymentStep === 'success' ? 'completed' : ''}`}>
            <div className="step-circle">3</div>
            <span>Confirm</span>
          </div>
          <div className={`progress-step ${paymentStep === 'success' ? 'active' : ''}`}>
            <div className="step-circle">4</div>
            <span>Complete</span>
          </div>
        </div>

        {/* Payment Content */}
        <div className="payment-content">
          {paymentStep === 'select' && (
            <>
              {renderPaymentMethodSelection()}
              {activeMethod && renderAmountSelection()}
              
              {paymentData.amount && paymentData.phone && (
                <div className="proceed-section">
                  <button 
                    className="btn btn-primary proceed-btn"
                    onClick={initiatePayment}
                    disabled={processing}
                  >
                    <Zap size={16} />
                    Pay KSH {parseInt(paymentData.amount).toLocaleString()}
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
          
          {paymentStep === 'process' && renderProcessingPayment()}
          {paymentStep === 'confirm' && renderConfirmPayment()}
          {paymentStep === 'success' && renderSuccessPayment()}
        </div>
      </div>
    </div>
  )
}

export default PaymentPortal