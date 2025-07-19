import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { 
  User, Mail, Phone, Lock, Building, MapPin, 
  Eye, EyeOff, ShoppingBag, Banknote
} from 'lucide-react'
import { registerUser } from '../../store/authSlice'
import LoadingSpinner from '../common/LoadingSpinner'
import FileUpload from '../common/FileUpload'

const CustomerRegister = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [uploadedDocuments, setUploadedDocuments] = useState({
    id_document: null,
    business_permit: null
  })

  const dispatch = useDispatch()
  const { isLoading, error } = useSelector((state) => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm()

  const watchedPassword = watch('password')

  const onSubmit = async (data) => {
    const formData = new FormData()
    
    // Add all form data
    Object.keys(data).forEach(key => {
      if (key !== 'confirm_password') {
        formData.append(key, data[key])
      }
    })

    // Set role as customer
    formData.append('role', 'customer')

    // Add uploaded documents
    Object.keys(uploadedDocuments).forEach(docType => {
      if (uploadedDocuments[docType]) {
        formData.append(docType, uploadedDocuments[docType].file)
      }
    })

    dispatch(registerUser(formData))
  }

  const handleDocumentUpload = (docType, file) => {
    setUploadedDocuments(prev => ({
      ...prev,
      [docType]: file ? { file, name: file.name } : null
    }))
  }

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <div className="auth-logo">🛒</div>
          <h1 className="auth-title">Join SokoCredit</h1>
          <p className="auth-subtitle">
            Register your business and access microfinance services
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="error-message">{error}</div>
          )}

          {/* Personal Information */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} />
                  First Name *
                </div>
              </label>
              <input
                type="text"
                className={`form-input ${errors.first_name ? 'error' : ''}`}
                placeholder="Enter your first name"
                {...register('first_name', {
                  required: 'First name is required',
                  minLength: { value: 2, message: 'First name must be at least 2 characters' }
                })}
              />
              {errors.first_name && (
                <div className="text-error">{errors.first_name.message}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} />
                  Middle Name
                </div>
              </label>
              <input
                type="text"
                className={`form-input ${errors.middle_name ? 'error' : ''}`}
                placeholder="Enter your middle name"
                {...register('middle_name')}
              />
              {errors.middle_name && (
                <div className="text-error">{errors.middle_name.message}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} />
                  Last Name *
                </div>
              </label>
              <input
                type="text"
                className={`form-input ${errors.last_name ? 'error' : ''}`}
                placeholder="Enter your last name"
                {...register('last_name', {
                  required: 'Last name is required',
                  minLength: { value: 2, message: 'Last name must be at least 2 characters' }
                })}
              />
              {errors.last_name && (
                <div className="text-error">{errors.last_name.message}</div>
              )}
            </div>
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
            <label className="form-label">National ID Number *</label>
            <input
              type="text"
              className={`form-input ${errors.id_number ? 'error' : ''}`}
              placeholder="12345678"
              {...register('id_number', {
                required: 'National ID is required',
                pattern: {
                  value: /^[0-9]{8}$/,
                  message: 'Please enter a valid 8-digit National ID'
                }
              })}
            />
            {errors.id_number && (
              <div className="text-error">{errors.id_number.message}</div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select
                className={`form-select ${errors.gender ? 'error' : ''}`}
                {...register('gender', { required: 'Gender is required' })}
              >
                <option value="">Select gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
              {errors.gender && (
                <div className="text-error">{errors.gender.message}</div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input
                type="date"
                className={`form-input ${errors.date_of_birth ? 'error' : ''}`}
                {...register('date_of_birth', {
                  required: 'Date of birth is required'
                })}
              />
              {errors.date_of_birth && (
                <div className="text-error">{errors.date_of_birth.message}</div>
              )}
            </div>
          </div>

          {/* Business Information */}
          <div style={{ margin: '32px 0 16px', paddingTop: '24px', borderTop: '1px solid var(--gray-200)' }}>
            <h3 style={{ color: 'var(--gray-700)', marginBottom: '16px' }}>Business Information</h3>
          </div>

          <div className="form-group">
            <label className="form-label">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={16} />
                Business Name *
              </div>
            </label>
            <input
              type="text"
              className={`form-input ${errors.business_name ? 'error' : ''}`}
              placeholder="e.g., Mary's Vegetable Stand"
              {...register('business_name', {
                required: 'Business name is required'
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
              <option value="mama_mboga">Mama Mboga (Vegetables/Fruits)</option>
              <option value="general_store">General Store</option>
              <option value="restaurant">Restaurant/Food</option>
              <option value="salon">Beauty Salon/Barbershop</option>
              <option value="tailoring">Tailoring/Fashion</option>
              <option value="electronics">Electronics</option>
              <option value="transport">Transport</option>
              <option value="agriculture">Agriculture</option>
              <option value="other">Other</option>
            </select>
            {errors.business_type && (
              <div className="text-error">{errors.business_type.message}</div>
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
            <label className="form-label">Business Description</label>
            <textarea
              className="form-input form-textarea"
              placeholder="Describe what you sell and your business activities..."
              rows={3}
              {...register('business_description')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Banknote size={16} />
                Average Monthly Income (KSH) *
              </div>
            </label>
            <input
              type="number"
              className={`form-input ${errors.average_income ? 'error' : ''}`}
              placeholder="20000"
              min="0"
              step="1000"
              {...register('average_income', {
                required: 'Average income is required',
                min: { value: 1000, message: 'Income must be at least KSH 1,000' }
              })}
            />
            {errors.average_income && (
              <div className="text-error">{errors.average_income.message}</div>
            )}
          </div>

          {/* Password Section */}
          <div style={{ margin: '32px 0 16px', paddingTop: '24px', borderTop: '1px solid var(--gray-200)' }}>
            <h3 style={{ color: 'var(--gray-700)', marginBottom: '16px' }}>Account Security</h3>
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
                  minLength: { value: 8, message: 'Password must be at least 8 characters' }
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
            <label className="form-label">Confirm Password *</label>
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

          {/* Document Upload */}
          <div style={{ margin: '32px 0 16px', paddingTop: '24px', borderTop: '1px solid var(--gray-200)' }}>
            <h3 style={{ color: 'var(--gray-700)', marginBottom: '16px' }}>Documents (Optional)</h3>
          </div>

          <FileUpload
            label="National ID Photo"
            acceptedTypes=".jpg,.jpeg,.png,.pdf"
            maxSize={5}
            onFileSelect={(file) => handleDocumentUpload('id_document', file)}
            existingFile={uploadedDocuments.id_document}
          />

          <FileUpload
            label="Business Permit"
            acceptedTypes=".pdf,.jpg,.jpeg,.png"
            maxSize={5}
            onFileSelect={(file) => handleDocumentUpload('business_permit', file)}
            existingFile={uploadedDocuments.business_permit}
          />

          <button
            type="submit"
            disabled={isLoading || !uploadedDocuments.id_document || !uploadedDocuments.business_permit}
            className="btn btn-primary w-full"
            style={{ marginTop: '24px' }}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span style={{ marginLeft: '8px' }}>Creating Account...</span>
              </>
            ) : (
              'Create My Account'
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <span style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
              Already have an account?{' '}
            </span>
            <Link to="/login" className="forgot-password">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CustomerRegister
