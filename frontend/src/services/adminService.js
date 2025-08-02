import api from './api'

export const adminService = {
  getDashboardStats: async () => {
    const response = await api.get('/api/admin/dashboard-stats')
    return response
  },

  listPendingLenders: async () => {
    const response = await api.get('/api/admin/pending-lenders')
    return response
  },

  listLenders: async () => {
    const response = await api.get('/api/admin/lenders')
    return response
  },

  addLender: async (lenderData) => {
    const response = await api.post('/api/admin/lenders', lenderData)
    return response
  },

  approveLender: async (lenderId) => {
    const response = await api.post(`/api/admin/lenders/${lenderId}/approve`)
    return response
  },

  rejectLender: async (lenderId) => {
    const response = await api.post(`/api/admin/lenders/${lenderId}/reject`)
    return response
  },

  getLoanProducts: async () => {
    const response = await api.get('/api/loan-products')
    return response
  }
}
