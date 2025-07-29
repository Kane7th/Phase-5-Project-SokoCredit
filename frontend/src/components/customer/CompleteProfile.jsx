import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { customerService } from '../../services/customerService'

const CompleteProfile = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    business_name: '',
    location: ''
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      // Create customer profile for logged-in user
      await customerService.createCustomer(formData)
      // Redirect to customer dashboard after successful profile creation
      navigate('/dashboard/customer')
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to complete profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="complete-profile-container">
      <h2>Complete Your Profile</h2>
      <form onSubmit={handleSubmit} className="complete-profile-form">
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Business Name</label>
          <input
            type="text"
            name="business_name"
            value={formData.business_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Complete Profile'}
        </button>
      </form>
    </div>
  )
}

export default CompleteProfile
