from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from utils.decorators import role_required
from app.extensions import db
from app.models import RepaymentSchedule, Loan, User, Repayment

repayment_bp = Blueprint('repayment_bp', __name__, url_prefix='/repayments')
repayment_schedule_bp = Blueprint('repayment_schedule_bp', __name__, url_prefix='/repayment-schedules')

# Mama mboga GET all scheduled payments
@repayment_schedule_bp.route('', methods=['GET'])
@role_required(['mama_mboga'])
def get_incoming_schedules():
    try:
        user_id = get_jwt_identity().split(':')[0]
        
        schedules = (
            RepaymentSchedule.query.join(Loan).filter(Loan.borrower_id == user_id)
            .filter(RepaymentSchedule.status == 'pending')
            .order_by(RepaymentSchedule.due_date.asc())
            .all()
        )
        return jsonify([schedule.to_dict() for schedule in schedules]), 200
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}, 500)
    
# All users can see all repayments
@repayment_bp.route('', methods=['GET'])
@jwt_required()
@role_required(['mama_mboga', 'lender', 'admin'])
def view_loan_repayments():
    try:
        identity = get_jwt_identity()
        user_id, role = identity.split(':')
        
        if role == 'mama_mboga':
            repayments = Repayment.query.filter_by(user_id=user_id).order_by(Repayment.paid_at.desc()).all()
        else:
            repayments = Repayment.query.order_by(Repayment.paid_at.desc()).all()
        return jsonify([r.to_dict() for r in repayments]), 200
    
    except Exception as e:
        return jsonify({'error': 'Failed to fetch repayments', 'message': str(e)}), 500
    
# Mama mboga POST a payment
@repayment_bp.route('/mpesa-webhook', methods=['POST'])
def mpesa_webhook():
    try:
        data = request.get_json()
        phone = data.get('phone_number')
        amount_paid = data.get('amount_paid')
        mpesa_code = data.get('mpesa_code')

        if not all([phone, amount_paid, mpesa_code]):
            return jsonify({'error': 'Missing required payment info'}), 400

        user = User.query.filter_by(phone=phone).first()
        if not user:
            return jsonify({'error': 'User with this phone not found'}), 404

        # Find the earliest pending repayment for this user
        schedule = (
            RepaymentSchedule.query
            .join(Loan)
            .filter(Loan.borrower_id == user.id, RepaymentSchedule.status == 'pending')
            .order_by(RepaymentSchedule.due_date.asc())
            .first()
        )

        if not schedule:
            return jsonify({'message': 'No pending repayments found.'}), 404

        repayment = Repayment(
            loan_id=schedule.loan_id,
            schedule_id=schedule.id,
            user_id=user.id,
            amount_paid=amount_paid,
            paid_at=datetime.utcnow()
        )

        db.session.add(repayment)
        schedule.status = 'paid'
        schedule.paid_at = datetime.utcnow()

        db.session.commit()
        return jsonify({'message': 'Payment recorded successfully'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Payment error: {str(e)}"}), 500



