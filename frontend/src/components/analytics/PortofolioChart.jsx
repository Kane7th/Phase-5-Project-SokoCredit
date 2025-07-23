import React from 'react'

const PortfolioChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.amount))
  
  return (
    <div className="portfolio-chart">
      <div className="chart-area">
        <div className="y-axis">
          <div className="y-label">KSH 20M</div>
          <div className="y-label">KSH 15M</div>
          <div className="y-label">KSH 10M</div>
          <div className="y-label">KSH 5M</div>
          <div className="y-label">KSH 0</div>
        </div>
        
        <div className="chart-content">
          <svg viewBox="0 0 400 200" className="chart-svg">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1="0"
                y1={i * 40}
                x2="400"
                y2={i * 40}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            ))}
            
            {/* Area chart */}
            <defs>
              <linearGradient id="portfolioGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E40AF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            
            {/* Create path for area */}
            {(() => {
              const points = data.map((d, i) => {
                const x = (i / (data.length - 1)) * 400
                const y = 200 - (d.amount / maxValue) * 180
                return `${x},${y}`
              }).join(' ')
              
              const pathData = `M 0,200 L ${points} L 400,200 Z`
              const lineData = `M ${points.split(' ').join(' L ')}`
              
              return (
                <>
                  <path
                    d={pathData}
                    fill="url(#portfolioGradient)"
                  />
                  <path
                    d={lineData}
                    fill="none"
                    stroke="#1E40AF"
                    strokeWidth="3"
                  />
                  
                  {/* Data points */}
                  {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * 400
                    const y = 200 - (d.amount / maxValue) * 180
                    
                    return (
                      <g key={i}>
                        <circle
                          cx={x}
                          cy={y}
                          r="4"
                          fill="#1E40AF"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                        />
                        <text
                          x={x}
                          y={y - 15}
                          textAnchor="middle"
                          fontSize="12"
                          fill="#374151"
                          fontWeight="500"
                        >
                          {(d.amount / 1000000).toFixed(1)}M
                        </text>
                      </g>
                    )
                  })}
                </>
              )
            })()}
          </svg>
          
          <div className="x-axis">
            {data.map((d, i) => (
              <div key={i} className="x-label">{d.month}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PortfolioChart