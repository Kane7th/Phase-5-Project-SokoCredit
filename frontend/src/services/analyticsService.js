import api from './api'

export const analyticsService = {
  getOverview: async () => {
    return api.get('/analytics/overview')
  },
  getPerformance: async () => {
    return api.get('/analytics/performance')
  },
  getCustomerAnalytics: async () => {
    return api.get('/analytics/customers')
  },
  getRiskAnalysis: async () => {
    return api.get('/analytics/risk')
  },
  getLoanAnalytics: async () => {
    return api.get('/analytics/loans')
  },
  getLoanTypes: async () => {
    return api.get('/analytics/loans/types')
  },
  getLoanRepayment: async () => {
    return api.get('/analytics/loans/repayment')
  },
  getLoanOverview: async () => {
    return api.get('/analytics/loans/overview')
  },
  getLoanPortfolio: async () => {
    return api.get('/analytics/loans/portfolio')
  }
}
