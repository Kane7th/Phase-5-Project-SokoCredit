import api from './api'

export const authService = {
  // Login with email/phone and password
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials)
    return response
  },

  // Multi-step registration
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData)
    return response
  },

  // Upload documents during registration
  uploadDocument: async (file, documentType) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('document_type', documentType)

    const response = await api.post('/api/auth/upload-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me')
    return response
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/api/auth/refresh', {
      refresh_token: refreshToken
    })
    return response
  },

  // Logout
  logout: async () => {
    const response = await api.post('/api/auth/logout')
    return response
  },

  // Check email/phone availability
  checkAvailability: async (field, value) => {
    const response = await api.post('/api/auth/check-availability', {
      field,
      value
    })
    return response
  },

  // Forgot password
  forgotPassword: async (emailOrPhone) => {
    const response = await api.post('/api/auth/forgot-password', { email: emailOrPhone, phone: emailOrPhone })
    return response
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/api/auth/reset-password', { token, new_password: newPassword })
    return response
  },

  // Verify phone
  verifyPhone: async (phone, otp) => {
    const response = await api.post('/api/auth/verify-phone', { phone, otp })
    return response
  },

  // Verify email
  verifyEmail: async (email, otp) => {
    const response = await api.post('/api/auth/verify-email', { email, otp })
    return response
  }
}
