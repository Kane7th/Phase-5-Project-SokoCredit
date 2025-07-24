from datetime import datetime, timedelta

# OVERVIEW DATA
analytics_overview = {
    "totalRevenue": 1450000,
    "totalDisbursed": 1800000,
    "totalRepaid": 1200000,
    "activeLoans": 348,
    "defaultRate": 6.8,
    "newCustomersThisMonth": 42,
}

# PERFORMANCE DATA
analytics_performance = {
    "monthlyPerformance": [
        {"month": "Jan", "disbursed": 200000, "repaid": 180000},
        {"month": "Feb", "disbursed": 220000, "repaid": 190000},
        {"month": "Mar", "disbursed": 250000, "repaid": 200000},
        {"month": "Apr", "disbursed": 210000, "repaid": 185000},
        {"month": "May", "disbursed": 280000, "repaid": 240000},
        {"month": "Jun", "disbursed": 300000, "repaid": 260000},
    ],
    "growthRate": 11.4,
}

# CUSTOMER SEGMENTATION
customer_segments = [
    {"segment": "Mama Mboga", "count": 210},
    {"segment": "Boda Boda", "count": 130},
    {"segment": "Shop Owners", "count": 95},
    {"segment": "Others", "count": 48},
]

# DEMOGRAPHICS
customer_demographics = {
    "ageGroups": {
        "18-25": 52,
        "26-35": 185,
        "36-50": 121,
        "51+": 43
    },
    "gender": {
        "male": 197,
        "female": 204
    },
    "location": {
        "Nairobi": 128,
        "Kisumu": 94,
        "Mombasa": 88,
        "Eldoret": 46,
        "Other": 45
    }
}

# RISK DATA
risk_distribution = [
    {"riskLevel": "low", "count": 213},
    {"riskLevel": "medium", "count": 102},
    {"riskLevel": "high", "count": 36},
]

risk_trends = [
    {"month": "Apr", "defaults": 12},
    {"month": "May", "defaults": 18},
    {"month": "Jun", "defaults": 23},
    {"month": "Jul", "defaults": 16},
]

# LOAN DISBURSEMENTS
loan_disbursements = [
    {"month": "Apr", "amount": 220000},
    {"month": "May", "amount": 280000},
    {"month": "Jun", "amount": 300000},
]

loan_repayments = [
    {"month": "Apr", "amount": 180000},
    {"month": "May", "amount": 240000},
    {"month": "Jun", "amount": 260000},
]

default_rates = [
    {"month": "Apr", "rate": 4.5},
    {"month": "May", "rate": 6.2},
    {"month": "Jun", "rate": 6.8},
]

# LOAN TYPES
loan_types_data = [
    {"type": "Business", "count": 210},
    {"type": "Personal", "count": 85},
    {"type": "Emergency", "count": 55},
]

loan_repayment_rate = 86.5

# LOAN OVERVIEW
loan_overview_data = {
    "totalLoans": 428,
    "disbursedAmount": 1850000,
    "repaidAmount": 1420000,
    "activeLoans": 314,
    "defaultedLoans": 42
}

# PORTFOLIO DATA
loan_portfolio_data = {
    "regionStats": [
        {"region": "Nairobi", "portfolioValue": 580000, "activeLoans": 110},
        {"region": "Kisumu", "portfolioValue": 300000, "activeLoans": 80},
        {"region": "Mombasa", "portfolioValue": 270000, "activeLoans": 75},
        {"region": "Others", "portfolioValue": 250000, "activeLoans": 49},
    ],
    "loanProductStats": [
        {"product": "Jikimu Loan", "value": 950000},
        {"product": "Biashara Boost", "value": 520000},
        {"product": "Emergency Advance", "value": 180000}
    ]
}
