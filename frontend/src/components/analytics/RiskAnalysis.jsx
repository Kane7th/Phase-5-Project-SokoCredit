import React from 'react'
import { AlertTriangle, Shield, TrendingDown } from 'lucide-react'

const RiskAnalysis = ({ data, detailed = false }) => {
  const totalCustomers = data.distribution.reduce((sum, item) => sum + item.count, 0)
  
  const RiskDistributionChart = () => (
    <div className="risk-distribution">
      <div className="risk-donut">
        <svg viewBox="0 0 120 120" className="donut-chart">
          {(() => {
            let cumulativePercentage = 0
            const radius = 45
            const centerX = 60
            const centerY = 60
            
            return data.distribution.map((item, index) => {
              const percentage = item.percentage
              const startAngle = (cumulativePercentage / 100) * 360 - 90
              const endAngle = ((cumulativePercentage + percentage) / 100) * 360 - 90
              
              const startAngleRad = (startAngle * Math.PI) / 180
              const endAngleRad = (endAngle * Math.PI) / 180
              
              const x1 = centerX + radius * Math.cos(startAngleRad)
              const y1 = centerY + radius * Math.sin(startAngleRad)
              const x2 = centerX + radius * Math.cos(endAngleRad)
              const y2 = centerY + radius * Math.sin(endAngleRad)
              
              const largeArcFlag = percentage > 50 ? 1 : 0
              
              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ')
              
              cumulativePercentage += percentage
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
              )
            })
          })()}
          
          {/* Center text */}
          <text x="60" y="55" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#374151">
            {totalCustomers}
          </text>
          <text x="60" y="70" textAnchor="middle" fontSize="10" fill="#6B7280">
            Customers
          </text>
        </svg>
      </div>
      
      <div className="risk-legend">
        {data.distribution.map((item, index) => (
          <div key={index} className="risk-item">
            <div 
              className="risk-color"
              style={{ backgroundColor: item.color }}
            ></div>
            <div className="risk-details">
              <span className="risk-label">{item.risk}</span>
              <span className="risk-percentage">{item.percentage}%</span>
              <span className="risk-count">({item.count} customers)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
  
  const RiskTrends = () => (
    <div className="risk-trends">
      <h4>Risk Trends (Last 4 Months)</h4>
      <div className="trends-chart">
        {data.trends.map((trend, index) => (
          <div key={index} className="trend-bar">
            <div className="trend-month">{trend.month}</div>
            <div className="trend-stack">
              <div 
                className="trend-segment low"
                style={{ height: `${trend.low}%` }}
                title={`Low Risk: ${trend.low}%`}
              ></div>
              <div 
                className="trend-segment medium"
                style={{ height: `${trend.medium}%` }}
                title={`Medium Risk: ${trend.medium}%`}
              ></div>
              <div 
                className="trend-segment high"
                style={{ height: `${trend.high}%` }}
                title={`High Risk: ${trend.high}%`}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
  
  if (detailed) {
    return (
      <div className="risk-analysis detailed">
        <div className="risk-overview">
          <div className="risk-summary-cards">
            <div className="risk-card low">
              <Shield size={24} />
              <div className="risk-card-content">
                <h4>Low Risk</h4>
                <div className="risk-value">70%</div>
                <p>1,109 customers with excellent payment history</p>
              </div>
            </div>
            
            <div className="risk-card medium">
              <AlertTriangle size={24} />
              <div className="risk-card-content">
                <h4>Medium Risk</h4>
                <div className="risk-value">25%</div>
                <p>395 customers requiring monitoring</p>
              </div>
            </div>
            
            <div className="risk-card high">
              <TrendingDown size={24} />
              <div className="risk-card-content">
                <h4>High Risk</h4>
                <div className="risk-value">5%</div>
                <p>80 customers with payment issues</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="risk-charts">
          <div className="chart-section">
            <h4>Risk Distribution</h4>
            <RiskDistributionChart />
          </div>
          
          <div className="chart-section">
            <RiskTrends />
          </div>
        </div>
        
        <div className="risk-recommendations">
          <h4>Risk Management Recommendations</h4>
          <div className="recommendations-list">
            <div className="recommendation high-priority">
              <div className="rec-priority">High Priority</div>
              <div className="rec-content">
                <h5>Review High-Risk Customers</h5>
                <p>80 customers (5%) are classified as high-risk. Consider restructuring repayment plans or additional collateral.</p>
              </div>
            </div>
            
            <div className="recommendation medium-priority">
              <div className="rec-priority">Medium Priority</div>
              <div className="rec-content">
                <h5>Monitor Medium-Risk Segment</h5>
                <p>25% of portfolio requires closer monitoring. Implement early warning system for payment delays.</p>
              </div>
            </div>
            
            <div className="recommendation low-priority">
              <div className="rec-priority">Low Priority</div>
              <div className="rec-content">
                <h5>Reward Low-Risk Customers</h5>
                <p>70% of customers show excellent payment behavior. Consider loyalty programs or preferential rates.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="risk-analysis">
      <RiskDistributionChart />
    </div>
  )
}

export default RiskAnalysis