import api from './api'

export const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/me')
    return response
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/api/users/profile', profileData)
    return response
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/api/users/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    })
    return response
  }
}
