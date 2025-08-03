import React, { useEffect, useState } from 'react'
import PortfolioChart from '../analytics/PortofolioChart'
import '../../styles/dashboard.css'

const LoanPortfolio = () => {
  const [portfolioData, setPortfolioData] = React.useState([])

  React.useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        // Placeholder: Replace with real API call to fetch loan portfolio data
        // For now, using static sample data
        const sampleData = [
          { month: 'Jan', amount: 5000000 },
          { month: 'Feb', amount: 7000000 },
          { month: 'Mar', amount: 6000000 },
          { month: 'Apr', amount: 8000000 },
          { month: 'May', amount: 7500000 },
          { month: 'Jun', amount: 9000000 },
        ]
        setPortfolioData(sampleData)
      } catch (error) {
        console.error('Failed to fetch portfolio data:', error)
      }
    }

    fetchPortfolioData()
  }, [])

  return (
    <div className="loan-portfolio">
      <h2>Loan Portfolio Overview</h2>
      <PortfolioChart data={portfolioData} />
    </div>
  )
}

export default LoanPortfolio
