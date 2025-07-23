from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from utils.decorators import role_required

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

# GET analytics overview
@analytics_bp.route('/overview', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_overview():
    data = {
        "totalPortfolio": 15420000,
        "portfolioGrowth": 15.2,
        "activeLoans": 1247,
        "totalCustomers": 1584,
        "collectionRate": 94.2,
        "defaultRate": 2.8,
        "averageLoanSize": 47500,
        "netProfit": 2340000
    }
    return jsonify(data)

# GET performance metrics
@analytics_bp.route('/performance', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_performance():
    data = {
        "disbursed": [
            {"month": "Oct", "amount": 8500000},
            {"month": "Nov", "amount": 10200000},
            {"month": "Dec", "amount": 12800000},
            {"month": "Jan", "amount": 15420000}
        ],
        "collections": [
            {"month": "Oct", "target": 1200000, "actual": 1150000},
            {"month": "Nov", "target": 1400000, "actual": 1380000},
            {"month": "Dec", "target": 1600000, "actual": 1520000},
            {"month": "Jan", "target": 1800000, "actual": 1695000}
        ],
        "loanTypes": [
            {"type": "Business", "value": 65, "amount": 10023000},
            {"type": "Personal", "value": 20, "amount": 3084000},
            {"type": "Emergency", "value": 10, "amount": 1542000},
            {"type": "Equipment", "value": 5, "amount": 771000}
        ]
    }
    return jsonify(data)

# GET customer analytics
@analytics_bp.route('/customers', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_customer_analytics():
    data = {
        "segments": [
            {"segment": "Mama Mboga", "count": 1034, "percentage": 65.3, "avgLoan": 35000},
            {"segment": "General Store", "count": 317, "percentage": 20.0, "avgLoan": 65000},
            {"segment": "Restaurant", "count": 127, "percentage": 8.0, "avgLoan": 85000},
            {"segment": "Other", "count": 106, "percentage": 6.7, "avgLoan": 45000}
        ],
        "demographics": {
            "ageGroups": [
                {"age": "18-25", "count": 158, "percentage": 10.0},
                {"age": "26-35", "count": 634, "percentage": 40.0},
                {"age": "36-45", "count": 475, "percentage": 30.0},
                {"age": "46-55", "count": 238, "percentage": 15.0},
                {"age": "55+", "count": 79, "percentage": 5.0}
            ],
            "gender": [
                {"gender": "Female", "count": 1109, "percentage": 70.0},
                {"gender": "Male", "count": 475, "percentage": 30.0}
            ]
        }
    }
    return jsonify(data)

# GET risk analysis
@analytics_bp.route('/risk', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_risk_analysis():
    data = {
        "distribution": [
            {"risk": "Low Risk", "count": 1109, "percentage": 70.0, "color": "#059669"},
            {"risk": "Medium Risk", "count": 395, "percentage": 25.0, "color": "#D97706"},
            {"risk": "High Risk", "count": 80, "percentage": 5.0, "color": "#DC2626"}
        ],
        "trends": [
            {"month": "Oct", "low": 68, "medium": 27, "high": 5},
            {"month": "Nov", "low": 69, "medium": 26, "high": 5},
            {"month": "Dec", "low": 70, "medium": 25, "high": 5},
            {"month": "Jan", "low": 70, "medium": 25, "high": 5}
        ]
    }
    return jsonify(data)
