import api from './api'

export const lenderService = {
  getDashboardData: async () => {
    const response = await api.get('/api/lender/dashboard-data')
    return response
  },

  getMyCustomers: async () => {
    const response = await api.get('/api/customers/my_customers')
    return response
  }
}
