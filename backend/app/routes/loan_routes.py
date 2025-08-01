from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models import Loan, User, RepaymentSchedule, LoanProduct, Notification
from app.models.loan import LoanStatus
from app.models.loan_products import RepaymentFrequencies
from app.models.repaymentSchedule import RepaymentStatus
from utils.decorators import role_required
from utils.repayment_status import generate_repayment_schedule

loan_bp = Blueprint('loan_bp', __name__, url_prefix='/loans')
loan_product_bp = Blueprint('loan_product_bp', __name__, url_prefix='/loan-products')

@loan_bp.route('/')
def index():
    return jsonify({"message": "SokoCredit Loan running"})


# CUSTOMER can apply for a loan
@loan_bp.route('', methods=['POST'])
@jwt_required()
@role_required('customer')
def apply_loan():
    try:
        data = request.get_json()
        product_id = data.get('loan_product_id')
        amount = data.get('amount')

        if not all([product_id, amount]):
            return jsonify({'error': 'Missing required fields: loan_product_id, amount'}), 400

        if not isinstance(amount, (int, float)) or amount <= 0:
            return jsonify({'error': 'Loan amount must be a positive number'}), 400

        customer_id = int(get_jwt_identity().split(':')[0])

        active_loan = Loan.query.filter(
            Loan.customer_id == customer_id,
            Loan.status.in_([LoanStatus.pending, LoanStatus.approved, LoanStatus.disbursed, LoanStatus.overdue])
        ).first()

        if active_loan:
            return jsonify({'error': 'You already have an active loan'}), 403

        loan_product = LoanProduct.query.get(product_id)
        if not loan_product:
            return jsonify({'error': 'Selected loan product does not exist'}), 404

        if amount > loan_product.max_amount:
            return jsonify({'error': f'Requested amount exceeds maximum allowed ({loan_product.max_amount})'}), 400

        new_loan = Loan(
            amount=amount,
            interest_rate=loan_product.interest_rate,
            duration_months=loan_product.duration_months,
            customer_id=customer_id,
            status=LoanStatus.pending,
            lender_id=loan_product.lender_id,
            loan_product_id=loan_product.id
        )

        db.session.add(new_loan)
        db.session.commit()

        Notification.create_notification(
            user_id=loan_product.lender_id,
            message=f"New loan application submitted by customer #{customer_id} for KES {amount}"
        )

        return jsonify(new_loan.to_dict()), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error', 'details': str(e)}), 500
    except Exception as e:
        return jsonify({'error': 'Unexpected error', 'details': str(e)}), 500


