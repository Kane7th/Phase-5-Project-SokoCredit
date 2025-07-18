import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { 
  User, Mail, Phone, Lock, Building, MapPin, 
  FileText, Upload, Eye, EyeOff, Check, ArrowLeft, ArrowRight 
} from 'lucide-react'
import { 
  registerUser, 
  clearError, 
  setRegistrationStep, 
  updateRegistrationData,
  clearRegistrationData 
} from '../../store/authSlice'
// import LoadingSpinner from '../common/LoadingSpinner'
// import FileUpload from '../common/FileUpload'
import '../../styles/auth.css'

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [uploadedDocuments, setUploadedDocuments] = useState({
    id_document: null,
    business_permit: null,
    passport_photo: null
  })

  const dispatch = useDispatch()
  const { 
    isLoading, 
    error, 
    registrationStep, 
    registrationData 
  } = useSelector((state) => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    // reset
  } = useForm({
    defaultValues: registrationData
  })

  const watchedPassword = watch('password')

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Business Info', icon: Building },
    { number: 3, title: 'Documents', icon: FileText },
    { number: 4, title: 'Review', icon: Check }
  ]

  const nextStep = async () => {
    let fieldsToValidate = []
    
    switch (registrationStep) {
      case 1:
        fieldsToValidate = ['full_name', 'email', 'phone', 'password', 'confirm_password']
        break
      case 2:
        fieldsToValidate = ['business_name', 'business_type', 'business_description', 'location', 'average_income']
        break
      case 3:
        // Document validation will be handled separately
        if (!uploadedDocuments.id_document || !uploadedDocuments.passport_photo) {
          dispatch(clearError())
          // We'll show an error for missing documents
          return
        }
        break
    }

    const isValid = await trigger(fieldsToValidate)
    
    if (isValid) {
      if (registrationStep < 4) {
        dispatch(setRegistrationStep(registrationStep + 1))
      }
    }
  }

  const prevStep = () => {
    if (registrationStep > 1) {
      dispatch(setRegistrationStep(registrationStep - 1))
    }
  }

  const onSubmit = async (data) => {
    if (registrationStep === 4) {
      // Final submission
      const formData = new FormData()
      
      // Add all form data
      Object.keys(data).forEach(key => {
        if (key !== 'confirm_password') {
          formData.append(key, data[key])
        }
      })

      // Add uploaded documents
      Object.keys(uploadedDocuments).forEach(docType => {
        if (uploadedDocuments[docType]) {
          formData.append(docType, uploadedDocuments[docType].file)
        }
      })

      dispatch(registerUser(formData))
    } else {
      // Save current step data and move to next
      dispatch(updateRegistrationData(data))
      nextStep()
    }
  }

  const handleDocumentUpload = (docType, file) => {
    setUploadedDocuments(prev => ({
      ...prev,
      [docType]: file ? { file, name: file.name } : null
    }))
  }

  const renderStepIndicator = () => (
    <div className="form-steps">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <div className={`form-step ${
            registrationStep === step.number ? 'active' : 
            registrationStep > step.number ? 'completed' : ''
          }`}>
            <div className="step-number">
              {registrationStep > step.number ? <Check size={16} /> : step.number}
            </div>
            <span>{step.title}</span>
          </div>
          {index < steps.length - 1 && <div className="step-connector" />}
        </React.Fragment>
      ))}
    </div>
  )

  const renderStep1 = () => (
    <>
      <h3 className="heading-3" style={{ marginBottom: '24px', textAlign: 'center' }}>
        Personal Information
      </h3>

      <div className="form-group">
        <label className="form-label">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} />
            Full Name *
          </div>
        </label>
        <input
          type="text"
          className={`form-input ${errors.full_name ? 'error' : ''}`}
          placeholder="Enter your full name"
          {...register('full_name', {
            required: 'Full name is required',
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters'
            }
          })}
        />
        {errors.full_name && (
          <div className="text-error">{errors.full_name.message}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={16} />
            Email Address *
          </div>
        </label>
        <input
          type="email"
          className={`form-input ${errors.email ? 'error' : ''}`}
          placeholder="Enter your email address"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Please enter a valid email address'
            }
          })}
        />
        {errors.email && (
          <div className="text-error">{errors.email.message}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Phone size={16} />
            Phone Number *
          </div>
        </label>
        <input
          type="tel"
          className={`form-input ${errors.phone ? 'error' : ''}`}
          placeholder="+254712345678"
          {...register('phone', {
            required: 'Phone number is required',
            pattern: {
              value: /^[+]?[0-9\s-()]{10,}$/,
              message: 'Please enter a valid phone number'
            }
          })}
        />
        {errors.phone && (
          <div className="text-error">{errors.phone.message}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={16} />
            Password *
          </div>
        </label>
        <div className="password-input-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            className={`form-input ${errors.password ? 'error' : ''}`}
            placeholder="Create a strong password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters'
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Password must contain uppercase, lowercase, and number'
              }
            })}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && (
          <div className="text-error">{errors.password.message}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={16} />
            Confirm Password *
          </div>
        </label>
        <div className="password-input-wrapper">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            className={`form-input ${errors.confirm_password ? 'error' : ''}`}
            placeholder="Confirm your password"
            {...register('confirm_password', {
              required: 'Please confirm your password',
              validate: value => 
                value === watchedPassword || 'Passwords do not match'
            })}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.confirm_password && (
          <div className="text-error">{errors.confirm_password.message}</div>
        )}
      </div>
    </>
  )

  const renderStep2 = () => (
    <>
      <h3 className="heading-3" style={{ marginBottom: '24px', textAlign: 'center' }}>
        Business Information
      </h3>

      <div className="form-group">
        <label className="form-label">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={16} />
            Business Name *
          </div>
        </label>
        <input
          type="text"
          className={`form-input ${errors.business_name ? 'error' : ''}`}
          placeholder="Enter your business name"
          {...register('business_name', {
            required: 'Business name is required',
            minLength: {
              value: 2,
              message: 'Business name must be at least 2 characters'
            }
          })}
        />
        {errors.business_name && (
          <div className="text-error">{errors.business_name.message}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Business Type *</label>
        <select
          className={`form-select ${errors.business_type ? 'error' : ''}`}
          {...register('business_type', {
            required: 'Please select a business type'
          })}
        >
          <option value="">Select business type</option>
          <option value="mama_mboga">Mama Mboga (Vegetable/Fruit Vendor)</option>
          <option value="general_store">General Store</option>
          <option value="restaurant">Restaurant/Food Business</option>
          <option value="salon">Beauty Salon/Barbershop</option>
          <option value="tailoring">Tailoring/Fashion</option>
          <option value="electronics">Electronics Shop</option>
          <option value="transport">Transport Business</option>
          <option value="agriculture">Agriculture/Farming</option>
          <option value="other">Other</option>
        </select>
        {errors.business_type && (
          <div className="text-error">{errors.business_type.message}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Business Description *</label>
        <textarea
          className={`form-input form-textarea ${errors.business_description ? 'error' : ''}`}
          placeholder="Describe your business activities..."
          rows={4}
          {...register('business_description', {
            required: 'Business description is required',
            minLength: {
              value: 20,
              message: 'Please provide at least 20 characters'
            }
          })}
        />
        {errors.business_description && (
          <div className="text-error">{errors.business_description.message}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} />
            Business Location *
          </div>
        </label>
        <input
          type="text"
          className={`form-input ${errors.location ? 'error' : ''}`}
          placeholder="e.g., Kawangware Market, Nairobi"
          {...register('location', {
            required: 'Business location is required'
          })}
        />
        {errors.location && (
          <div className="text-error">{errors.location.message}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Average Monthly Income (KSH) *</label>
        <input
          type="number"
          className={`form-input ${errors.average_income ? 'error' : ''}`}
          placeholder="50000"
          min="0"
          step="1000"
          {...register('average_income', {
            required: 'Average income is required',
            min: {
              value: 1000,
              message: 'Income must be at least KSH 1,000'
            }
          })}
        />
        {errors.average_income && (
          <div className="text-error">{errors.average_income.message}</div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Preferred Language</label>
        <select
          className="form-select"
          {...register('language_preference')}
        >
          <option value="en">English</option>
          <option value="sw">Kiswahili</option>
          <option value="ki">Kikuyu</option>
          <option value="lu">Luo</option>
          <option value="ka">Kalenjin</option>
        </select>
      </div>
    </>
  )

  const renderStep3 = () => (
    <>
      <h3 className="heading-3" style={{ marginBottom: '24px', textAlign: 'center' }}>
        Document Upload
      </h3>
      
      <p style={{ textAlign: 'center', color: 'var(--gray-500)', marginBottom: '32px' }}>
        Please upload the required documents to verify your identity and business
      </p>

      <FileUpload
        label="National ID or Passport *"
        acceptedTypes=".pdf,.jpg,.jpeg,.png"
        maxSize={5}
        required
        onFileSelect={(file) => handleDocumentUpload('id_document', file)}
        existingFile={uploadedDocuments.id_document}
      />

      <FileUpload
        label="Business Permit/License"
        acceptedTypes=".pdf,.jpg,.jpeg,.png"
        maxSize={5}
        onFileSelect={(file) => handleDocumentUpload('business_permit', file)}
        existingFile={uploadedDocuments.business_permit}
      />

      <FileUpload
        label="Passport Photo *"
        acceptedTypes=".jpg,.jpeg,.png"
        maxSize={2}
        required
        onFileSelect={(file) => handleDocumentUpload('passport_photo', file)}
        existingFile={uploadedDocuments.passport_photo}
      />

      {(!uploadedDocuments.id_document || !uploadedDocuments.passport_photo) && (
        <div className="error-message">
          Please upload all required documents to continue
        </div>
      )}
    </>
  )

  const renderStep4 = () => {
    const formData = watch()
    
    return (
      <>
        <h3 className="heading-3" style={{ marginBottom: '24px', textAlign: 'center' }}>
          Review Your Information
        </h3>

        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h4>Personal Information</h4>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <strong>Full Name:</strong> {formData.full_name}
              </div>
              <div>
                <strong>Email:</strong> {formData.email}
              </div>
              <div>
                <strong>Phone:</strong> {formData.phone}
              </div>
              <div>
                <strong>Language:</strong> {formData.language_preference || 'English'}
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h4>Business Information</h4>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <strong>Business Name:</strong> {formData.business_name}
              </div>
              <div>
                <strong>Business Type:</strong> {formData.business_type?.replace('_', ' ')}
              </div>
              <div>
                <strong>Location:</strong> {formData.location}
              </div>
              <div>
                <strong>Monthly Income:</strong> KSH {Number(formData.average_income).toLocaleString()}
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <strong>Description:</strong> {formData.business_description}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h4>Uploaded Documents</h4>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>National ID/Passport:</span>
                <span style={{ color: 'var(--success-green)' }}>
                  ✓ {uploadedDocuments.id_document?.name}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Business Permit:</span>
                <span style={{ color: uploadedDocuments.business_permit ? 'var(--success-green)' : 'var(--gray-400)' }}>
                  {uploadedDocuments.business_permit ? `✓ ${uploadedDocuments.business_permit.name}` : 'Not uploaded'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Passport Photo:</span>
                <span style={{ color: 'var(--success-green)' }}>
                  ✓ {uploadedDocuments.passport_photo?.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ 
          background: 'var(--gray-50)', 
          padding: '16px', 
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--gray-200)'
        }}>
          <h4 style={{ marginBottom: '12px', color: 'var(--gray-700)' }}>Important Notes:</h4>
          <ul style={{ paddingLeft: '20px', color: 'var(--gray-600)', fontSize: '14px' }}>
            <li>Your application will be reviewed by our admin team</li>
            <li>You will receive an email notification once approved</li>
            <li>The review process typically takes 1-2 business days</li>
            <li>Make sure all information provided is accurate</li>
          </ul>
        </div>
      </>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '600px' }}>
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            💰
          </div>
          <h1 className="auth-title">Join SokoCredit</h1>
          <p className="auth-subtitle">
            Register as a loan officer to help mama mbogas grow their businesses
          </p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Render Current Step */}
          {registrationStep === 1 && renderStep1()}
          {registrationStep === 2 && renderStep2()}
          {registrationStep === 3 && renderStep3()}
          {registrationStep === 4 && renderStep4()}

          {/* Navigation Buttons */}
          <div style={{ 
            display: 'flex', 
            justifyContent: registrationStep === 1 ? 'flex-end' : 'space-between',
            marginTop: '32px',
            gap: '16px'
          }}>
            {registrationStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <ArrowLeft size={16} />
                Previous
              </button>
            )}
            
            <button
              type="submit"
              disabled={isLoading || (registrationStep === 3 && (!uploadedDocuments.id_document || !uploadedDocuments.passport_photo))}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Submitting...
                </>
              ) : registrationStep === 4 ? (
                <>
                  <Check size={16} />
                  Submit Application
                </>
              ) : (
                <>
                  Next
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          {/* Login Link */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <span style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
              Already have an account?{' '}
            </span>
            <Link 
              to="/login" 
              className="forgot-password"
              onClick={() => dispatch(clearRegistrationData())}
            >
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register