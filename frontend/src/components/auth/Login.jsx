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

  const watchedCredential = watch('credential')

  useEffect(() => {
    return () => dispatch(clearError())
  }, [dispatch])

  useEffect(() => {
    if (watchedCredential) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const phonePattern = /^[+]?[\d\s-()]+$/
      if (emailPattern.test(watchedCredential)) {
        setLoginType('email')
      } else if (phonePattern.test(watchedCredential)) {
        setLoginType('phone')
      }
    }
  }, [watchedCredential])

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
            userId = parseInt(id.replace('user_', ''))
            role = r
          } else {
            userId = parseInt(identity)
            role = 'user'
          }
        } else if (typeof identity === 'number') {
          userId = identity
          role = 'admin'
        }

        if (!role) throw new Error('Invalid role in token')

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
        console.error('Token decode failed:', err)
        navigate('/login')
      }
    }
  }, [isAuthenticated, token, navigate, dispatch])

  const onSubmit = (data) => {
    const credentials = {
      credential: data.credential.trim(),
      password: data.password
    }
    dispatch(loginUser(credentials))
  }

  const demoAccounts = [
    { role: 'Admin', username: 'admin@sokocredit.com', password: 'password' },
    { role: 'Loan Officer', username: 'lender1@sokocredit.com', password: 'password' },
    { role: 'Customer', username: 'mama1@sokocredit.com', password: 'password' }
  ]

  const fillDemoAccount = (account) => {
    setValue('credential', account.username)
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
              <div className="flex items-center gap-2">
                {loginType === 'email' ? <Mail size={16} /> : <Phone size={16} />}
                Email or Phone Number
              </div>
            </label>
            <input
              type="text"
              className={`form-input ${errors.credential ? 'error' : ''}`}
              placeholder="Enter your email or phone number"
              {...register('credential', {
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
            {errors.credential && <div className="text-error">{errors.credential.message}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              <div className="flex items-center gap-2">
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

          <div className="flex justify-between items-center my-4">
            <div className="form-checkbox-wrapper">
              <input type="checkbox" id="remember" className="form-checkbox" {...register('remember')} />
              <label htmlFor="remember" className="text-sm text-gray-600">
                Remember me
              </label>
            </div>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Signing in...</span>
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="demo-accounts mt-4">
            <div className="demo-title">Demo Accounts:</div>
            {demoAccounts.map((account, index) => (
              <div key={index} className="demo-account">
                <button
                  type="button"
                  onClick={() => fillDemoAccount(account)}
                  className="text-xs text-blue-600 underline cursor-pointer"
                >
                  {account.role}: {account.username}
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-6 text-sm text-gray-500">
            Don’t have an account?{' '}
            <Link to="/register" className="forgot-password">Register as Lender</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