# Users can view all loans
@loan_bp.route('', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender', 'customer'])
def get_loans():
    try:
        user_id = int(get_jwt_identity().split(':')[0])
        user = User.query.get(user_id)

        if user.role == 'admin':
            loans = Loan.query.all()
        elif user.role == 'lender':
            loans = Loan.query.filter_by(lender_id=user.id).all()
        elif user.role == 'customer':
            loans = Loan.query.filter_by(customer_id=user.id).all()

        return jsonify([
            {
                "id": loan.id,
                "amount": loan.amount,
                "status": loan.status.value,
                "customer_id": loan.customer_id,
                "lender_id": loan.lender_id,
                "loan_product": loan.loan_product.name if loan.loan_product else None
            }
            for loan in loans
        ]), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Unable to fetch requested loans', 'message': str(e)}), 500


# A lender approves any applied loan
@loan_bp.route('/<int:id>/approve', methods=['PATCH'])
@jwt_required()
@role_required(['admin', 'lender'])
def approve_loan(id):
    try:
        loan = Loan.query.get_or_404(id)

        current_user_id = int(get_jwt_identity().split(':')[0])
        user = User.query.get(current_user_id)
        if loan.lender_id != current_user_id and user.role != 'admin':
            return jsonify({'error': 'You can only approve your own loans'}), 403

        if loan.status != LoanStatus.pending:
            return jsonify({'error': 'No pending loans to approve'}), 400

        loan.status = LoanStatus.approved
        loan.approved_date = datetime.utcnow()
        db.session.commit()

        Notification.create_notification(
            user_id=loan.customer_id,
            message=f"Your loan application #{loan.id} has been approved."
        )

        return jsonify({
            'message': 'Loan approved',
            'loan': loan.to_dict(rules=('-borrower', '-lender', '-repayments', '-loan_product'))
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to approve the loan', 'message': str(e)}), 500


# Lender can reject an applied loan
@loan_bp.route('/<int:id>/reject', methods=['PATCH'])
@jwt_required()
@role_required(['admin', 'lender'])
def reject_loan(id):
    try:
        loan = Loan.query.get_or_404(id)
        current_user_id = int(get_jwt_identity().split(':')[0])
        user = User.query.get(current_user_id)
        if loan.lender_id != current_user_id and user.role != 'admin':
            return jsonify({'error': 'You can only reject your own loans'}), 403

        data = request.get_json()
        rejected_reason = data.get('rejected_reason', '')

        if loan.status != LoanStatus.pending:
            return jsonify({'error': 'You can only reject a pending loan'}), 400

        loan.status = LoanStatus.rejected
        loan.rejected_reason = rejected_reason

        db.session.commit()

        Notification.create_notification(
            user_id=loan.customer_id,
            message=f"Your loan application #{loan.id} was rejected. Reason: {rejected_reason}"
        )

        return jsonify(loan.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to reject loan application', 'message': str(e)}), 500


# Lender/admin can disburse loans after approval
@loan_bp.route('/<int:id>/disburse', methods=['PATCH'])
@jwt_required()
@role_required(['admin', 'lender'])
def disburse_loan(id):
    try:
        loan = Loan.query.get_or_404(id)
        current_user_id = int(get_jwt_identity().split(':')[0])
        user = User.query.get(current_user_id)
        if loan.lender_id != current_user_id and user.role != 'admin':
            return jsonify({'error': 'You can only disburse your own loans'}), 403

        if loan.status != LoanStatus.approved:
            return jsonify({'error': 'You can only disburse approved loan'}), 400

        loan.status = LoanStatus.disbursed
        loan.issued_date = datetime.utcnow()
        schedules = generate_repayment_schedule(loan)
        for schedule in schedules:
            db.session.add(schedule)
        db.session.commit()

        Notification.create_notification(
            user_id=loan.customer_id,
            message=f"Your loan #{loan.id} has been disbursed. Check your account for details."
        )

        return jsonify({
            'message': 'Loan disbursed and repayment schedule created',
            'loan': loan.to_dict(rules=(
                '-repayments', '-lender', '-borrower', '-loan_product',
                'repayment_schedules.id',
                'repayment_schedules.due_date',
                'repayment_schedules.amount_due',
                'repayment_schedules.status'
            ))
        }), 200

    except Exception as e:
        return jsonify({'error': 'Failed to disburse the loan', 'message': str(e)}), 500


# mark a loan as complete after all repayments
@loan_bp.route('/<int:id>/complete', methods=['PATCH'])
@jwt_required()
@role_required('lender')
def complete_loan(id):
    loan = Loan.query.get_or_404(id)
    if loan.status != LoanStatus.disbursed:
        return jsonify({'error': 'Only disbursed loans can be marked as complete'}), 400

    unpaid = RepaymentSchedule.query.filter_by(loan_id=id, status=RepaymentStatus.UNPAID).count()
    if unpaid > 0:
        return jsonify({'error': 'Loan still has unpaid installments'}), 400

    loan.status = LoanStatus.completed
    db.session.commit()

    Notification.create_notification(
        user_id=loan.customer_id,
        message=f"Congratulations! Your loan #{loan.id} has been fully repaid and marked as complete."
    )

    return jsonify({'message': 'Loan marked as complete'}), 200
