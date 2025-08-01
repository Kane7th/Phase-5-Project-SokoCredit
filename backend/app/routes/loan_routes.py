from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models import Loan, User, RepaymentSchedule, LoanProduct
from app.models.loan import LoanStatus
from app.models.loan_products import RepaymentFrequencies
from app.models.repaymentSchedule import RepaymentStatus
from utils.decorators import role_required

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

        # Check if customer has an active loan - cant apply if theres existing loan
        active_loan = Loan.query.filter(
            Loan.customer_id == customer_id,
            Loan.status.in_([LoanStatus.pending, LoanStatus.approved, LoanStatus.disbursed, LoanStatus.overdue])
        ).first()

        if active_loan:
            return jsonify({'error': 'You already have an active loan'}), 403

        # constraint to correct loan product
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


# GET all loan products (any user can view)
@loan_product_bp.route('', methods=['GET'])
@jwt_required()
def get_loan_products():
    products = LoanProduct.query.all()
    return jsonify([product.to_dict() for product in products]), 200


# GET single loan product by ID
@loan_product_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def get_loan_product(id):
    product = LoanProduct.query.get(id)
    if not product:
        return jsonify({'error': 'Loan product not found'}), 404
    return jsonify(product.to_dict()), 200

# A lender/admin can create a new loan product
@loan_product_bp.route('', methods=['POST'])
@jwt_required()
@role_required(['admin', 'lender'])
def create_loan_product():
    try:
        # Each loanproduct is attached to lender, so explicitly define how admin creates products
        identity = get_jwt_identity().split(':')
        user_id = int(identity[0])
        role = identity[1]

        if role == 'admin':
            lender_id = data.get('lender_id')
            if not lender_id:
                return jsonify({'error': 'Admin must provide lender_id'}), 400
        else:
            lender_id = user_id
        
        # define data for product creation
        data = request.get_json()
        required_fields = ['name', 'max_amount', 'interest_rate', 'duration_months', 'frequency']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({'error': f'Missing or empty fields: {", ".join(missing_fields)}'}), 400

        name = data['name']
        description = data.get('description')
        max_amount = float(data['max_amount'])
        interest_rate = float(data['interest_rate'])
        duration_months = int(data['duration_months'])
        frequency = RepaymentFrequencies(data['frequency'])

        loan_product = LoanProduct(
            name=name,
            description=description,
            max_amount=max_amount,
            interest_rate=interest_rate,
            duration_months=duration_months,
            frequency=frequency,
            lender_id=lender_id
        )

        db.session.add(loan_product)
        db.session.commit()

        return jsonify({
            "id": loan_product.id,
            "name": loan_product.name,
            "description": loan_product.description,
            "max_amount": loan_product.max_amount,
            "interest_rate": loan_product.interest_rate,
            "duration_months": loan_product.duration_months,
            "frequency": loan_product.frequency.value,
            "lender": {
                "id": loan_product.lender.id,
                "first_name": loan_product.lender.first_name,
                "last_name": loan_product.lender.last_name
            }
        }), 200

    except (ValueError, TypeError):
        db.session.rollback()
        return jsonify({'error': 'Invalid data types in fields'}), 400
    except KeyError:
        db.session.rollback()
        return jsonify({'error': 'Missing required fields'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create loan product', 'details': str(e)}), 500

# A lender/admin can edit existing loan product
@loan_product_bp.route('/<int:id>', methods=['PATCH'])
@jwt_required()
@role_required(['admin', 'lender'])
def update_loan_product(id):
    loan_product = LoanProduct.query.get(id)
    if not loan_product:
        return jsonify({'error': 'Loan product not found'}), 404

    data = request.get_json()
    try:
        loan_product.name = data.get('name', loan_product.name)
        loan_product.description = data.get('description', loan_product.description)
        loan_product.max_amount = float(data.get('max_amount', loan_product.max_amount))
        loan_product.interest_rate = float(data.get('interest_rate', loan_product.interest_rate))
        loan_product.duration_months = int(data.get('duration_months', loan_product.duration_months))

        if 'frequency' in data:
            frequency_str = data['frequency']
            try:
                loan_product.frequency = RepaymentFrequencies(frequency_str)
            except ValueError:
                return jsonify({
                    'error': f'Invalid frequency: {frequency_str}. Must be one of {[f.value for f in RepaymentFrequencies]}'
                }), 400

        db.session.commit()
        return jsonify(loan_product.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update loan product', 'message': str(e)}), 500

# admin/lender can DELETE a loan product
@loan_product_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@role_required(['admin', 'lender'])
def delete_loan_product(id):
    loan_product = LoanProduct.query.get(id)
    if not loan_product:
        return jsonify({'error': 'Loan product not found'}), 404

    try:
        db.session.delete(loan_product)
        db.session.commit()
        return jsonify({'message': 'Loan product deleted'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete loan product', 'message': str(e)}), 500

# A lender approves any applied loan
@loan_bp.route('/<int:id>/approve', methods=['PATCH'])
@jwt_required()
@role_required(['admin', 'lender'])
def approve_loan(id):
    try:
        loan = Loan.query.get_or_404(id)
        
        # Restrict approval to assigned lenders only
        current_user_id = int(get_jwt_identity().split(':')[0])
        user = User.query.get(current_user_id)
        if loan.lender_id != current_user_id and user.role != 'admin':
            return jsonify({'error': 'You can only approve your own loans'}), 403

        if loan.status != LoanStatus.pending:
            return jsonify({'error': 'No pending loans to approve'}), 400

        loan.status = LoanStatus.approved
        loan.approved_date = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'message': 'Loan approved and repayment schedule created',
            'loan': loan.to_dict(rules=(
                '-borrower', '-lender', '-repayments', '-loan_product'
            ))
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
        
        # Restrict that only loan-specific assigned lender can reject
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

        #Restriction that only loan-specific assigned user can disburse
        current_user_id = int(get_jwt_identity().split(':')[0])
        user = User.query.get(current_user_id)
        if loan.lender_id != current_user_id and user.role != 'admin':
            return jsonify({'error': 'You can only disburse your own loans'}), 403

        if loan.status != LoanStatus.approved:
            return jsonify({'error': 'You can only disburse approved loan'}), 400

        loan.status = LoanStatus.disbursed
        loan.issued_date = datetime.utcnow()
        
        # Generate repayment schedule based on loan product terms
        from utils.repayment_status import generate_repayment_schedule
        schedules = generate_repayment_schedule(loan)
        for schedule in schedules:
            db.session.add(schedule)
        db.session.commit()
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
    return jsonify({'message': 'Loan marked as complete'}), 200
