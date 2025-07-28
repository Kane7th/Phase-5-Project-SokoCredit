import api from './api'

// Loan Applications
export const getLoanApplications = (params) => {
  return api.get('/loan-applications', { params })
}

export const submitLoanApplication = (data) => {
  return api.post('/loan-applications', data)
}

export const getLoanApplicationDetails = (id) => {
  return api.get(`/loan-applications/${id}`)
}

export const updateLoanApplication = (id, data) => {
  return api.put(`/loan-applications/${id}`, data)
}

export const approveLoanApplication = (id) => {
  return api.post(`/loan-applications/${id}/approve`)
}

export const rejectLoanApplication = (id) => {
  return api.post(`/loan-applications/${id}/reject`)
}

export const disburseLoan = (id) => {
  return api.post(`/loan-applications/${id}/disburse`)
}

// Active Loans
export const getActiveLoans = (params) => {
  return api.get('/loans', { params })
}

export const getLoanDetails = (id) => {
  return api.get(`/loans/${id}`)
}

export const updateLoan = (id, data) => {
  return api.put(`/loans/${id}`, data)
}

export const restructureLoan = (id, data) => {
  return api.post(`/loans/${id}/restructure`, data)
}

export const getPaymentSchedule = (id) => {
  return api.get(`/loans/${id}/payment-schedule`)
}

export const getPaymentHistory = (id) => {
  return api.get(`/loans/${id}/payments`)
}

// Credit Scoring
export const calculateCreditScore = (data) => {
  return api.post('/credit-score/calculate', data)
}

export const getCreditScore = (customerId) => {
  return api.get(`/credit-score/${customerId}`)
}

export const updateCreditScore = (customerId, data) => {
  return api.put(`/credit-score/${customerId}`, data)
}
