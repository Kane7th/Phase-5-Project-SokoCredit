import api from './api'

export const authService = {
  // Login with email/phone and password
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response
  },

  // Multi-step registration
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response
  },

  // Upload documents during registration
  uploadDocument: async (file, documentType) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('document_type', documentType)

    const response = await api.post('/auth/upload-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', {
      refresh_token: refreshToken
    })
    return response
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response
  },

  // Check email/phone availability
  checkAvailability: async (field, value) => {
    const response = await api.post('/auth/check-availability', {
      field,
      value
    })
    return response
  }
}