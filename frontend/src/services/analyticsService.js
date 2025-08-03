import api from './api'

export const analyticsService = {
  getOverview: async () => {
    return api.get('/api/analytics/overview')
  },
  getPerformance: async () => {
    return api.get('/api/analytics/performance')
  },
  getCustomerAnalytics: async () => {
    return api.get('/api/analytics/customers')
  },
  getRiskAnalysis: async () => {
    return api.get('/api/analytics/risk')
  },
  getLoanAnalytics: async () => {
    return api.get('/api/analytics/loans')
  },
  getLoanTypes: async () => {
    return api.get('/api/analytics/loans/types')
  },
  getLoanRepayment: async () => {
    return api.get('/api/analytics/loans/repayment')
  },
  getLoanOverview: async () => {
    return api.get('/api/analytics/loans/overview')
  },
  getLoanPortfolio: async () => {
    return api.get('/api/analytics/loans/portfolio')
  }
}
