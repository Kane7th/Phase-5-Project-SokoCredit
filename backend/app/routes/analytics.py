from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from utils.decorators import role_required 
from .dummy_data import (
    analytics_overview,
    analytics_performance,
    customer_segments,
    customer_demographics,
    risk_distribution,
    risk_trends,
    loan_disbursements,
    loan_repayments,
    default_rates,
    loan_types_data,
    loan_repayment_rate,
    loan_overview_data,
    loan_portfolio_data
)

analytics_bp = Blueprint('analytics', __name__, url_prefix='/analytics')

# OVERVIEW
@analytics_bp.route('/overview', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_overview():
    return jsonify(analytics_overview)


# PERFORMANCE
@analytics_bp.route('/performance', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_performance():
    return jsonify(analytics_performance)


# CUSTOMER ANALYTICS
@analytics_bp.route('/customers', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_customer_analytics():
    return jsonify({
        "segments": customer_segments,
        "demographics": customer_demographics
    })


# RISK ANALYSIS
@analytics_bp.route('/risk', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_risk_analysis():
    return jsonify({
        "distribution": risk_distribution,
        "trends": risk_trends
    })


# LOAN ANALYTICS
@analytics_bp.route('/loans', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_loan_analytics():
    return jsonify({
        "disbursements": loan_disbursements,
        "repayments": loan_repayments,
        "defaultRate": default_rates
    })


@analytics_bp.route('/loans/types', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_loan_types():
    return jsonify({"types": loan_types_data})


@analytics_bp.route('/loans/repayment', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_loan_repayment():
    return jsonify({
        "repaymentSchedule": loan_repayments,
        "repaymentRate": loan_repayment_rate
    })


@analytics_bp.route('/loans/overview', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_loan_overview():
    return jsonify(loan_overview_data)


@analytics_bp.route('/loans/portfolio', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_loan_portfolio():
    return jsonify(loan_portfolio_data)