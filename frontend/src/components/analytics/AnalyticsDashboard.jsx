import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  AlertTriangle,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Target,
  Percent,
  Clock
} from 'lucide-react'
import PortofolioChart from './PortofolioChart'
import CollectionChart from './CollectionChart'
import RiskAnalysis from './RiskAnalysis'
import CustomerSegmntation from './CustomerSegmntation'
import '../../styles/analytics.css'

const AnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [activeView, setActiveView] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [analyticsData, setAnalyticsData] = useState(null)
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState(null)

  const periodOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ]

  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const overview = await api.get('/api/analytics/overview')
      const performance = await api.get('/api/analytics/performance')
      const customers = await api.get('/api/analytics/customers')
      const risk = await api.get('/api/analytics/risk')

      setAnalyticsData({
        overview,
        performance,
        customers,
        risk
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const refreshData = () => {
    fetchAnalyticsData()
  }

  const MetricCard = ({ title, value, change, icon: Icon, color, subtitle, format = 'number' }) => {
    const formatValue = (val) => {
      switch (format) {
        case 'currency':
          return `KSH ${(val / 1000000).toFixed(1)}M`
        case 'percentage':
          return `${val}%`
        case 'number':
        default:
          return val.toLocaleString()
      }
    }

    return (
      <div className="metric-card">
        <div className="metric-header">
          <div className="metric-icon" style={{ backgroundColor: `${color}20`, color }}>
            {Icon && <Icon size={24} />}
          </div>
          {change !== undefined && (
            <span className={`metric-change ${change >= 0 ? 'positive' : 'negative'}`}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
          )}
        </div>
        <div className="metric-content">
          <div className="metric-value">{formatValue(value)}</div>
          <div className="metric-title">{title}</div>
          {subtitle && <div className="metric-subtitle">{subtitle}</div>}
        </div>
      </div>
    )
  }

  const OverviewMetrics = () => {
    if (!analyticsData) return null
    const { overview } = analyticsData
    return (
      <div className="metrics-grid">
        <MetricCard
          title="Total Portfolio"
          value={overview.totalDisbursed}
          change={null}
          icon={DollarSign}
          color="#1E40AF"
          format="currency"
        />
        <MetricCard
          title="Active Loans"
          value={overview.activeLoans}
          icon={BarChart3}
          color="#059669"
          subtitle="Currently disbursed"
        />
        <MetricCard
          title="Total Customers"
          value={overview.newCustomersThisMonth}
          icon={Users}
          color="#7C3AED"
          subtitle="New customers this month"
        />
        <MetricCard
          title="Collection Rate"
          value={overview.collectionRate || 0}
          icon={Target}
          color="#059669"
          format="percentage"
        />
        <MetricCard
          title="Default Rate"
          value={overview.defaultRate}
          icon={AlertTriangle}
          color="#DC2626"
          format="percentage"
        />
        <MetricCard
          title="Avg Loan Size"
          value={overview.averageLoanSize || 0}
          icon={TrendingUp}
          color="#D97706"
          format="currency"
        />
      </div>
    )
  }

  const QuickInsights = () => (
    <div className="insights-section">
      <h3>Quick Insights</h3>
      <div className="insights-grid">
        {/* Placeholder for dynamic insights */}
        <div className="insight-card positive">
          <div className="insight-icon">📈</div>
          <div className="insight-content">
            <h4>Portfolio Growth</h4>
            <p>Your loan portfolio grew by <strong>15.2%</strong> this month, exceeding the target of 12%</p>
          </div>
        </div>
        <div className="insight-card warning">
          <div className="insight-icon">⚠️</div>
          <div className="insight-content">
            <h4>Collection Alert</h4>
            <p><strong>23 loans</strong> are due for collection today. Priority focus on overdue accounts.</p>
          </div>
        </div>
        <div className="insight-card info">
          <div className="insight-icon">👥</div>
          <div className="insight-content">
            <h4>Customer Segment</h4>
            <p>Mama Mboga customers show <strong>97% repayment rate</strong> - highest performing segment</p>
          </div>
        </div>
        <div className="insight-card success">
          <div className="insight-icon">🎯</div>
          <div className="insight-content">
            <h4>Target Achievement</h4>
            <p>Monthly collection target achieved at <strong>103.4%</strong> with 3 days remaining</p>
          </div>
        </div>
      </div>
    </div>
  )

  const ChartSection = () => {
    if (!analyticsData) return null
    const { performance, customers, risk } = analyticsData
    return (
      <div className="charts-section">
        <div className="charts-grid">
          <div className="chart-container large">
            <div className="chart-header">
              <h3>Portfolio Performance Trend</h3>
              <div className="chart-actions">
                <select 
                  className="chart-select"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  {periodOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <PortofolioChart data={performance.disbursed} />
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h3>Collection Performance</h3>
            </div>
            <CollectionChart data={performance.collections} />
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h3>Loan Distribution</h3>
            </div>
            <div className="loan-distribution">
              {customers.segments.map((type, index) => (
                <div key={index} className="distribution-item">
                  <div className="distribution-header">
                    <span>{type.segment}</span>
                    <span>{type.percentage}%</span>
                  </div>
                  <div className="distribution-bar">
                    <div 
                      className="distribution-fill"
                      style={{ 
                        width: `${type.percentage}%`,
                        backgroundColor: ['#1E40AF', '#059669', '#D97706', '#DC2626'][index] 
                      }}
                    ></div>
                  </div>
                  <div className="distribution-amount">
                    KSH {(type.avgLoan / 1000).toFixed(1)}K
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h3>Risk Analysis</h3>
            </div>
            <RiskAnalysis data={risk} detailed={true} />
          </div>

          <div className="chart-container large">
            <div className="chart-header">
              <h3>Customer Segmentation</h3>
            </div>
            <CustomerSegmntation data={customers} />
          </div>
        </div>
      </div>
    )
  }

  const PerformanceTable = () => {
    if (!analyticsData) return null
    return (
      <div className="performance-table-section">
        <div className="table-header">
          <h3>Detailed Performance Metrics</h3>
          <button className="btn btn-secondary btn-sm">
            <Download size={14} />
            Export
          </button>
        </div>
        
        <div className="performance-table">
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Current</th>
                <th>Target</th>
                <th>Previous</th>
                <th>Change</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Portfolio Value</td>
                <td>KSH 15.42M</td>
                <td>KSH 15.00M</td>
                <td>KSH 13.38M</td>
                <td className="positive">+15.2%</td>
                <td><span className="status-badge success">Achieved</span></td>
              </tr>
              <tr>
                <td>Collection Rate</td>
                <td>94.2%</td>
                <td>95.0%</td>
                <td>92.1%</td>
                <td className="positive">+2.1%</td>
                <td><span className="status-badge warning">Near Target</span></td>
              </tr>
              <tr>
                <td>Default Rate</td>
                <td>2.8%</td>
                <td>3.0%</td>
                <td>3.3%</td>
                <td className="positive">-0.5%</td>
                <td><span className="status-badge success">On Track</span></td>
              </tr>
              <tr>
                <td>Customer Acquisition</td>
                <td>47</td>
                <td>50</td>
                <td>38</td>
                <td className="positive">+23.7%</td>
                <td><span className="status-badge warning">Behind</span></td>
              </tr>
              <tr>
                <td>Average Loan Size</td>
                <td>KSH 47,500</td>
                <td>KSH 45,000</td>
                <td>KSH 43,750</td>
                <td className="positive">+8.6%</td>
                <td><span className="status-badge success">Exceeded</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <div className="header-content">
          <h1>Analytics Dashboard</h1>
          <p>Comprehensive insights into your microfinance operations</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
            Refresh
          </button>
          <button className="btn btn-primary">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="period-selector">
        <div className="period-tabs">
          {periodOptions.map(option => (
            <button
              key={option.value}
              className={`period-tab ${selectedPeriod === option.value ? 'active' : ''}`}
              onClick={() => setSelectedPeriod(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="last-updated">
          <Clock size={14} />
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* View Navigation */}
      <div className="view-navigation">
        <button 
          className={`view-tab ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveView('overview')}
        >
          <BarChart3 size={16} />
          Overview
        </button>
        <button 
          className={`view-tab ${activeView === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveView('performance')}
        >
          <TrendingUp size={16} />
          Performance
        </button>
        <button 
          className={`view-tab ${activeView === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveView('customers')}
        >
          <Users size={16} />
          Customers
        </button>
        <button 
          className={`view-tab ${activeView === 'risk' ? 'active' : ''}`}
          onClick={() => setActiveView('risk')}
        >
          <AlertTriangle size={16} />
          Risk Analysis
        </button>
      </div>

      {/* Content */}
      <div className="analytics-content">
        {activeView === 'overview' && (
          <>
            <OverviewMetrics />
            <QuickInsights />
            <ChartSection />
          </>
        )}
        
        {activeView === 'performance' && (
          <>
            <OverviewMetrics />
            <PerformanceTable />
            <ChartSection />
          </>
        )}
        
        {activeView === 'customers' && (
          <>
            <div className="customer-analytics">
              {analyticsData.customers && analyticsData.customers.segments && analyticsData.customers.segments.length > 0 ? (
                <CustomerSegmntation data={analyticsData.customers} selectedPeriod={selectedPeriod} />
              ) : (
                <div className="empty-state">
                  <p>No customers data available.</p>
                </div>
              )}
            </div>
          </>
        )}
        
        {activeView === 'risk' && (
          <>
            <div className="risk-analytics">
              <RiskAnalysis data={analyticsData.risk} detailed={true} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AnalyticsDashboard