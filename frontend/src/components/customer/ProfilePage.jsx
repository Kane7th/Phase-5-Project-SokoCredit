import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axios from 'axios'
import * as jwt_decode from 'jwt-decode'
import CustomerProfile from './CustomerProfile'

const ProfilePage = () => {
  const { token } = useSelector(state => state.auth)
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Decode user_id from JWT token
  let user_id = null
  if (token) {
    try {
      const decoded = jwt_decode(token)
      // Assuming identity is in sub or identity claim, adjust as needed
      const identity = decoded.sub || decoded.identity || ''
      user_id = identity.split(':')[0] || null
    } catch (e) {
      console.error('Error decoding token', e)
    }
  }

  useEffect(() => {
    console.log("ProfilePage: user_id =", user_id, "token =", token)
    const fetchCustomer = async () => {
      try {
        if (!user_id) throw new Error('User ID not found in token')
        const response = await axios.get(`http://localhost:5000/customers/${user_id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        console.log("ProfilePage: fetched customer data", response.data)
        setCustomer(response.data)
      } catch (err) {
        console.error("ProfilePage: error fetching customer data", err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    if (user_id && token) {
      fetchCustomer()
    }
  }, [user_id, token])

  if (loading) return <div>Loading customer profile...</div>
  if (error) return <div>Error loading customer profile: {error.message}</div>

  return <CustomerProfile customer={customer} />
}

export default ProfilePage
