from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from utils.decorators import role_required
from app.extensions import db
from app.models.user import User
from app.models.customer import Customer
from app.models.loan import Loan
from app.models.repayment import Repayment
from app.models.loan_products import LoanProduct
from sqlalchemy import func, case, and_, extract
from datetime import datetime

analytics_bp = Blueprint('analytics', __name__)

# OVERVIEW
@analytics_bp.route('/overview', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_overview():
    total_revenue = db.session.query(func.sum(Repayment.amount_paid)).scalar() or 0
    total_disbursed = db.session.query(func.sum(Loan.amount)).scalar() or 0
    total_repaid = total_revenue
    active_loans = db.session.query(Loan).filter(Loan.status == 'active').count()
    defaulted_loans = db.session.query(Loan).filter(Loan.status == 'defaulted').count()
    
    # SQLite-compatible way to get customers created this month
    current_month = datetime.now().month
    current_year = datetime.now().year
    new_customers_this_month = db.session.query(Customer).filter(
        extract('month', Customer.created_at) == current_month,
        extract('year', Customer.created_at) == current_year
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
        # Use issued_date instead of created_at since Loan model doesn't have created_at
        disbursed = db.session.query(func.sum(Loan.amount)).filter(
            Loan.issued_date >= month_start,
            Loan.issued_date <= month_end
        ).scalar() or 0
        repaid = db.session.query(func.sum(Repayment.amount_paid)).filter(
            Repayment.paid_at >= month_start,
            Repayment.paid_at <= month_end
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
    # Segmentation by business name with count and average loan amount
    segments_raw = db.session.query(
        Customer.business_name,
        func.count(Customer.id),
        func.avg(Loan.amount)
    ).join(Loan, Loan.customer_id == Customer.id).group_by(Customer.business_name).all()

    total_customers = sum([s[1] for s in segments_raw]) or 1  # avoid division by zero

    segments = []
    for business_name, count, avg_loan in segments_raw:
        percentage = (count / total_customers) * 100
        segments.append({
            "segment": business_name,
            "count": count,
            "percentage": round(percentage, 2),
            "avgLoan": round(avg_loan or 0, 2)
        })

    demographics = {
        "ageGroups": [
            {"age": "18-25", "percentage": 0},
            {"age": "26-35", "percentage": 0},
            {"age": "36-50", "percentage": 0},
            {"age": "51+", "percentage": 0}
        ],
        "gender": [
            {"gender": "male", "count": 0, "percentage": 0},
            {"gender": "female", "count": 0, "percentage": 0}
        ],
        "location": {}
    }

    # For simplicity, demographics data is left as zero or empty
    # This can be extended with actual queries if age, gender, location fields exist

    return jsonify({
        "segments": segments,
        "demographics": demographics
    })

# RISK ANALYSIS
@analytics_bp.route('/risk', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_risk_analysis():
    # Example risk distribution by loan status
    risk_distribution_raw = db.session.query(
        Loan.status,
        func.count(Loan.id)
    ).group_by(Loan.status).all()

    total_loans = sum([r[1] for r in risk_distribution_raw]) or 1  # avoid division by zero

    # Assign colors and calculate percentages
    color_map = {
        'active': '#059669',    # green
        'defaulted': '#DC2626', # red
        'completed': '#1E40AF', # blue
        'pending': '#FBBF24',   # yellow
    }

    risk_distribution = []
    for status, count in risk_distribution_raw:
        percentage = (count / total_loans) * 100
        risk_distribution.append({
            "risk": status.value if hasattr(status, 'value') else status,
            "count": count,
            "percentage": round(percentage, 2),
            "color": color_map.get(status.value if hasattr(status, 'value') else status, '#6B7280')  # default gray
        })

    # Example risk trends (dummy data)
    risk_trends = [
        {"month": "Apr", "low": 70, "medium": 25, "high": 5},
        {"month": "May", "low": 68, "medium": 27, "high": 5},
        {"month": "Jun", "low": 65, "medium": 30, "high": 5},
        {"month": "Jul", "low": 63, "medium": 32, "high": 5},
    ]

    return jsonify({
        "distribution": risk_distribution,
        "trends": risk_trends
    })

# LOAN ANALYTICS
@analytics_bp.route('/loans', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_loan_analytics():
    # Get monthly disbursements using SQLite-compatible approach
    disbursements_raw = db.session.query(
        extract('month', Loan.issued_date).label('month'),
        extract('year', Loan.issued_date).label('year'),
        func.sum(Loan.amount)
    ).group_by('year', 'month').order_by('year', 'month').all()

    # Format disbursements data
    disbursements = []
    for item in disbursements_raw:
        month_name = datetime(2023, int(item.month), 1).strftime("%b")
        disbursements.append({
            "month": month_name,
            "amount": item[2]
        })

    # Get monthly repayments using SQLite-compatible approach
    repayments_raw = db.session.query(
        extract('month', Repayment.paid_at).label('month'),
        extract('year', Repayment.paid_at).label('year'),
        func.sum(Repayment.amount_paid)
    ).group_by('year', 'month').order_by('year', 'month').all()

    # Format repayments data
    repayments = []
    for item in repayments_raw:
        month_name = datetime(2023, int(item.month), 1).strftime("%b")
        repayments.append({
            "month": month_name,
            "amount": item[2]
        })

    default_rate = 0
    total_loans = db.session.query(Loan).count()
    defaulted_loans = db.session.query(Loan).filter(Loan.status == 'defaulted').count()
    if total_loans > 0:
        default_rate = (defaulted_loans / total_loans) * 100

    return jsonify({
        "disbursements": disbursements,
        "repayments": repayments,
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
    repaid_amount = db.session.query(func.sum(Repayment.amount_paid)).scalar() or 0
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
