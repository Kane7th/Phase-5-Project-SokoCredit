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
  // Removed uploadedDocuments state and handleDocumentUpload as document upload is removed

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
    // Prepare data object excluding confirm_password and uploaded documents
    const submitData = {}
    Object.keys(data).forEach(key => {
      if (key !== 'confirm_password') {
        submitData[key] = data[key]
      }
    })

    // Set role as customer
    submitData.role = 'customer'

    dispatch(registerUser(submitData))
  }

  // Removed handleDocumentUpload function as document upload is removed

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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} />
                  Username *
                </div>
              </label>
              <input
                type="text"
                className={`form-input ${errors.username ? 'error' : ''}`}
                placeholder="Choose a username"
                {...register('username', {
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Username must be at least 3 characters' }
                })}
              />
              {errors.username && (
                <div className="text-error">{errors.username.message}</div>
              )}
            </div>
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
          {/* Removed business information fields as per user request */}

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
          {/* Removed document upload fields as per user request */}

          <button
            type="submit"
            disabled={isLoading}
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