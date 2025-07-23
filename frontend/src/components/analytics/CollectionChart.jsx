import React from 'react'

const CollectionChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.target, d.actual)))
  
  return (
    <div className="collection-chart">
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color target"></div>
          <span>Target</span>
        </div>
        <div className="legend-item">
          <div className="legend-color actual"></div>
          <span>Actual</span>
        </div>
      </div>
      
      <div className="bar-chart">
        {data.map((item, index) => (
          <div key={index} className="bar-group">
            <div className="bars">
              <div 
                className="bar target-bar"
                style={{ height: `${(item.target / maxValue) * 100}%` }}
                title={`Target: KSH ${item.target.toLocaleString()}`}
              ></div>
              <div 
                className="bar actual-bar"
                style={{ height: `${(item.actual / maxValue) * 100}%` }}
                title={`Actual: KSH ${item.actual.toLocaleString()}`}
              ></div>
            </div>
            <div className="bar-label">{item.month}</div>
            <div className="bar-values">
              <div className="value target">{(item.target / 1000).toFixed(0)}K</div>
              <div className="value actual">{(item.actual / 1000).toFixed(0)}K</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CollectionChart