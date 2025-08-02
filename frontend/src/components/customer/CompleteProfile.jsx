import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import { customerService } from '../../services/customerService'
import { useDispatch } from 'react-redux'
import { getCurrentUser } from '../../store/authSlice'

const CompleteProfile = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth) || {}
  const user_id = user?.id || null
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    business_name: '',
    location: '',
    id_number: '',
    username: '',
    email: '',
    passport_photo: null,
    id_front: null,
    id_back: null,
    business_permit: null
  })

    useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user_id) {
        console.error('No user_id found in auth state')
        return
      }
      try {
        const userResponse = await authService.getCurrentUser()
        const user = userResponse || {}
        console.log("Fetched user data:", user)

        let customer = {}
        try {
          const customerResponse = await customerService.getCustomerByUser(user_id)
          if (customerResponse.status === 200) {
            customer = customerResponse.data || {}
            console.log("Fetched customer data:", customer)
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.warn('Customer profile not found for user_id:', user_id)
          } else {
            throw error
          }
        }

        setFormData(prev => {
          const newFormData = {
            ...prev,
            full_name: customer.full_name ?? `${user.first_name ?? ''} ${user.middle_name ?? ''} ${user.last_name ?? ''}`.trim(),
            phone: customer.phone ?? user.phone ?? '',
            business_name: customer.business_name ?? '',
            location: customer.location ?? '',
            id_number: customer.id_number ?? '',
            username: user.username ?? user.email ?? '',
            email: user.email ?? ''
          }
          console.log("Setting formData:", newFormData)
          return newFormData
        })
      } catch (err) {
        console.error('Failed to fetch user info:', err)
      }
    }

    fetchUserInfo()
  }, [user_id])

  const handleChange = (e) => {
    const { name, value, files, type } = e.target
    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files[0] || null
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic validation: check if at least one field is filled or file selected
    const hasData = formData.full_name.trim() !== '' ||
                    formData.phone.trim() !== '' ||
                    formData.location.trim() !== '' ||
                    formData.id_number.trim() !== '' ||
                    formData.passport_photo !== null ||
                    formData.id_front !== null ||
                    formData.id_back !== null ||
                    formData.business_permit !== null

    if (!hasData) {
      alert('Please fill at least one field or select a file before submitting.')
      return
    }

    try {
      const formPayload = new FormData()
      formPayload.append('full_name', formData.full_name)
      formPayload.append('phone', formData.phone)
      formPayload.append('business_name', formData.business_name)
      formPayload.append('location', formData.location)
      formPayload.append('id_number', formData.id_number)

      {/* Removed passport_photo from form submission as per request */}
      {/* if (formData.passport_photo) {
        formPayload.append('passport_photo', formData.passport_photo)
      } */}
      if (formData.id_front) {
        formPayload.append('id_front', formData.id_front)
      }
      if (formData.id_back) {
        formPayload.append('id_back', formData.id_back)
      }
      if (formData.business_permit) {
        formPayload.append('business_permit', formData.business_permit)
      }

      // Log FormData keys and values for debugging
      for (let pair of formPayload.entries()) {
        console.log(pair[0]+ ': ' + pair[1]);
      }

      await customerService.updateCustomerProfile(formPayload)
      alert('Profile updated successfully!')

      // Fetch updated customer profile and update formData
      const updatedCustomerResponse = await customerService.getCustomerByUser(user_id)
      if (updatedCustomerResponse.status === 200) {
        const updatedCustomer = updatedCustomerResponse.data || {}
        setFormData(prev => ({
          ...prev,
          full_name: updatedCustomer.full_name || `${user.first_name || ''} ${user.middle_name || ''} ${user.last_name || ''}`.trim(),
          phone: updatedCustomer.phone || user.phone || '',
          business_name: updatedCustomer.business_name || '',
          location: updatedCustomer.location || '',
          id_number: updatedCustomer.id_number || '',
          username: user.username || user.email || '',
          email: user.email || '',
          passport_photo: updatedCustomer.documents?.passport_photo || null,
          id_front: updatedCustomer.documents?.id_front || null,
          id_back: updatedCustomer.documents?.id_back || null,
          business_permit: updatedCustomer.documents?.business_permit || null
        }))
      }

      // Refresh Redux auth state with updated user data
      dispatch(getCurrentUser()).then(() => {
        // Delay navigation until after alert is dismissed and state updated
        setTimeout(() => {
          navigate('/dashboard')
        }, 100)
      })
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile. Please try again.')
    }
  }

  return (
    <div>
      <h2>Complete Your Profile</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>
          Full Name
          <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} />
        </label>
        <label>
          Username
          <input type="text" name="username" value={formData.username} readOnly />
        </label>
        <label>
          Email
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
        </label>
        <label>
          ID Number
          <input type="text" name="id_number" value={formData.id_number} onChange={handleChange} />
        </label>
        <label>
          Phone
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
        </label>
        <label>
          Business Name (required)
          <input
            type="text"
            name="business_name"
            value={formData.business_name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Location
          <input type="text" name="location" value={formData.location} onChange={handleChange} />
        </label>
        {/* Removed Passport Photo input as per request */}
        {/* <label>
          Passport Photo
          <input type="file" name="passport_photo" accept="image/*" onChange={handleChange} />
        </label> */}
        <label>
          ID Front
          <input type="file" name="id_front" accept="image/*" onChange={handleChange} />
        </label>
        <label>
          ID Back
          <input type="file" name="id_back" accept="image/*" onChange={handleChange} />
        </label>
        <label>
          Business Permit
          <input type="file" name="business_permit" accept="image/*" onChange={handleChange} />
        </label>
        <button type="submit">Complete</button>
      </form>
    </div>
  )
}

export default CompleteProfile
