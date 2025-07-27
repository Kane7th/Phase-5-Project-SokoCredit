import React, { useEffect, useState } from 'react'
import './AnalyticsDashboard.css'

const AnalyticsDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [analyticsData, setAnalyticsData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const token = localStorage.getItem('token') // Ensure user is logged in

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)
      try {
        const [overviewRes, performanceRes, customersRes, riskRes, loanTypesRes] = await Promise.all([
          fetch('http://localhost:5000/analytics/overview', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('http://localhost:5000/analytics/performance', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('http://localhost:5000/analytics/customers', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('http://localhost:5000/analytics/risk', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('http://localhost:5000/analytics/loans/types', {
            headers: { Authorization: `Bearer ${token}` }
          }),
        ])

        const [overview, performance, customers, risk, loanTypes] = await Promise.all([
          overviewRes.json(),
          performanceRes.json(),
          customersRes.json(),
          riskRes.json(),
          loanTypesRes.json()
        ])

        setAnalyticsData({
          overview,
          performance: { ...performance, loanTypes: loanTypes.types },
          customers,
          risk
        })
      } catch (err) {
        console.error('Error fetching analytics:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  const renderTabContent = () => {
    if (isLoading) {
      return <p>Loading analytics...</p>
    }

    if (!analyticsData) {
      return <p>No analytics data available.</p>
    }

    switch (selectedTab) {
      case 'overview':
        return (
          <div className="analytics-grid">
            {Object.entries(analyticsData.overview).map(([key, value]) => (
              <div className="analytics-card" key={key}>
                <h3>{key}</h3>
                <p>{value}</p>
              </div>
            ))}
          </div>
        )

      case 'performance':
        return (
          <div className="analytics-grid">
            {Object.entries(analyticsData.performance).map(([key, value]) => (
              <div className="analytics-card" key={key}>
                <h3>{key}</h3>
                <pre>{JSON.stringify(value, null, 2)}</pre>
              </div>
            ))}
          </div>
        )

      case 'customers':
        return (
          <div className="analytics-grid">
            {Object.entries(analyticsData.customers).map(([key, value]) => (
              <div className="analytics-card" key={key}>
                <h3>{key}</h3>
                <pre>{JSON.stringify(value, null, 2)}</pre>
              </div>
            ))}
          </div>
        )

      case 'risk':
        return (
          <div className="analytics-grid">
            {Object.entries(analyticsData.risk).map(([key, value]) => (
              <div className="analytics-card" key={key}>
                <h3>{key}</h3>
                <pre>{JSON.stringify(value, null, 2)}</pre>
              </div>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="dashboard-container">
      <h1>Analytics Dashboard</h1>

      <div className="tab-buttons">
        <button onClick={() => setSelectedTab('overview')} className={selectedTab === 'overview' ? 'active' : ''}>
          Overview
        </button>
        <button onClick={() => setSelectedTab('performance')} className={selectedTab === 'performance' ? 'active' : ''}>
          Performance
        </button>
        <button onClick={() => setSelectedTab('customers')} className={selectedTab === 'customers' ? 'active' : ''}>
          Customers
        </button>
        <button onClick={() => setSelectedTab('risk')} className={selectedTab === 'risk' ? 'active' : ''}>
          Risk
        </button>
      </div>

      <div className="tab-content">{renderTabContent()}</div>
    </div>
  )
}

export default AnalyticsDashboard