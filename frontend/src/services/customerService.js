import api from './api'

export const customerService = {
  // Customer CRUD
  // Removed listCustomers method to prevent customers from viewing all customers

  getCustomerByUser: async (userId) => {
    const response = await api.get('/api/customers/dashboard-data')
    console.log('customerService.getCustomerByUser response:', response)
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

  // Removed deleteCustomer method to prevent customers from deleting customers

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

  // New method to get loans for logged-in user
  getLoans: async () => {
    const response = await api.get('/api/loans')
    return response
  },

  // New method to get payments for logged-in user
  getPayments: async () => {
    const response = await api.get('/api/loans/repayments')
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
    const response = await api.get('/api/analytics')
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
  },

  getLenderCustomers: async (lenderId) => {
    const response = await api.get(`/api/customers/my_customers?lender_id=${lenderId}`)
    return response
  },

  // New method to apply for a loan
  applyForLoan: async (loanData) => {
    const response = await api.post('/loans', loanData)
    return response
  },

  // New method to update customer profile with multipart/form-data
  updateCustomerProfile: async (formData) => {
    const response = await api.put('/api/customers/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response
  }
}
