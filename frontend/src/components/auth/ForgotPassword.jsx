import React, { useState } from 'react'
import { authService } from '../../services/authService'
import toast from 'react-hot-toast'

const ForgotPassword = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authService.forgotPassword(emailOrPhone)
      toast.success('Password reset instructions sent to your email or phone')
      setEmailOrPhone('')
    } catch (error) {
      toast.error(error.message || 'Failed to send reset instructions')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-password-container" style={{ textAlign: 'center' }}>
      <form onSubmit={handleSubmit} style={{ display: 'inline-block', textAlign: 'left', minWidth: '320px' }}>
        <h2 style={{ marginBottom: '1rem' }}>Forgot Password</h2>
        <div className="form-group">
          <label>Email or Phone Number</label>
          <input
            type="text"
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            required
            placeholder="Enter your email or phone number"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Instructions'}
        </button>
      </form>
    </div>
  )
}

export default ForgotPassword
