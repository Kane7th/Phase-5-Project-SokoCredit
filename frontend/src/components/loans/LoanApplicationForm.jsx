import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { 
  DollarSign, 
  Calendar, 
  FileText, 
  User, 
  Building,
  Calculator,
  ArrowLeft,
  ArrowRight,
  Check
} from 'lucide-react'
import api from '../../services/api'
import '../../styles/loan-application.css'

const LoanApplicationForm = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [loanCalculation, setLoanCalculation] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const isCustomer = user?.role === 'customer'

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger
  } = useForm({
    defaultValues: {
      customer_id: isCustomer ? user?.id : '',
      loan_type: 'business',
      amount: '',
      duration_months: '6',
      repayment_frequency: 'weekly',
      purpose: '',
      collateral: '',
      business_revenue: '',
      expenses: '',
      other_loans: 'no'
    }
  })

  const watchedAmount = watch('amount')
  const watchedDuration = watch('duration_months')
  const watchedFrequency = watch('repayment_frequency')

  const steps = [
    { number: 1, title: 'Loan Details', icon: DollarSign },
    { number: 2, title: 'Financial Info', icon: Calculator },
    { number: 3, title: 'Review & Submit', icon: Check }
  ]

  const [customers, setCustomers] = useState([])

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/customers')
        const data = await response.json()
        setCustomers(data.customers || [])
      } catch (error) {
        console.error('Failed to fetch customers:', error)
      }
    }
    fetchCustomers()
  }, [])

  const calculateLoanTerms = () => {
    const principal = parseFloat(watchedAmount) || 0
    const months = parseInt(watchedDuration) || 6
    const frequency = watchedFrequency
    const annualRate = 0.12 // 12% annual interest rate

    if (principal > 0 && months > 0) {
      const totalInterest = principal * annualRate * (months / 12)
      const totalAmount = principal + totalInterest
      
      let paymentCount
      let paymentInterval
      
      switch (frequency) {
        case 'daily':
          paymentCount = months * 30
          paymentInterval = 'daily'
          break
        case 'weekly':
          paymentCount = months * 4.33
          paymentInterval = 'weekly'
          break
        case 'monthly':
          paymentCount = months
          paymentInterval = 'monthly'
          break
        default:
          paymentCount = months * 4.33
          paymentInterval = 'weekly'
      }

      const paymentAmount = totalAmount / paymentCount

      setLoanCalculation({
        principal,
        totalInterest,
        totalAmount,
        paymentAmount: Math.round(paymentAmount),
        paymentCount: Math.round(paymentCount),
        paymentInterval,
        months
      })
    }
  }

  useEffect(() => {
    if (watchedAmount && watchedDuration) {
      calculateLoanTerms()
    }
  }, [watchedAmount, watchedDuration, watchedFrequency])

  const nextStep = async () => {
    let fieldsToValidate = []
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['amount', 'duration_months', 'loan_type', 'purpose']
        if (!isCustomer) {
          fieldsToValidate.push('customer_id')
        }
        break
      case 2:
        fieldsToValidate = ['business_revenue', 'expenses']
        break
    }

    const isValid = await trigger(fieldsToValidate)
    
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data) => {
    try {
      const payload = {
        amount: parseFloat(data.amount),
        interest_rate: 0.12,
        duration_months: parseInt(data.duration_months)
      }
      await api.post('/loans', payload)
      navigate('/dashboard')
    } catch (error) {
      console.error('Loan application failed:', error)
      const message = error.response?.data?.error || 'Failed to submit loan application. Please try again.'
      alert(message)
    }
  }

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className={`step ${
            currentStep === step.number ? 'active' : 
            currentStep > step.number ? 'completed' : ''
          }`}>
            <div className="step-number">
              {currentStep > step.number ? <Check size={16} /> : step.number}
            </div>
            <span className="step-title">{step.title}</span>
          </div>
          {index < steps.length - 1 && <div className="step-connector" />}
        </React.Fragment>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <div className="form-step">
      <h3 className="step-heading">Loan Application Details</h3>
      
      {!isCustomer && (
        <div className="form-group">
          <label className="form-label">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} />
              Select Customer *
            </div>
          </label>
          <select
            className={`form-select ${errors.customer_id ? 'error' : ''}`}
            {...register('customer_id', { required: 'Please select a customer' })}
            onChange={(e) => {
              const customer = customers.find(c => c.id === parseInt(e.target.value))
              setSelectedCustomer(customer)
            }}
          >
            <option value="">Choose a customer</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name} - {customer.business}
              </option>
            ))}
          </select>
          {errors.customer_id && (
            <div className="text-error">{errors.customer_id.message}</div>
          )}
        </div>
      )}

      <div>
        <div className="form-group">
          <label className="form-label">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={16} />
              Loan Amount (KSH) *
            </div>
          </label>
          <input
            type="number"
            className={`form-input ${errors.amount ? 'error' : ''}`}
            placeholder="50000"
            min="1000"
            max="500000"
            step="1000"
            {...register('amount', {
              required: 'Loan amount is required',
              min: { value: 1000, message: 'Minimum loan amount is KSH 1,000' },
              max: { value: 500000, message: 'Maximum loan amount is KSH 500,000' }
            })}
          />
          {errors.amount && (
            <div className="text-error">{errors.amount.message}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} />
              Loan Duration *
            </div>
          </label>
          <select
            className={`form-select ${errors.duration_months ? 'error' : ''}`}
            {...register('duration_months', { required: 'Please select loan duration' })}
          >
            <option value="3">3 Months</option>
            <option value="6">6 Months</option>
            <option value="9">9 Months</option>
            <option value="12">12 Months</option>
            <option value="18">18 Months</option>
            <option value="24">24 Months</option>
          </select>
          {errors.duration_months && (
            <div className="text-error">{errors.duration_months.message}</div>
          )}
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Loan Type *</label>
          <select
            className={`form-select ${errors.loan_type ? 'error' : ''}`}
            {...register('loan_type', { required: 'Please select loan type' })}
          >
            <option value="business">Business Expansion</option>
            <option value="inventory">Inventory Financing</option>
            <option value="equipment">Equipment Purchase</option>
            <option value="emergency">Emergency Loan</option>
            <option value="personal">Personal Loan</option>
          </select>
          {errors.loan_type && (
            <div className="text-error">{errors.loan_type.message}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Repayment Frequency *</label>
          <select
            className="form-select"
            {...register('repayment_frequency')}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} />
            Loan Purpose *
          </div>
        </label>
        <textarea
          className={`form-input form-textarea ${errors.purpose ? 'error' : ''}`}
          rows={4}
          placeholder="Describe how you plan to use this loan..."
          {...register('purpose', {
            required: 'Please describe the loan purpose',
            minLength: { value: 20, message: 'Please provide at least 20 characters' }
          })}
        />
        {errors.purpose && (
          <div className="text-error">{errors.purpose.message}</div>
        )}
      </div>

      {loanCalculation && (
        <div className="calculation-preview">
          <h4>Loan Calculation Preview</h4>
          <div className="calculation-grid">
            <div className="calc-item">
              <label>Principal Amount</label>
              <value>KSH {loanCalculation.principal.toLocaleString()}</value>
            </div>
            <div className="calc-item">
              <label>Total Interest</label>
              <value>KSH {loanCalculation.totalInterest.toLocaleString()}</value>
            </div>
            <div className="calc-item">
              <label>Total Repayment</label>
              <value>KSH {loanCalculation.totalAmount.toLocaleString()}</value>
            </div>
            <div className="calc-item highlight">
              <label>{loanCalculation.paymentInterval} Payment</label>
              <value>KSH {loanCalculation.paymentAmount.toLocaleString()}</value>
            </div>
          </div>
          <div className="calc-summary">
            <p>
              You will make {loanCalculation.paymentCount} {loanCalculation.paymentInterval} payments 
              of KSH {loanCalculation.paymentAmount.toLocaleString()} each over {loanCalculation.months} months.
            </p>
          </div>
        </div>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="form-step">
      <h3 className="step-heading">Financial Information</h3>
      
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={16} />
              Monthly Business Revenue (KSH) *
            </div>
          </label>
          <input
            type="number"
            className={`form-input ${errors.business_revenue ? 'error' : ''}`}
            placeholder="30000"
            min="0"
            step="1000"
            {...register('business_revenue', {
              required: 'Monthly revenue is required',
              min: { value: 1000, message: 'Revenue must be at least KSH 1,000' }
            })}
          />
          {errors.business_revenue && (
            <div className="text-error">{errors.business_revenue.message}</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Monthly Business Expenses (KSH) *</label>
          <input
            type="number"
            className={`form-input ${errors.expenses ? 'error' : ''}`}
            placeholder="15000"
            min="0"
            step="1000"
            {...register('expenses', {
              required: 'Monthly expenses are required',
              min: { value: 0, message: 'Expenses cannot be negative' }
            })}
          />
          {errors.expenses && (
            <div className="text-error">{errors.expenses.message}</div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Collateral/Security (Optional)</label>
        <textarea
          className="form-input form-textarea"
          rows={3}
          placeholder="Describe any collateral or security you can provide..."
          {...register('collateral')}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Do you have any other existing loans? *</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              value="no"
              {...register('other_loans', { required: 'Please select an option' })}
            />
            <span>No, this is my first loan</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              value="yes"
              {...register('other_loans')}
            />
            <span>Yes, I have other loans</span>
          </label>
        </div>
        {errors.other_loans && (
          <div className="text-error">{errors.other_loans.message}</div>
        )}
      </div>

      {watch('other_loans') === 'yes' && (
        <div className="form-group">
          <label className="form-label">Other Loans Details</label>
          <textarea
            className="form-input form-textarea"
            rows={3}
            placeholder="Please describe your other loans..."
            {...register('other_loans_details')}
          />
        </div>
      )}
    </div>
  )

  const renderStep3 = () => {
    const formData = watch()
    
    return (
      <div className="form-step">
        <h3 className="step-heading">Review Your Application</h3>
        
        <div className="review-sections">
          {/* Applicant Information */}
          <div className="review-section">
            <h4>Applicant Information</h4>
            <div className="review-grid">
              <div className="review-item">
                <label>Name:</label>
                <value>
                  {isCustomer 
                    ? user?.full_name 
                    : selectedCustomer?.name || 'Not selected'
                  }
                </value>
              </div>
              <div className="review-item">
                <label>Business:</label>
                <value>
                  {isCustomer 
                    ? user?.business_name 
                    : selectedCustomer?.business || 'Not selected'
                  }
                </value>
              </div>
              <div className="review-item">
                <label>Phone:</label>
                <value>
                  {isCustomer 
                    ? user?.phone 
                    : selectedCustomer?.phone || 'Not selected'
                  }
                </value>
              </div>
            </div>
          </div>

          {/* Loan Details */}
          <div className="review-section">
            <h4>Loan Details</h4>
            <div className="review-grid">
              <div className="review-item">
                <label>Loan Type:</label>
                <value>{formData.loan_type?.replace('_', ' ')}</value>
              </div>
              <div className="review-item">
                <label>Amount:</label>
                <value>KSH {parseInt(formData.amount).toLocaleString()}</value>
              </div>
              <div className="review-item">
                <label>Duration:</label>
                <value>{formData.duration_months} months</value>
              </div>
              <div className="review-item">
                <label>Repayment:</label>
                <value>{formData.repayment_frequency}</value>
              </div>
            </div>
            <div className="review-item-full">
              <label>Purpose:</label>
              <value>{formData.purpose}</value>
            </div>
          </div>

          {/* Financial Information */}
          <div className="review-section">
            <h4>Financial Information</h4>
            <div className="review-grid">
              <div className="review-item">
                <label>Monthly Revenue:</label>
                <value>KSH {parseInt(formData.business_revenue || 0).toLocaleString()}</value>
              </div>
              <div className="review-item">
                <label>Monthly Expenses:</label>
                <value>KSH {parseInt(formData.expenses || 0).toLocaleString()}</value>
              </div>
              <div className="review-item">
                <label>Net Income:</label>
                <value>KSH {(parseInt(formData.business_revenue || 0) - parseInt(formData.expenses || 0)).toLocaleString()}</value>
              </div>
              <div className="review-item">
                <label>Other Loans:</label>
                <value>{formData.other_loans === 'yes' ? 'Yes' : 'No'}</value>
              </div>
            </div>
          </div>

          {loanCalculation && (
            <div className="review-section highlight">
              <h4>Loan Terms & Repayment</h4>
              <div className="calculation-summary">
                <div className="calc-row">
                  <span>Principal Amount:</span>
                  <span>KSH {loanCalculation.principal.toLocaleString()}</span>
                </div>
                <div className="calc-row">
                  <span>Interest (12% annual):</span>
                  <span>KSH {loanCalculation.totalInterest.toLocaleString()}</span>
                </div>
                <div className="calc-row total">
                  <span>Total Repayment:</span>
                  <span>KSH {loanCalculation.totalAmount.toLocaleString()}</span>
                </div>
                <div className="calc-row payment">
                  <span>Payment Amount ({loanCalculation.paymentInterval}):</span>
                  <span>KSH {loanCalculation.paymentAmount.toLocaleString()}</span>
                </div>
                <div className="calc-row">
                  <span>Number of Payments:</span>
                  <span>{loanCalculation.paymentCount} payments</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="loan-application-container">
      <div className="application-header">
        <button 
          onClick={() => navigate(-1)}
          className="back-button"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1>
          {isCustomer ? 'Apply for Loan' : 'New Loan Application'}
        </h1>
      </div>

      {renderStepIndicator()}

      <form onSubmit={handleSubmit(onSubmit)} className="application-form">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        <div className="form-navigation">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="btn btn-secondary nav-btn"
            >
              <ArrowLeft size={16} />
              Previous
            </button>
          )}
          
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="btn btn-primary nav-btn"
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-success nav-btn"
            >
              <Check size={16} />
              Submit Application
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default LoanApplicationForm
