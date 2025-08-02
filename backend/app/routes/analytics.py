from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from utils.decorators import role_required

analytics_bp = Blueprint('analytics_bp', __name__, url_prefix='/api/analytics')

@analytics_bp.route('/overview', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def overview():
    # Placeholder data - replace with real analytics queries
    data = {
        'totalDisbursed': 15420000,
        'activeLoans': 120,
        'newCustomersThisMonth': 45,
        'collectionRate': 94.2,
        'defaultRate': 2.8,
        'averageLoanSize': 47500
    }
    return jsonify(data), 200

@analytics_bp.route('/performance', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def performance():
    # Placeholder data
    data = {
        'disbursed': [
            {'date': '2025-06-01', 'amount': 1000000},
            {'date': '2025-06-15', 'amount': 1200000},
            {'date': '2025-07-01', 'amount': 1100000},
        ],
        'collections': [
            {'date': '2025-06-01', 'amount': 800000},
            {'date': '2025-06-15', 'amount': 900000},
            {'date': '2025-07-01', 'amount': 950000},
        ]
    }
    return jsonify(data), 200

@analytics_bp.route('/customers', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def customers():
    # Placeholder data
    data = {
        'segments': [
            {'segment': 'Mama Mboga', 'percentage': 40, 'avgLoan': 50000},
            {'segment': 'Small Business', 'percentage': 30, 'avgLoan': 75000},
            {'segment': 'Farmers', 'percentage': 20, 'avgLoan': 60000},
            {'segment': 'Others', 'percentage': 10, 'avgLoan': 40000},
        ]
    }
    return jsonify(data), 200

@analytics_bp.route('/risk', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def risk():
    # Placeholder data
    data = {
        'riskLevels': [
            {'level': 'Low', 'count': 80},
            {'level': 'Medium', 'count': 30},
            {'level': 'High', 'count': 10},
        ]
    }
    return jsonify(data), 200