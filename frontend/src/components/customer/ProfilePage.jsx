import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { userService } from '../../services/userService'
import CustomerProfile from './CustomerProfile'

const ProfilePage = () => {
  const dispatch = useDispatch()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await userService.getProfile()
        setProfile(response.data)
      } catch (err) {
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [dispatch])

  if (loading) {
    return <div>Loading profile...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!profile) {
    return <div>No profile data available.</div>
  }

  return (
    <div>
      <CustomerProfile customer={profile} />
    </div>
  )
}

export default ProfilePage
