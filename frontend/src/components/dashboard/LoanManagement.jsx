import React, { useState, useEffect } from 'react'
import { getLenderLoans, getLoanComments, addLoanComment, updateLoanStatus } from '../../services/loanService'
import '../../styles/loan-management.css'

const LoanManagement = ({ lenderId }) => {
  const [loans, setLoans] = useState([])
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [statusUpdate, setStatusUpdate] = useState('')

  useEffect(() => {
    fetchLoans()
  }, [lenderId])

  const fetchLoans = async () => {
    try {
      const data = await getLenderLoans(lenderId)
      setLoans(data)
    } catch (error) {
      console.error('Failed to fetch loans:', error)
    }
  }

  const fetchComments = async (loanId) => {
    try {
      const data = await getLoanComments(loanId)
      setComments(data)
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    }
  }

  const handleLoanSelect = (loan) => {
    setSelectedLoan(loan)
    fetchComments(loan.id)
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    try {
      await addLoanComment(selectedLoan.id, newComment)
      setNewComment('')
      fetchComments(selectedLoan.id)
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const handleStatusUpdate = async () => {
    if (!statusUpdate) return
    try {
      await updateLoanStatus(selectedLoan.id, statusUpdate)
      fetchLoans()
      setSelectedLoan(null)
      setComments([])
      setStatusUpdate('')
    } catch (error) {
      console.error('Failed to update loan status:', error)
    }
  }

  return (
    <div className="loan-management">
      <h2>Loan Management</h2>
      <div className="loan-list">
        <h3>Loans</h3>
        {loans.length === 0 ? (
          <p>No loans found.</p>
        ) : (
          <ul>
            {loans.map((loan) => (
              <li
                key={loan.id}
                onClick={() => handleLoanSelect(loan)}
                className={selectedLoan?.id === loan.id ? 'selected' : ''}
              >
                Loan #{loan.id} - Amount: KSH {loan.amount.toLocaleString()} - Status: {loan.status}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedLoan && (
        <div className="loan-details">
          <h3>Loan Details</h3>
          <p>Amount: KSH {selectedLoan.amount.toLocaleString()}</p>
          <p>Status: {selectedLoan.status}</p>
          <p>Customer ID: {selectedLoan.customer_id}</p>

          <div className="comments-section">
            <h4>Comments</h4>
            {comments.length === 0 ? (
              <p>No comments yet.</p>
            ) : (
              <ul>
                {comments.map((comment) => (
                  <li key={comment.id}>
                    <strong>Lender #{comment.lender_id}:</strong> {comment.comment_text}{' '}
                    <em>({new Date(comment.created_at).toLocaleString()})</em>
                  </li>
                ))}
              </ul>
            )}
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment"
            />
            <button onClick={handleAddComment}>Add Comment</button>
          </div>

          <div className="status-update">
            <h4>Update Loan Status</h4>
            <select value={statusUpdate} onChange={(e) => setStatusUpdate(e.target.value)}>
              <option value="">Select status</option>
              <option value="approved">Approve</option>
              <option value="rejected">Reject</option>
              <option value="disbursed">Disburse</option>
            </select>
            <button onClick={handleStatusUpdate}>Update Status</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoanManagement
