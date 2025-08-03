import React, { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'

const AddLenderForm = ({ onClose, onLenderAdded }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    business_name: '',
    email: '',
    phone: '',
    location: '',
    organisation: '',
    loan_product: '',
    one_time_password: '',
    documents_complete: false
  })

  const [loanProducts, setLoanProducts] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingLoanProducts, setLoadingLoanProducts] = useState(true)

    useEffect(() => {
    const fetchLoanProducts = async () => {
      try {
        const response = await adminService.getLoanProducts()
        if (Array.isArray(response)) {
          setLoanProducts(response)
          if (response.length > 0) {
            setFormData(prev => ({ ...prev, loan_product: response[0].name }))
          }
        } else {
          setLoanProducts([])
          setError('Failed to load loan products')
        }
      } catch {
        setError('Failed to load loan products')
      } finally {
        setLoadingLoanProducts(false)
      }
    }
    fetchLoanProducts()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await adminService.addLender(formData)
      onLenderAdded()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add lender')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-lender-form">
      <h3>Add New Lender</h3>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
        </div>
        {/* Removed Business Name field as per user request */}
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
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
          />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Organisation</label>
          <input
            type="text"
            name="organisation"
            value={formData.organisation}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Loan Product</label>
          {loadingLoanProducts ? (
            <p>Loading loan products...</p>
          ) : (
            <select
              name="loan_product"
              value={formData.loan_product}
              onChange={handleChange}
            >
              {loanProducts.map(product => (
                <option key={product.id} value={product.name}>
                  {product.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="form-group">
          <label>One-time Password *</label>
          <input
            type="password"
            name="one_time_password"
            value={formData.one_time_password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="documents_complete"
              checked={formData.documents_complete}
              onChange={handleChange}
            />
            Documents Complete
          </label>
        </div>
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Lender'}
          </button>
          <button type="button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddLenderForm
