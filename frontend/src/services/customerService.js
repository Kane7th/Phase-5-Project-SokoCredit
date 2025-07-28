import api from './api'

export const customerService = {
  // Customer CRUD
  listCustomers: async (params) => {
    const response = await api.get('/api/customers', { params })
    return response
  },

  createCustomer: async (customerData) => {
    const response = await api.post('/api/customers', customerData)
    return response
  },

  getCustomer: async (customerId) => {
    const response = await api.get(`/api/customers/${customerId}`)
    return response
  },

  updateCustomer: async (customerId, customerData) => {
    const response = await api.put(`/api/customers/${customerId}`, customerData)
    return response
  },

  deleteCustomer: async (customerId) => {
    const response = await api.delete(`/api/customers/${customerId}`)
    return response
  },

  // Customer loan history
  getCustomerLoans: async (customerId) => {
    const response = await api.get(`/api/customers/${customerId}/loans`)
    return response
  },

  // Customer payment history
  getCustomerPayments: async (customerId) => {
    const response = await api.get(`/api/customers/${customerId}/payments`)
    return response
  },

  // Customer communication history
  getCustomerCommunications: async (customerId) => {
    const response = await api.get(`/api/customers/${customerId}/communications`)
    return response
  },

  addCustomerCommunication: async (customerId, communicationData) => {
    const response = await api.post(`/api/customers/${customerId}/communications`, communicationData)
    return response
  },

  // Customer documents
  getCustomerDocuments: async (customerId) => {
    const response = await api.get(`/api/customers/${customerId}/documents`)
    return response
  },

  uploadCustomerDocument: async (customerId, documentData) => {
    const response = await api.post(`/api/customers/${customerId}/documents`, documentData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response
  },

  verifyCustomerDocument: async (customerId, docId) => {
    const response = await api.put(`/api/customers/${customerId}/documents/${docId}/verify`)
    return response
  },

  deleteCustomerDocument: async (customerId, docId) => {
    const response = await api.delete(`/api/customers/${customerId}/documents/${docId}`)
    return response
  },

  // Customer analytics
  getCustomerStats: async () => {
    const response = await api.get('/api/customers/stats')
    return response
  },

  getCustomerSegments: async () => {
    const response = await api.get('/api/customers/segments')
    return response
  },

  // Bulk operations
  bulkAction: async (actionData) => {
    const response = await api.post('/api/customers/bulk-action', actionData)
    return response
  },

  // Export customer data
  exportCustomers: async () => {
    const response = await api.get('/api/customers/export')
    return response
  },

  // New method to get dashboard data for logged-in customer
  getCustomerDashboardData: async () => {
    const response = await api.get('/api/customers/dashboard-data')
    return response
  },

  // New method to get customers for logged-in lender
  getMyCustomers: async () => {
    const response = await api.get('/api/customers/my_customers')
    return response
  }
}
