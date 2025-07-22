import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, User, Phone, Mail, Lock } from 'lucide-react'
import { loginUser, clearError } from '../../store/authSlice'
import LoadingSpinner from '../common/LoadingSpinner'
import '../../styles/auth.css'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [loginType, setLoginType] = useState('email') // 'email' or 'phone'
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading, isAuthenticated, error } = useSelector((state) => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm()

  const watchedIdentifier = watch('identifier')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  // Auto-detect if user is typing email or phone
  useEffect(() => {
    if (watchedIdentifier) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const phonePattern = /^[+]?[\d\s-()]+$/
      
      if (emailPattern.test(watchedIdentifier)) {
        setLoginType('email')
      } else if (phonePattern.test(watchedIdentifier)) {
        setLoginType('phone')
      }
    }
  }, [watchedIdentifier])

  const onSubmit = (data) => {
    const credentials = {
      identifier: data.identifier.trim(),
      password: data.password,
      login_type: loginType
    }
    
    dispatch(loginUser(credentials))
  }

  const demoAccounts = [
    { role: 'Admin', username: 'admin@sokocredit.com', password: 'admin123' },
    { role: 'Loan Officer', username: 'officer@sokocredit.com', password: 'officer123' },
    { role: 'Customer', username: 'customer@sokocredit.com', password: 'customer123' },
  ]

  const fillDemoAccount = (account) => {
    setValue('identifier', account.username)
    setValue('password', account.password)
    setLoginType('email')
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            💰
          </div>
          <h1 className="auth-title">Welcome to SokoCredit</h1>
          <p className="auth-subtitle">
            Microfinance loan management system
          </p>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Login Identifier */}
          <div className="form-group">
            <label className="form-label">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {loginType === 'email' ? <Mail size={16} /> : <Phone size={16} />}
                Email or Phone Number
              </div>
            </label>
            <input
              type="text"
              className={`form-input ${errors.identifier ? 'error' : ''}`}
              placeholder="Enter your email or phone number"
              {...register('identifier', {
                required: 'Email or phone number is required',
                minLength: {
                  value: 3,
                  message: 'Must be at least 3 characters',
                },
                validate: (value) => {
                  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                  const phonePattern = /^[+]?[0-9\s-()]{10,}$/
                  
                  if (!emailPattern.test(value) && !phonePattern.test(value)) {
                    return 'Please enter a valid email or phone number'
                  }
                  return true
                }
              })}
            />
            {errors.identifier && (
              <div className="text-error">{errors.identifier.message}</div>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={16} />
                Password
              </div>
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Enter your password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
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

          {/* Remember Me & Forgot Password */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0' }}>
            <div className="form-checkbox-wrapper">
              <input
                type="checkbox"
                id="remember"
                className="form-checkbox"
                {...register('remember')}
              />
              <label htmlFor="remember" style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
                Remember me
              </label>
            </div>
            <a href="#" className="forgot-password">
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span style={{ marginLeft: '8px' }}>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Demo Accounts */}
          <div className="demo-accounts">
            <div className="demo-title">Demo Accounts:</div>
            {demoAccounts.map((account, index) => (
              <div key={index} className="demo-account">
                <button
                  type="button"
                  onClick={() => fillDemoAccount(account)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-blue)',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {account.role}: {account.username}
                </button>
              </div>
            ))}
          </div>

          {/* Register Link */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <span style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
              Don't have an account?{' '}
            </span>
            <Link to="/register" className="forgot-password">
              Register as Lender
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login