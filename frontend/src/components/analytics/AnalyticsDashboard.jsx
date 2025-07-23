import React, { useState,} from 'react'
// import { useSelector } from 'react-redux'
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
import PortfolioChart from './PortfolioChart'
import CollectionChart from './CollectionChart'
import RiskAnalysis from './RiskAnalysis'
import CustomerSegmentation from './CustomerSegmentation'
import '../../styles/analytics.css'

const AnalyticsDashboard = () => {
  // const { user } = useSelector((state) => state.auth)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [activeView, setActiveView] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)

  // Mock analytics data
  const [analyticsData,] = useState({
    overview: {
      totalPortfolio: 15420000,
      portfolioGrowth: 15.2,
      activeLoans: 1247,
      totalCustomers: 1584,
      collectionRate: 94.2,
      defaultRate: 2.8,
      averageLoanSize: 47500,
      netProfit: 2340000
    },
    performance: {
      disbursed: [
        { month: 'Oct', amount: 8500000 },
        { month: 'Nov', amount: 10200000 },
        { month: 'Dec', amount: 12800000 },
        { month: 'Jan', amount: 15420000 }
      ],
      collections: [
        { month: 'Oct', target: 1200000, actual: 1150000 },
        { month: 'Nov', target: 1400000, actual: 1380000 },
        { month: 'Dec', target: 1600000, actual: 1520000 },
        { month: 'Jan', target: 1800000, actual: 1695000 }
      ],
      loanTypes: [
        { type: 'Business', value: 65, amount: 10023000 },
        { type: 'Personal', value: 20, amount: 3084000 },
        { type: 'Emergency', value: 10, amount: 1542000 },
        { type: 'Equipment', value: 5, amount: 771000 }
      ]
    },
    customers: {
      segments: [
        { segment: 'Mama Mboga', count: 1034, percentage: 65.3, avgLoan: 35000 },
        { segment: 'General Store', count: 317, percentage: 20.0, avgLoan: 65000 },
        { segment: 'Restaurant', count: 127, percentage: 8.0, avgLoan: 85000 },
        { segment: 'Other', count: 106, percentage: 6.7, avgLoan: 45000 }
      ],
      demographics: {
        ageGroups: [
          { age: '18-25', count: 158, percentage: 10.0 },
          { age: '26-35', count: 634, percentage: 40.0 },
          { age: '36-45', count: 475, percentage: 30.0 },
          { age: '46-55', count: 238, percentage: 15.0 },
          { age: '55+', count: 79, percentage: 5.0 }
        ],
        gender: [
          { gender: 'Female', count: 1109, percentage: 70.0 },
          { gender: 'Male', count: 475, percentage: 30.0 }
        ]
      }
    },
    risk: {
      distribution: [
        { risk: 'Low Risk', count: 1109, percentage: 70.0, color: '#059669' },
        { risk: 'Medium Risk', count: 395, percentage: 25.0, color: '#D97706' },
        { risk: 'High Risk', count: 80, percentage: 5.0, color: '#DC2626' }
      ],
      trends: [
        { month: 'Oct', low: 68, medium: 27, high: 5 },
        { month: 'Nov', low: 69, medium: 26, high: 5 },
        { month: 'Dec', low: 70, medium: 25, high: 5 },
        { month: 'Jan', low: 70, medium: 25, high: 5 }
      ]
    }
  })

  const periodOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ]

  const refreshData = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1500)
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

  const OverviewMetrics = () => (
    <div className="metrics-grid">
      <MetricCard
        title="Total Portfolio"
        value={analyticsData.overview.totalPortfolio}
        change={analyticsData.overview.portfolioGrowth}
        icon={DollarSign}
        color="#1E40AF"
        format="currency"
      />
      <MetricCard
        title="Active Loans"
        value={analyticsData.overview.activeLoans}
        icon={BarChart3}
        color="#059669"
        subtitle="Currently disbursed"
      />
      <MetricCard
        title="Total Customers"
        value={analyticsData.overview.totalCustomers}
        icon={Users}
        color="#7C3AED"
        subtitle="Registered businesses"
      />
      <MetricCard
        title="Collection Rate"
        value={analyticsData.overview.collectionRate}
        icon={Target}
        color="#059669"
        format="percentage"
      />
      <MetricCard
        title="Default Rate"
        value={analyticsData.overview.defaultRate}
        icon={AlertTriangle}
        color="#DC2626"
        format="percentage"
      />
      <MetricCard
        title="Avg Loan Size"
        value={analyticsData.overview.averageLoanSize}
        icon={TrendingUp}
        color="#D97706"
        format="currency"
      />
    </div>
  )

  const QuickInsights = () => (
    <div className="insights-section">
      <h3>Quick Insights</h3>
      <div className="insights-grid">
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

  const ChartSection = () => (
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
          <PortfolioChart data={analyticsData.performance.disbursed} />
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3>Collection Performance</h3>
          </div>
          <CollectionChart data={analyticsData.performance.collections} />
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3>Loan Distribution</h3>
          </div>
          <div className="loan-distribution">
            {analyticsData.performance.loanTypes.map((type, index) => (
              <div key={index} className="distribution-item">
                <div className="distribution-header">
                  <span>{type.type}</span>
                  <span>{type.value}%</span>
                </div>
                <div className="distribution-bar">
                  <div 
                    className="distribution-fill"
                    style={{ 
                      width: `${type.value}%`,
                      backgroundColor: ['#1E40AF', '#059669', '#D97706', '#DC2626'][index] 
                    }}
                  ></div>
                </div>
                <div className="distribution-amount">
                  KSH {(type.amount / 1000000).toFixed(1)}M
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3>Risk Analysis</h3>
          </div>
          <RiskAnalysis data={analyticsData.risk} />
        </div>

        <div className="chart-container large">
          <div className="chart-header">
            <h3>Customer Segmentation</h3>
          </div>
          <CustomerSegmentation data={analyticsData.customers} />
        </div>
      </div>
    </div>
  )

  const PerformanceTable = () => (
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
              <CustomerSegmentation data={analyticsData.customers} />
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