from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from utils.decorators import role_required
from app.extensions import db
from app.models.user import User
from app.models.customer import Customer
from app.models.loan import Loan
from app.models.repayment import Repayment
from sqlalchemy import func
from app.models.notification import Notification

# LoanProduct import can vary by project layout; try common paths
try:
    from app.models.loan_products import LoanProduct  # plural module
except Exception:
    try:
        from app.models.loan_product import LoanProduct  # singular module
    except Exception:
        from app.models import LoanProduct  # fallback if exported at package level

analytics_bp = Blueprint('analytics_bp', __name__)

# -------- OVERVIEW --------
@analytics_bp.route('/overview', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def overview():
    """
    High-level KPIs. Uses real aggregates where possible, with safe fallbacks.
    """
    # Totals
    total_disbursed = db.session.query(func.coalesce(func.sum(Loan.amount), 0)).scalar() or 0
    total_repaid = db.session.query(func.coalesce(func.sum(Repayment.amount), 0)).scalar() or 0

    # Active/Default counts
    active_loans = db.session.query(Loan).filter(Loan.status == 'active').count()
    defaulted_loans = db.session.query(Loan).filter(Loan.status == 'defaulted').count()
    default_rate = (defaulted_loans / active_loans * 100.0) if active_loans else 0.0

    # New customers this month
    # If you have created_at on Customer, use it; otherwise fallback to 0
    try:
        from datetime import datetime
        start_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        new_customers_this_month = db.session.query(Customer).filter(Customer.created_at >= start_month).count()
    except Exception:
        new_customers_this_month = 0

    # Average loan size
    avg_loan_size = db.session.query(func.coalesce(func.avg(Loan.amount), 0)).scalar() or 0

    # Collection rate (rough): repaid / disbursed capped to 100
    collection_rate = float(min(100.0, (total_repaid / total_disbursed * 100.0) if total_disbursed else 0.0))

    Notification.create_notification(None, "📊 Overview data accessed.")

    return jsonify({
        "totalDisbursed": int(total_disbursed),
        "totalRepaid": int(total_repaid),
        "activeLoans": active_loans,
        "newCustomersThisMonth": new_customers_this_month,
        "collectionRate": round(collection_rate, 2),
        "defaultRate": round(default_rate, 2),
        "averageLoanSize": int(avg_loan_size)
    }), 200


# -------- PERFORMANCE (time series) --------
@analytics_bp.route('/performance', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_performance():
    """
    Last 6 months disbursed vs repaid totals by month.
    """
    from datetime import datetime, timedelta

    # Build last 6 month buckets (UTC, month start)
    today = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    months = []
    for i in range(6, 0, -1):  # 6,5,4,3,2,1
        month_start = (today - timedelta(days=30 * i)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1)
        months.append((month_start, month_end))

    series = []
    for (start, end) in months:
        disbursed = db.session.query(func.coalesce(func.sum(Loan.amount), 0)).filter(
            Loan.created_at >= start, Loan.created_at < end
        ).scalar() or 0

        repaid = db.session.query(func.coalesce(func.sum(Repayment.amount), 0)).filter(
            Repayment.created_at >= start, Repayment.created_at < end
        ).scalar() or 0

        series.append({
            "month": start.strftime("%Y-%m"),
            "disbursed": int(disbursed),
            "repaid": int(repaid),
        })

    # Simple MoM growth on disbursed
    growth_rate = 0.0
    if len(series) >= 2 and series[-2]["disbursed"] > 0:
        growth_rate = (series[-1]["disbursed"] - series[-2]["disbursed"]) / series[-2]["disbursed"] * 100.0

    Notification.create_notification(None, "📈 Performance data accessed.")

    return jsonify({
        "monthlyPerformance": series,
        "growthRate": round(growth_rate, 2)
    }), 200


# -------- CUSTOMERS --------
@analytics_bp.route('/customers', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_customer_analytics():
    """
    Segments by business_name + placeholder demographics.
    """
    segments_raw = db.session.query(
        Customer.business_name,
        func.count(Customer.id)
    ).group_by(Customer.business_name).all()

    segments = [{"segment": (s[0] or "Unknown"), "count": s[1]} for s in segments_raw]

    # Demographics placeholders unless you store DOB/gender/region fields
    demographics = {
        "ageGroups": {"18-25": 0, "26-35": 0, "36-50": 0, "51+": 0},
        "gender": {"male": 0, "female": 0, "unspecified": 0},
        "location": {}
    }

    Notification.create_notification(None, "👥 Customer analytics accessed.")
    return jsonify({"segments": segments, "demographics": demographics}), 200


# -------- RISK --------
@analytics_bp.route('/risk', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_risk_analysis():
    """
    Distribution by Loan.status + simple default trend placeholder.
    """
    distribution_raw = db.session.query(
        Loan.status, func.count(Loan.id)
    ).group_by(Loan.status).all()

    distribution = [{"riskLevel": (r[0] or "unknown"), "count": r[1]} for r in distribution_raw]

    risk_trends = [
        {"month": "Apr", "defaults": 12},
        {"month": "May", "defaults": 18},
        {"month": "Jun", "defaults": 23},
    ]

    Notification.create_notification(None, "⚠️ Risk analysis viewed.")
    return jsonify({"distribution": distribution, "trends": risk_trends}), 200


# -------- LOANS (time series) --------
@analytics_bp.route('/loans', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_loan_analytics():
    """
    Monthly disbursements & repayments.
    """
    disbursements = db.session.query(
        func.date_trunc('month', Loan.created_at).label('month'),
        func.coalesce(func.sum(Loan.amount), 0)
    ).group_by('month').order_by('month').all()

    repayments = db.session.query(
        func.date_trunc('month', Repayment.created_at).label('month'),
        func.coalesce(func.sum(Repayment.amount), 0)
    ).group_by('month').order_by('month').all()

    map_series = lambda rows: [{"month": r[0].strftime("%b %Y"), "amount": int(r[1])} for r in rows]

    # Default rate across all loans
    total_loans = db.session.query(Loan).count()
    defaulted_loans = db.session.query(Loan).filter(Loan.status == 'defaulted').count()
    default_rate = (defaulted_loans / total_loans * 100.0) if total_loans else 0.0

    Notification.create_notification(None, "💰 Loan analytics accessed.")
    return jsonify({
        "disbursements": map_series(disbursements),
        "repayments": map_series(repayments),
        "defaultRate": round(default_rate, 2)
    }), 200


# -------- LOAN TYPES --------
@analytics_bp.route('/loans/types', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_loan_types():
    types_raw = db.session.query(
        LoanProduct.name,
        func.count(Loan.id)
    ).join(Loan, Loan.loan_product_id == LoanProduct.id) \
     .group_by(LoanProduct.name).all()

    Notification.create_notification(None, "📚 Loan type breakdown accessed.")
    return jsonify({"types": [{"type": t[0], "count": t[1]} for t in types_raw]}), 200


# -------- REPAYMENT SUMMARY --------
@analytics_bp.route('/loans/repayment', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_loan_repayment():
    """
    Placeholder repayment schedule + rate (replace with real schedule if you store it).
    """
    repayment_schedule = [
        {"month": "Apr", "amount": 180000},
        {"month": "May", "amount": 240000},
        {"month": "Jun", "amount": 260000},
    ]
    repayment_rate = 86.5

    Notification.create_notification(None, "🔁 Repayment analytics viewed.")
    return jsonify({
        "repaymentSchedule": repayment_schedule,
        "repaymentRate": repayment_rate
    }), 200


# -------- LOAN OVERVIEW --------
@analytics_bp.route('/loans/overview', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_loan_overview():
    total_loans = db.session.query(Loan).count()
    disbursed_amount = db.session.query(func.coalesce(func.sum(Loan.amount), 0)).scalar() or 0
    repaid_amount = db.session.query(func.coalesce(func.sum(Repayment.amount), 0)).scalar() or 0
    active_loans = db.session.query(Loan).filter(Loan.status == 'active').count()
    defaulted_loans = db.session.query(Loan).filter(Loan.status == 'defaulted').count()

    Notification.create_notification(None, "📊 Loan overview viewed.")
    return jsonify({
        "totalLoans": total_loans,
        "disbursedAmount": int(disbursed_amount),
        "repaidAmount": int(repaid_amount),
        "activeLoans": active_loans,
        "defaultedLoans": defaulted_loans
    }), 200


# -------- PORTFOLIO BREAKDOWN --------
@analytics_bp.route('/loans/portfolio', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender'])
def get_loan_portfolio():
    region_stats_raw = db.session.query(
        Customer.location,
        func.coalesce(func.sum(Loan.amount), 0),
        func.count(Loan.id)
    ).join(Loan, Loan.customer_id == Customer.id) \
     .group_by(Customer.location).all()

    product_stats_raw = db.session.query(
        LoanProduct.name,
        func.coalesce(func.sum(Loan.amount), 0)
    ).join(Loan, Loan.loan_product_id == LoanProduct.id) \
     .group_by(LoanProduct.name).all()

    Notification.create_notification(None, "🌍 Portfolio data accessed.")
    return jsonify({
        "regionStats": [{"region": r[0] or "Unknown", "portfolioValue": int(r[1]), "activeLoans": r[2]} for r in region_stats_raw],
        "loanProductStats": [{"product": p[0], "value": int(p[1])} for p in product_stats_raw]
    }), 200
