import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DollarSign, Calendar, ArrowLeft } from 'lucide-react'
import api from '../../services/api'

const LoanDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loan, setLoan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLoan = async () => {
      try {
        const response = await api.get(`/loans/${id}`)
        console.log('LoanDetails fetch response:', response)
        setLoan(response.data)
      } catch (err) {
        console.error('LoanDetails fetch error:', err)
        setError('Failed to fetch loan details.')
      } finally {
        setLoading(false)
      }
    }
    fetchLoan()
  }, [id])

  if (loading) return <div>Loading loan details...</div>
  if (error) return <div>{error}</div>
  if (!loan || !loan.id) return <div>No loan found.</div>

  return (
    <div className="loan-details-container">
      <button className="btn btn-secondary" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} /> Back
      </button>
      <h2>Loan Details - ID: {loan.id}</h2>
      <div>
        <p><strong>Amount:</strong> KSH {loan.amount.toLocaleString()}</p>
        <p><strong>Status:</strong> {loan.status}</p>
        <p><strong>Balance:</strong> KSH {loan.balance ? loan.balance.toLocaleString() : 'N/A'}</p>
        <p><strong>Lender Comments:</strong> {loan.lenderComments || 'No comments yet'}</p>
        <p><strong>Customer ID:</strong> {loan.customer_id}</p>
        <p><strong>Lender ID:</strong> {loan.lender_id}</p>
      </div>
    </div>
  )
}

export default LoanDetails
