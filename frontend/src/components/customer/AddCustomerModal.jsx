import React, { useState } from 'react'
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building, 
  Calendar, 
  DollarSign,
  Upload,
  Plus,
  CheckCircle
} from 'lucide-react'

const AddCustomerModal = ({ onClose, onAdd }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [customerData, setCustomerData] = useState({
    // Personal Information
    name: '',
    phone: '',
    email: '',
    idNumber: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    dependents: 0,
    education: '',
    address: '',
    
    // Business Information
    businessName: '',
    businessType: '',
    businessLocation: '',
    businessEstablished: '',
    businessDescription: '',
    
    // Financial Information
    monthlyIncome: '',
    monthlyExpenses: '',
    bankAccount: false,
    savingsAccount: false,
    
    // Additional Information
    notes: '',
    tags: []
  })

  const [errors, setErrors] = useState({})
  const [uploadedDocuments, setUploadedDocuments] = useState({})

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Business Info', icon: Building },
    { number: 3, title: 'Financial Info', icon: DollarSign },
    { number: 4, title: 'Documents', icon: Upload }
  ]

  const validateStep = (step) => {
    const newErrors = {}
    
    switch (step) {
      case 1:
        if (!customerData.name.trim()) newErrors.name = 'Name is required'
        if (!customerData.phone.trim()) newErrors.phone = 'Phone is required'
        if (!customerData.idNumber.trim()) newErrors.idNumber = 'ID number is required'
        if (!customerData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
        if (!customerData.gender) newErrors.gender = 'Gender is required'
        if (!customerData.address.trim()) newErrors.address = 'Address is required'
        break
        
      case 2:
        if (!customerData.businessName.trim()) newErrors.businessName = 'Business name is required'
        if (!customerData.businessType) newErrors.businessType = 'Business type is required'
        if (!customerData.businessLocation.trim()) newErrors.businessLocation = 'Business location is required'
        if (!customerData.businessEstablished) newErrors.businessEstablished = 'Business establishment date is required'
        break
        
      case 3:
        if (!customerData.monthlyIncome || customerData.monthlyIncome <= 0) {
          newErrors.monthlyIncome = 'Valid monthly income is required'
        }
        if (!customerData.monthlyExpenses || customerData.monthlyExpenses < 0) {
          newErrors.monthlyExpenses = 'Valid monthly expenses is required'
        }
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      const newCustomer = {
        ...customerData,
        business: {
          name: customerData.businessName,
          type: customerData.businessType,
          location: customerData.businessLocation,
          established: customerData.businessEstablished,
          description: customerData.businessDescription
        },
        personalInfo: {
          idNumber: customerData.idNumber,
          dateOfBirth: customerData.dateOfBirth,
          gender: customerData.gender,
          maritalStatus: customerData.maritalStatus,
          dependents: customerData.dependents,
          education: customerData.education,
          address: customerData.address
        },
        financial: {
          monthlyIncome: parseInt(customerData.monthlyIncome),
          monthlyExpenses: parseInt(customerData.monthlyExpenses),
          netIncome: parseInt(customerData.monthlyIncome) - parseInt(customerData.monthlyExpenses),
          bankAccount: customerData.bankAccount,
          savingsAccount: customerData.savingsAccount
        },
        creditProfile: {
          score: 650, // Default score for new customers
          rating: 'good',
          totalLoans: 0,
          activeLoans: 0,
          completedLoans: 0,
          totalBorrowed: 0,
          totalRepaid: 0,
          currentBalance: 0,
          paymentHistory: null,
          averagePaymentDays: null,
          lastPaymentDate: null
        },
        status: 'active',
        segment: 'standard',
        riskLevel: 'medium',
        registrationDate: new Date().toISOString(),
        lastActivityDate: new Date().toISOString(),
        assignedLender: null,
        tags: customerData.tags,
        notes: customerData.notes,
        documents: {
          idCopy: { status: 'missing', uploadDate: null },
          businessPermit: { status: 'missing', uploadDate: null },
          bankStatement: { status: 'missing', uploadDate: null },
          passport: { status: 'missing', uploadDate: null }
        },
        communications: []
      }
      
      onAdd(newCustomer)
    }
  }

  const handleInputChange = (field, value) => {
    setCustomerData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleFileUpload = (documentType, file) => {
    setUploadedDocuments(prev => ({
      ...prev,
      [documentType]: {
        file,
        status: 'uploaded',
        uploadDate: new Date().toISOString()
      }
    }))
  }

  const StepIndicator = () => (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className={`step ${
            currentStep === step.number ? 'active' : 
            currentStep > step.number ? 'completed' : ''
          }`}>
            <div className="step-number">
              {currentStep > step.number ? <CheckCircle size={16} /> : step.number}
            </div>
            <span className="step-title">{step.title}</span>
          </div>
          {index < steps.length - 1 && <div className="step-connector" />}
        </React.Fragment>
      ))}
    </div>
  )

  const PersonalInfoStep = () => (
    <div className="step-content">
      <h3>Personal Information</h3>
      
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            className={`form-input ${errors.name ? 'error' : ''}`}
            value={customerData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter full name"
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number *</label>
          <input
            type="tel"
            className={`form-input ${errors.phone ? 'error' : ''}`}
            value={customerData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+254712345678"
          />
          {errors.phone && <span className="error-text">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Email (Optional)</label>
          <input
            type="email"
            className="form-input"
            value={customerData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="email@example.com"
          />
        </div>

        <div className="form-group">
          <label className="form-label">ID Number *</label>
          <input
            type="text"
            className={`form-input ${errors.idNumber ? 'error' : ''}`}
            value={customerData.idNumber}
            onChange={(e) => handleInputChange('idNumber', e.target.value)}
            placeholder="12345678"
          />
          {errors.idNumber && <span className="error-text">{errors.idNumber}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Date of Birth *</label>
          <input
            type="date"
            className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
            value={customerData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
          />
          {errors.dateOfBirth && <span className="error-text">{errors.dateOfBirth}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Gender *</label>
          <select
            className={`form-select ${errors.gender ? 'error' : ''}`}
            value={customerData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && <span className="error-text">{errors.gender}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Marital Status</label>
          <select
            className="form-select"
            value={customerData.maritalStatus}
            onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
          >
            <option value="">Select status</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Number of Dependents</label>
          <input
            type="number"
            className="form-input"
            value={customerData.dependents}
            onChange={(e) => handleInputChange('dependents', parseInt(e.target.value) || 0)}
            min="0"
            max="20"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Education Level</label>
          <select
            className="form-select"
            value={customerData.education}
            onChange={(e) => handleInputChange('education', e.target.value)}
          >
            <option value="">Select education</option>
            <option value="none">No formal education</option>
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="certificate">Certificate</option>
            <option value="diploma">Diploma</option>
            <option value="degree">Degree</option>
            <option value="postgraduate">Postgraduate</option>
          </select>
        </div>

        <div className="form-group full-width">
          <label className="form-label">Address *</label>
          <textarea
            className={`form-input form-textarea ${errors.address ? 'error' : ''}`}
            value={customerData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Enter full address"
            rows={3}
          />
          {errors.address && <span className="error-text">{errors.address}</span>}
        </div>
      </div>
    </div>
  )

  const BusinessInfoStep = () => (
    <div className="step-content">
      <h3>Business Information</h3>
      
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Business Name *</label>
          <input
            type="text"
            className={`form-input ${errors.businessName ? 'error' : ''}`}
            value={customerData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            placeholder="Enter business name"
          />
          {errors.businessName && <span className="error-text">{errors.businessName}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Business Type *</label>
          <select
            className={`form-select ${errors.businessType ? 'error' : ''}`}
            value={customerData.businessType}
            onChange={(e) => handleInputChange('businessType', e.target.value)}
          >
            <option value="">Select business type</option>
            <option value="mama_mboga">Mama Mboga (Vegetable Vendor)</option>
            <option value="fruit_vendor">Fruit Vendor</option>
            <option value="general_store">General Store</option>
            <option value="restaurant">Restaurant/Food Service</option>
            <option value="transport">Transport Services</option>
            <option value="tailoring">Tailoring/Fashion</option>
            <option value="hair_salon">Hair Salon/Beauty</option>
            <option value="electronics">Electronics</option>
            <option value="farming">Farming/Agriculture</option>
            <option value="other">Other</option>
          </select>
          {errors.businessType && <span className="error-text">{errors.businessType}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Business Location *</label>
          <input
            type="text"
            className={`form-input ${errors.businessLocation ? 'error' : ''}`}
            value={customerData.businessLocation}
            onChange={(e) => handleInputChange('businessLocation', e.target.value)}
            placeholder="e.g., Kawangware Market"
          />
          {errors.businessLocation && <span className="error-text">{errors.businessLocation}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Business Established *</label>
          <input
            type="date"
            className={`form-input ${errors.businessEstablished ? 'error' : ''}`}
            value={customerData.businessEstablished}
            onChange={(e) => handleInputChange('businessEstablished', e.target.value)}
          />
          {errors.businessEstablished && <span className="error-text">{errors.businessEstablished}</span>}
        </div>

        <div className="form-group full-width">
          <label className="form-label">Business Description</label>
          <textarea
            className="form-input form-textarea"
            value={customerData.businessDescription}
            onChange={(e) => handleInputChange('businessDescription', e.target.value)}
            placeholder="Describe the business activities..."
            rows={3}
          />
        </div>
      </div>
    </div>
  )

  const FinancialInfoStep = () => (
    <div className="step-content">
      <h3>Financial Information</h3>
      
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Monthly Income (KSH) *</label>
          <input
            type="number"
            className={`form-input ${errors.monthlyIncome ? 'error' : ''}`}
            value={customerData.monthlyIncome}
            onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
            placeholder="30000"
            min="0"
            step="1000"
          />
          {errors.monthlyIncome && <span className="error-text">{errors.monthlyIncome}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Monthly Expenses (KSH) *</label>
          <input
            type="number"
            className={`form-input ${errors.monthlyExpenses ? 'error' : ''}`}
            value={customerData.monthlyExpenses}
            onChange={(e) => handleInputChange('monthlyExpenses', e.target.value)}
            placeholder="20000"
            min="0"
            step="1000"
          />
          {errors.monthlyExpenses && <span className="error-text">{errors.monthlyExpenses}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Net Monthly Income (KSH)</label>
          <input
            type="number"
            className="form-input"
            value={customerData.monthlyIncome && customerData.monthlyExpenses ? 
              (parseInt(customerData.monthlyIncome) - parseInt(customerData.monthlyExpenses)) : ''}
            disabled
            placeholder="Calculated automatically"
          />
        </div>

        <div className="form-group">
          <div className="checkbox-group">
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={customerData.bankAccount}
                onChange={(e) => handleInputChange('bankAccount', e.target.checked)}
              />
              <span className="checkmark"></span>
              <span className="checkbox-text">Has Bank Account</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <div className="checkbox-group">
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={customerData.savingsAccount}
                onChange={(e) => handleInputChange('savingsAccount', e.target.checked)}
              />
              <span className="checkmark"></span>
              <span className="checkbox-text">Has Savings Account</span>
            </label>
          </div>
        </div>

        <div className="form-group full-width">
          <label className="form-label">Additional Notes</label>
          <textarea
            className="form-input form-textarea"
            value={customerData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Any additional information about the customer..."
            rows={4}
          />
        </div>
      </div>
    </div>
  )

  const DocumentsStep = () => (
    <div className="step-content">
      <h3>Document Upload</h3>
      <p>Upload customer documents for verification (optional at registration)</p>
      
      <div className="documents-upload">
        {[
          { key: 'idCopy', label: 'ID Copy', required: true },
          { key: 'businessPermit', label: 'Business Permit', required: false },
          { key: 'bankStatement', label: 'Bank Statement', required: false },
          { key: 'passport', label: 'Passport Photo', required: true }
        ].map(doc => (
          <div key={doc.key} className="upload-item">
            <div className="upload-header">
              <span className="upload-label">
                {doc.label} {doc.required && '*'}
              </span>
              {uploadedDocuments[doc.key] && (
                <CheckCircle size={16} style={{ color: '#10B981' }} />
              )}
            </div>
            
            <div className="upload-area">
              <input
                type="file"
                id={doc.key}
                accept="image/*,.pdf"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    handleFileUpload(doc.key, e.target.files[0])
                  }
                }}
                style={{ display: 'none' }}
              />
              <label htmlFor={doc.key} className="upload-button">
                <Upload size={20} />
                {uploadedDocuments[doc.key] ? 
                  `${uploadedDocuments[doc.key].file.name}` : 
                  'Choose file'
                }
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="upload-note">
        <p>Supported formats: JPG, PNG, PDF (Max size: 5MB)</p>
        <p>Documents can also be uploaded later from the customer profile.</p>
      </div>
    </div>
  )

  return (
    <div className="add-customer-overlay">
      <div className="add-customer-modal">
        <div className="modal-header">
          <h2>Add New Customer</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <StepIndicator />

        <div className="modal-content">
          {currentStep === 1 && <PersonalInfoStep />}
          {currentStep === 2 && <BusinessInfoStep />}
          {currentStep === 3 && <FinancialInfoStep />}
          {currentStep === 4 && <DocumentsStep />}
        </div>

        <div className="modal-footer">
          <div className="footer-actions">
            {currentStep > 1 && (
              <button className="btn btn-secondary" onClick={prevStep}>
                Previous
              </button>
            )}
            
            {currentStep < 4 ? (
              <button className="btn btn-primary" onClick={nextStep}>
                Next
              </button>
            ) : (
              <button className="btn btn-success" onClick={handleSubmit}>
                <Plus size={16} />
                Add Customer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddCustomerModal