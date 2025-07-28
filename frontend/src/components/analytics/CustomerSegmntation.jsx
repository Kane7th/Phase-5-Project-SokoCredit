import React from 'react'
import { Users, TrendingUp, DollarSign } from 'lucide-react'

const CustomerSegmentation = ({ data }) => {
  return (
    <div className="customer-segmentation">
      <div className="segmentation-overview">
        <div className="segments-chart">
          <h4>Business Segments</h4>
          <div className="segments-bars">
            {data.segments.map((segment, index) => (
              <div key={index} className="segment-bar">
                <div className="segment-info">
                  <span className="segment-name">{segment.segment}</span>
                  <span className="segment-percentage">{segment.percentage}%</span>
                </div>
                <div className="segment-visual">
                  <div 
                    className="segment-fill"
                    style={{ 
                      width: `${segment.percentage}%`,
                      backgroundColor: ['#1E40AF', '#059669', '#D97706', '#DC2626'][index] 
                    }}
                  ></div>
                </div>
                <div className="segment-details">
                  <span>{segment.count} customers</span>
                  <span>Avg: KSH {segment.avgLoan.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="demographics-chart">
          <h4>Demographics</h4>
          
          <div className="demo-section">
            <h5>Age Distribution</h5>
            <div className="age-chart">
              {data.demographics.ageGroups.map((group, index) => (
                <div key={index} className="age-bar">
                  <div className="age-label">{group.age}</div>
                  <div className="age-visual">
                    <div 
                      className="age-fill"
                      style={{ width: `${group.percentage}%` }}
                    ></div>
                  </div>
                  <div className="age-value">{group.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="demo-section">
            <h5>Gender Distribution</h5>
            <div className="gender-chart">
              {data.demographics.gender.map((group, index) => (
                <div key={index} className="gender-item">
                  <div className="gender-icon">
                    {group.gender === 'Female' ? '👩' : '👨'}
                  </div>
                  <div className="gender-details">
                    <span className="gender-label">{group.gender}</span>
                    <span className="gender-count">{group.count}</span>
                    <span className="gender-percentage">{group.percentage}%</span>
                  </div>
                  <div className="gender-visual">
                    <div 
                      className="gender-fill"
                      style={{ 
                        width: `${group.percentage}%`,
                        backgroundColor: group.gender === 'Female' ? '#EC4899' : '#3B82F6'
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="segment-insights">
        <h4>Segment Performance</h4>
        <div className="insights-grid">
          <div className="insight-card">
            <Users size={20} />
            <div className="insight-content">
              <h5>Top Performing Segment</h5>
              <p><strong>Mama Mboga</strong> customers show the highest loyalty and repayment rates at 97%</p>
            </div>
          </div>
          
          <div className="insight-card">
            <DollarSign size={20} />
            <div className="insight-content">
              <h5>Highest Value Segment</h5>
              <p><strong>Restaurant</strong> businesses have the highest average loan size at KSH 85,000</p>
            </div>
          </div>
          
          <div className="insight-card">
            <TrendingUp size={20} />
            <div className="insight-content">
              <h5>Growth Opportunity</h5>
              <p><strong>General Store</strong> segment shows 23% month-over-month growth in applications</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerSegmentation