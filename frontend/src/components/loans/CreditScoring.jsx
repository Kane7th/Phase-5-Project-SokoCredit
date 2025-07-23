import React, { useState, useEffect } from 'react'
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
  User,
  Building,
  Shield,
  Calculator,
  BarChart3,
  PieChart
} from 'lucide-react'

const CreditScoring = ({ customer, application, onClose }) => {
  const [scoringData, setScoringData] = useState(null)
  const [isCalculating, setIsCalculating] = useState(true)

  useEffect(() => {
    // Simulate credit scoring calculation
    setTimeout(() => {
      const calculatedScore = calculateCreditScore()
      setScoringData(calculatedScore)
      setIsCalculating(false)
    }, 2000)
  }, [customer, application])

  const calculateCreditScore = () => {
    // Mock credit scoring algorithm
    const factors = {
      paymentHistory: {
        weight: 35,
        score: customer.repaymentHistory || 0,
        maxScore: 100,
        description: 'Based on previous loan repayment performance'
      },
      creditUtilization: {
        weight: 30,
        score: calculateUtilizationScore(),
        maxScore: 100,
        description: 'Debt-to-income ratio and existing credit usage'
      },
      creditHistory: {
        weight: 15,
        score: calculateHistoryScore(),
        maxScore: 100,
        description: 'Length of credit history and relationship'
      },
      businessStability: {
        weight: 10,
        score: calculateBusinessScore(),
        maxScore: 100,
        description: 'Business age, revenue stability, and growth'
      },
      collateral: {
        weight: 10,
        score: calculateCollateralScore(),
        maxScore: 100,
        description: 'Quality and value of provided collateral'
      }
    }

    const totalScore = Object.values(factors).reduce((sum, factor) => {
      return sum + (factor.score * factor.weight / 100)
    }, 0)

    return {
      totalScore: Math.round(totalScore),
      factors,
      recommendation: getRecommendation(totalScore),
      riskLevel: getRiskLevel(totalScore),
      maxLoanAmount: calculateMaxLoanAmount(totalScore),
      recommendedRate: calculateRecommendedRate(totalScore)
    }
  }

  const calculateUtilizationScore = () => {
    const monthlyIncome = application.financial.netIncome
    const requestedPayment = (application.loan.amount * 0.12 / 12) // Assuming 12% annual rate
    const utilizationRatio = requestedPayment / monthlyIncome

    if (utilizationRatio <= 0.3) return 100
    if (utilizationRatio <= 0.4) return 80
    if (utilizationRatio <= 0.5) return 60
    if (utilizationRatio <= 0.6) return 40
    return 20
  }

  const calculateHistoryScore = () => {
    const membershipMonths = Math.floor(
      (new Date() - new Date(customer.memberSince)) / (1000 * 60 * 60 * 24 * 30)
    )
    
    if (membershipMonths >= 24) return 100
    if (membershipMonths >= 12) return 80
    if (membershipMonths >= 6) return 60
    if (membershipMonths >= 3) return 40
    return 20
  }

  const calculateBusinessScore = () => {
    const businessTypes = {
      'mama_mboga': 85,
      'general_store': 75,
      'restaurant': 70,
      'transport': 60,
      'other': 50
    }
    
    return businessTypes[application.loan.type] || 50
  }

  const calculateCollateralScore = () => {
    if (application.loan.collateral.toLowerCase().includes('property')) return 100
    if (application.loan.collateral.toLowerCase().includes('vehicle')) return 80
    if (application.loan.collateral.toLowerCase().includes('equipment')) return 60
    if (application.loan.collateral.toLowerCase().includes('inventory')) return 40
    return 20
  }

  const getRecommendation = (score) => {
    if (score >= 70) return 'approve'
    if (score >= 50) return 'conditional'
    return 'reject'
  }

  const getRiskLevel = (score) => {
    if (score >= 70) return { level: 'Low', color: '#10B981' }
    if (score >= 50) return { level: 'Medium', color: '#F59E0B' }
    return { level: 'High', color: '#EF4444' }
  }

  const calculateMaxLoanAmount = (score) => {
    const baseAmount = application.financial.netIncome * 3 // 3 months of net income
    const scoreMultiplier = score / 100
    return Math.round(baseAmount * scoreMultiplier)
  }

  const calculateRecommendedRate = (score) => {
    const baseRate = 12 // Base rate 12%
    const riskPremium = (100 - score) * 0.2 // Risk premium calculation
    return Math.max(8, Math.min(24, baseRate + riskPremium)).toFixed(1)
  }

  const ScoreBreakdown = () => (
    <div className="score-breakdown">
      <h3>Credit Score Breakdown</h3>
      
      <div className="score-summary">
        <div className="total-score">
          <div className="score-circle" style={{ borderColor: scoringData.riskLevel.color }}>
            <span className="score-value">{scoringData.totalScore}</span>
            <span className="score-max">/100</span>
          </div>
          <div className="score-info">
            <h4 style={{ color: scoringData.riskLevel.color }}>
              {scoringData.riskLevel.level} Risk
            </h4>
            <p>Recommendation: {scoringData.recommendation.toUpperCase()}</p>
          </div>
        </div>
      </div>

      <div className="factors-breakdown">
        {Object.entries(scoringData.factors).map(([key, factor]) => (
          <div key={key} className="factor-item">
            <div className="factor-header">
              <span className="factor-name">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
              <span className="factor-weight">{factor.weight}%</span>
            </div>
            
            <div className="factor-score">
              <div className="score-bar">
                <div 
                  className="score-fill"
                  style={{ 
                    width: `${factor.score}%`,
                    backgroundColor: factor.score >= 70 ? '#10B981' : 
                                   factor.score >= 50 ? '#F59E0B' : '#EF4444'
                  }}
                ></div>
              </div>
              <span className="score-value">{factor.score}/100</span>
            </div>
            
            <p className="factor-description">{factor.description}</p>
            
            <div className="factor-impact">
              <span>Score Impact: </span>
              <span style={{ 
                color: factor.score >= 70 ? '#10B981' : 
                       factor.score >= 50 ? '#F59E0B' : '#EF4444'
              }}>
                {((factor.score * factor.weight) / 100).toFixed(1)} points
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const RiskAnalysis = () => (
    <div className="risk-analysis">
      <h3>Risk Analysis</h3>
      
      <div className="risk-factors">
        <div className="risk-category positive">
          <h4>
            <CheckCircle size={16} />
            Positive Factors
          </h4>
          <ul>
            {customer.repaymentHistory > 90 && (
              <li>Excellent payment history ({customer.repaymentHistory}%)</li>
            )}
            {application.financial.netIncome > 15000 && (
              <li>Strong monthly net income (KSH {application.financial.netIncome.toLocaleString()})</li>
            )}
            {customer.totalLoans > 0 && (
              <li>Established credit history with {customer.totalLoans} previous loans</li>
            )}
            {application.loan.amount <= application.financial.netIncome * 3 && (
              <li>Conservative loan amount relative to income</li>
            )}
          </ul>
        </div>

        <div className="risk-category negative">
          <h4>
            <AlertTriangle size={16} />
            Risk Factors
          </h4>
          <ul>
            {customer.repaymentHistory < 85 && customer.repaymentHistory > 0 && (
              <li>Below average payment history ({customer.repaymentHistory}%)</li>
            )}
            {application.financial.otherLoans && (
              <li>Existing loan obligations</li>
            )}
            {application.loan.amount > application.financial.netIncome * 4 && (
              <li>High loan amount relative to income</li>
            )}
            {!application.documents.businessPermit.uploaded && (
              <li>Missing business permit documentation</li>
            )}
          </ul>
        </div>
      </div>

      <div className="risk-mitigation">
        <h4>Risk Mitigation Strategies</h4>
        <div className="mitigation-suggestions">
          {scoringData.totalScore < 70 && (
            <>
              <div className="mitigation-item">
                <Shield size={14} />
                <span>Require additional collateral or guarantor</span>
              </div>
              <div className="mitigation-item">
                <Calendar size={14} />
                <span>Implement more frequent payment monitoring</span>
              </div>
              <div className="mitigation-item">
                <DollarSign size={14} />
                <span>Consider reducing loan amount to KSH {scoringData.maxLoanAmount.toLocaleString()}</span>
              </div>
            </>
          )}
          {scoringData.totalScore >= 50 && scoringData.totalScore < 70 && (
            <div className="mitigation-item">
              <TrendingUp size={14} />
              <span>Increase interest rate to {scoringData.recommendedRate}% to compensate for risk</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const LoanRecommendations = () => (
    <div className="loan-recommendations">
      <h3>Loan Recommendations</h3>
      
      <div className="recommendations-grid">
        <div className="recommendation-card">
          <h4>
            <DollarSign size={16} />
            Recommended Amount
          </h4>
          <div className="recommendation-value">
            KSH {scoringData.maxLoanAmount.toLocaleString()}
          </div>
          <p>
            {scoringData.maxLoanAmount < application.loan.amount 
              ? `Reduce from requested KSH ${application.loan.amount.toLocaleString()}`
              : 'Requested amount is within safe limits'
            }
          </p>
        </div>

        <div className="recommendation-card">
          <h4>
            <TrendingUp size={16} />
            Interest Rate
          </h4>
          <div className="recommendation-value">
            {scoringData.recommendedRate}%
          </div>
          <p>
            {parseFloat(scoringData.recommendedRate) > application.loan.requestedRate
              ? `Increase from requested ${application.loan.requestedRate}%`
              : 'Requested rate is appropriate'
            }
          </p>
        </div>

        <div className="recommendation-card">
          <h4>
            <Calendar size={16} />
            Payment Schedule
          </h4>
          <div className="recommendation-value">
            {application.loan.frequency}
          </div>
          <p>
            {scoringData.totalScore < 60 
              ? 'Consider weekly payments for better monitoring'
              : 'Current frequency is suitable'
            }
          </p>
        </div>
      </div>

      <div className="final-recommendation">
        <h4>Final Recommendation</h4>
        <div className={`recommendation-banner ${scoringData.recommendation}`}>
          {scoringData.recommendation === 'approve' && (
            <>
              <CheckCircle size={24} />
              <div>
                <h5>APPROVE LOAN</h5>
                <p>Customer meets all criteria for loan approval with standard terms.</p>
              </div>
            </>
          )}
          {scoringData.recommendation === 'conditional' && (
            <>
              <AlertTriangle size={24} />
              <div>
                <h5>CONDITIONAL APPROVAL</h5>
                <p>Approve with modified terms and additional monitoring requirements.</p>
              </div>
            </>
          )}
          {scoringData.recommendation === 'reject' && (
            <>
              <XCircle size={24} />
              <div>
                <h5>REJECT APPLICATION</h5>
                <p>High risk profile does not meet lending criteria. Consider declining.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  if (isCalculating) {
    return (
      <div className="credit-scoring-overlay">
        <div className="credit-scoring-modal">
          <div className="calculating-state">
            <div className="calculation-animation">
              <Calculator size={48} />
              <div className="loading-spinner large"></div>
            </div>
            <h3>Calculating Credit Score...</h3>
            <p>Analyzing customer data and risk factors</p>
            <div className="calculation-steps">
              <div className="step completed">✓ Payment history analysis</div>
              <div className="step completed">✓ Financial assessment</div>
              <div className="step active">⚡ Risk evaluation</div>
              <div className="step">Generating recommendations</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="credit-scoring-overlay">
      <div className="credit-scoring-modal">
        <div className="scoring-header">
          <h2>Credit Score Analysis</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="scoring-content">
          <div className="scoring-tabs">
            <div className="tab-content">
              <ScoreBreakdown />
              <RiskAnalysis />
              <LoanRecommendations />
            </div>
          </div>
        </div>

        <div className="scoring-footer">
          <div className="footer-note">
            <p>
              This credit score is generated using our proprietary algorithm and should be used 
              as a guide alongside your professional judgment.
            </p>
          </div>
          <button className="btn btn-primary" onClick={onClose}>
            Use These Recommendations
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreditScoring