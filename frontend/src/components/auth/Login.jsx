import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Phone, Mail, Lock } from 'lucide-react'
import { jwtDecode } from 'jwt-decode'
import { loginUser, clearError, setUserInfo } from '../../store/authSlice'
import LoadingSpinner from '../common/LoadingSpinner'
import '../../styles/auth.css'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [loginType, setLoginType] = useState('email')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading, isAuthenticated, error, token } = useSelector((state) => state.auth)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm()

  const watchedIdentifier = watch('identifier')

  useEffect(() => {
    if (isAuthenticated && token) {
      try {
        const decoded = jwtDecode(token)
        const identity = decoded.sub || decoded.identity
        let userId, role

        if (typeof identity === 'string') {
          if (identity.startsWith('customer_')) {
            userId = parseInt(identity.replace('customer_', ''))
            role = 'customer'
          } else if (identity.startsWith('mama_mboga_')) {
            userId = parseInt(identity.replace('mama_mboga_', ''))
            role = 'mama_mboga'
          } else if (identity.includes(':')) {
            const [id, r] = identity.split(':')
            userId = parseInt(id)
            role = r
          } else {
            userId = parseInt(identity)
            role = 'user'
          }
        } else if (typeof identity === 'number') {
          userId = identity
          role = 'admin'
        }

        localStorage.setItem('user_id', userId)
        localStorage.setItem('user_role', role)
        dispatch(setUserInfo({ user_id: userId, role }))

        switch (role) {
          case 'admin':
            navigate('/dashboard/admin')
            break
          case 'lender':
            navigate('/dashboard/lender')
            break
          case 'customer':
          case 'mama_mboga':
            navigate('/dashboard/customer')
            break
          default:
            navigate('/dashboard')
        }
      } catch (err) {
        console.error('Invalid token:', err)
      }
    }
  }, [isAuthenticated, token, navigate, dispatch])

  useEffect(() => {
    return () => dispatch(clearError())
  }, [dispatch])

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
        <div className="auth-header">
          <div className="auth-logo">💰</div>
          <h1 className="auth-title">Welcome to SokoCredit</h1>
          <p className="auth-subtitle">Microfinance loan management system</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          {error && <div className="error-message">{error}</div>}

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
            {errors.identifier && <div className="text-error">{errors.identifier.message}</div>}
          </div>

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
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
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
            {errors.password && <div className="text-error">{errors.password.message}</div>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0' }}>
            <div className="form-checkbox-wrapper">
              <input type="checkbox" id="remember" className="form-checkbox" {...register('remember')} />
              <label htmlFor="remember" style={{ fontSize: '14px', color: 'var(--gray-600)' }}>
                Remember me
              </label>
            </div>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span style={{ marginLeft: '8px' }}>Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>

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

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <span style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
              Don't have an account?{' '}
            </span>
            <Link to="/register" className="forgot-password">Register as Lender</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
