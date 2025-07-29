from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from utils.decorators import role_required
from app.extensions import db
from app.models.user import User
from app.models.customer import Customer
from app.models.loan import Loan
from app.models.repayment import Repayment
from app.models.loan_products import LoanProduct
from sqlalchemy import func, case, and_

analytics_bp = Blueprint('analytics', __name__, url_prefix='/analytics')

# OVERVIEW
@analytics_bp.route('/overview', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_overview():
    total_revenue = db.session.query(func.sum(Repayment.amount)).scalar() or 0
    total_disbursed = db.session.query(func.sum(Loan.amount)).scalar() or 0
    total_repaid = total_revenue
    active_loans = db.session.query(Loan).filter(Loan.status == 'active').count()
    defaulted_loans = db.session.query(Loan).filter(Loan.status == 'defaulted').count()
    new_customers_this_month = db.session.query(Customer).filter(
        func.date_trunc('month', Customer.created_at) == func.date_trunc('month', func.now())
    ).count()

    default_rate = (defaulted_loans / active_loans * 100) if active_loans > 0 else 0

    return jsonify({
        "totalRevenue": total_revenue,
        "totalDisbursed": total_disbursed,
        "totalRepaid": total_repaid,
        "activeLoans": active_loans,
        "defaultRate": default_rate,
        "newCustomersThisMonth": new_customers_this_month,
    })

# PERFORMANCE
@analytics_bp.route('/performance', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_performance():
    # Monthly disbursed and repaid amounts for last 6 months
    from datetime import datetime, timedelta
    import calendar

    today = datetime.today()
    six_months_ago = today - timedelta(days=180)

    monthly_data = []
    for i in range(6):
        month_start = (today.replace(day=1) - timedelta(days=30*i)).replace(day=1)
        month_end = (month_start + timedelta(days=calendar.monthrange(month_start.year, month_start.month)[1] - 1))
        disbursed = db.session.query(func.sum(Loan.amount)).filter(
            Loan.created_at >= month_start,
            Loan.created_at <= month_end
        ).scalar() or 0
        repaid = db.session.query(func.sum(Repayment.amount)).filter(
            Repayment.created_at >= month_start,
            Repayment.created_at <= month_end
        ).scalar() or 0
        monthly_data.append({
            "month": month_start.strftime("%b"),
            "disbursed": disbursed,
            "repaid": repaid
        })

    monthly_data.reverse()  # Oldest first

    # Calculate growth rate (simple example)
    growth_rate = 0
    if len(monthly_data) >= 2 and monthly_data[-2]["disbursed"] > 0:
        growth_rate = ((monthly_data[-1]["disbursed"] - monthly_data[-2]["disbursed"]) / monthly_data[-2]["disbursed"]) * 100

    return jsonify({
        "monthlyPerformance": monthly_data,
        "growthRate": growth_rate
    })

# CUSTOMER ANALYTICS
@analytics_bp.route('/customers', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_customer_analytics():
    # Example segmentation by role or business type
    segments = db.session.query(
        Customer.business_name,
        func.count(Customer.id)
    ).group_by(Customer.business_name).all()

    demographics = {
        "ageGroups": {
            "18-25": 0,
            "26-35": 0,
            "36-50": 0,
            "51+": 0
        },
        "gender": {
            "male": 0,
            "female": 0
        },
        "location": {}
    }

    # For simplicity, demographics data is left as zero or empty
    # This can be extended with actual queries if age, gender, location fields exist

    return jsonify({
        "segments": [{"segment": s[0], "count": s[1]} for s in segments],
        "demographics": demographics
    })

# RISK ANALYSIS
@analytics_bp.route('/risk', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_risk_analysis():
    # Example risk distribution by loan status
    risk_distribution = db.session.query(
        Loan.status,
        func.count(Loan.id)
    ).group_by(Loan.status).all()

    # Example risk trends (dummy data)
    risk_trends = [
        {"month": "Apr", "defaults": 12},
        {"month": "May", "defaults": 18},
        {"month": "Jun", "defaults": 23},
    ]

    return jsonify({
        "distribution": [{"riskLevel": r[0], "count": r[1]} for r in risk_distribution],
        "trends": risk_trends
    })

# LOAN ANALYTICS
@analytics_bp.route('/loans', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_loan_analytics():
    disbursements = db.session.query(
        func.date_trunc('month', Loan.created_at).label('month'),
        func.sum(Loan.amount)
    ).group_by('month').order_by('month').all()

    repayments = db.session.query(
        func.date_trunc('month', Repayment.created_at).label('month'),
        func.sum(Repayment.amount)
    ).group_by('month').order_by('month').all()

    default_rate = 0
    total_loans = db.session.query(Loan).count()
    defaulted_loans = db.session.query(Loan).filter(Loan.status == 'defaulted').count()
    if total_loans > 0:
        default_rate = (defaulted_loans / total_loans) * 100

    return jsonify({
        "disbursements": [{"month": d[0].strftime("%b"), "amount": d[1]} for d in disbursements],
        "repayments": [{"month": r[0].strftime("%b"), "amount": r[1]} for r in repayments],
        "defaultRate": default_rate
    })

@analytics_bp.route('/loans/types', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_loan_types():
    types = db.session.query(
        LoanProduct.name,
        func.count(Loan.id)
    ).join(Loan, Loan.loan_product_id == LoanProduct.id).group_by(LoanProduct.name).all()

    return jsonify({"types": [{"type": t[0], "count": t[1]} for t in types]})

@analytics_bp.route('/loans/repayment', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_loan_repayment():
    # Example repayment schedule and rate (dummy data)
    repayment_schedule = [
        {"month": "Apr", "amount": 180000},
        {"month": "May", "amount": 240000},
        {"month": "Jun", "amount": 260000},
    ]
    repayment_rate = 86.5

    return jsonify({
        "repaymentSchedule": repayment_schedule,
        "repaymentRate": repayment_rate
    })

@analytics_bp.route('/loans/overview', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_loan_overview():
    total_loans = db.session.query(Loan).count()
    disbursed_amount = db.session.query(func.sum(Loan.amount)).scalar() or 0
    repaid_amount = db.session.query(func.sum(Repayment.amount)).scalar() or 0
    active_loans = db.session.query(Loan).filter(Loan.status == 'active').count()
    defaulted_loans = db.session.query(Loan).filter(Loan.status == 'defaulted').count()

    return jsonify({
        "totalLoans": total_loans,
        "disbursedAmount": disbursed_amount,
        "repaidAmount": repaid_amount,
        "activeLoans": active_loans,
        "defaultedLoans": defaulted_loans
    })

@analytics_bp.route('/loans/portfolio', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_loan_portfolio():
    region_stats = db.session.query(
        Customer.location,
        func.sum(Loan.amount),
        func.count(Loan.id)
    ).join(Loan, Loan.customer_id == Customer.id).group_by(Customer.location).all()

    product_stats = db.session.query(
        LoanProduct.name,
        func.sum(Loan.amount)
    ).join(Loan, Loan.loan_product_id == LoanProduct.id).group_by(LoanProduct.name).all()

    return jsonify({
        "regionStats": [{"region": r[0], "portfolioValue": r[1], "activeLoans": r[2]} for r in region_stats],
        "loanProductStats": [{"product": p[0], "value": p[1]} for p in product_stats]
    })
