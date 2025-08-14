from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from sqlalchemy.exc import SQLAlchemyError

from flask_cors import cross_origin

from app.extensions import db
from app.models import Loan, User, RepaymentSchedule, LoanProduct, Notification
from app.models.loan import LoanStatus
from app.models.loan_products import RepaymentFrequencies
from app.models.repaymentSchedule import RepaymentStatus
from utils.decorators import role_required
from utils.repayment_status import generate_repayment_schedule
from utils.sms_service import send_sms

loan_bp = Blueprint('loan_bp', __name__)
loan_product_bp = Blueprint('loan_product_bp', __name__)

# ------------------- Loans -------------------

@loan_bp.route('/')
def index():
    return jsonify({"message": "SokoCredit Loan running"})

@loan_bp.route('', methods=['POST'])
@cross_origin()
@jwt_required()
@role_required('customer')
def apply_loan():
    import traceback
    try:
        data = request.get_json() or {}
        product_id = data.get('loan_product_id')
        amount = data.get('amount')

        if not all([product_id, amount]):
            return jsonify({'error': 'Missing required fields: loan_product_id, amount'}), 400

        if not isinstance(amount, (int, float)) or amount <= 0:
            return jsonify({'error': 'Loan amount must be a positive number'}), 400

        customer_id = int(get_jwt_identity().split(':')[0])

        # Ensure customer has no active/pending loans
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

        lender = User.query.get(loan_product.lender_id)
        if lender and lender.phone:
            send_sms(lender.phone, f"SokoCredit: New loan application by customer #{customer_id} for KES {amount}.")

        return jsonify(new_loan.to_dict()), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        import traceback; traceback.print_exc()
        return jsonify({'error': 'Database error', 'details': str(e)}), 500
    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({'error': 'Unexpected error', 'details': str(e)}), 500

# Users can view loans (scoped by role)
@loan_bp.route('', methods=['GET'])
@cross_origin()
@jwt_required()
@role_required(['admin', 'lender', 'customer'])
def get_loans():
    try:
        user_id = int(get_jwt_identity().split(':')[0])
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        if user.role == 'admin':
            loans = Loan.query.all()
        elif user.role == 'lender':
            loans = Loan.query.filter_by(lender_id=user.id).all()
        elif user.role == 'customer':
            loans = Loan.query.filter_by(customer_id=user.id).all()
        else:
            return jsonify({'error': 'Invalid role'}), 403

        return jsonify([loan.to_dict() for loan in loans]), 200
    except Exception as e:
        import traceback; traceback.print_exc()
        db.session.rollback()
        return jsonify({'error': 'Unable to fetch requested loans', 'message': str(e)}), 500

# Approve loan (lender/admin)
@loan_bp.route('/<int:id>/approve', methods=['PATCH', 'OPTIONS'])
@cross_origin()
@jwt_required()
@role_required(['admin', 'lender'])
def approve_loan(id):
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Methods", "PATCH, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Authorization, Content-Type")
        return response

    from flask_jwt_extended import verify_jwt_in_request
    verify_jwt_in_request()

    try:
        loan = Loan.query.get_or_404(id)

        # Only lender who owns the loan or admin can approve
        current_user_id = int(get_jwt_identity().split(':')[0])
        user = User.query.get(current_user_id)
        if loan.lender_id != current_user_id and user.role != 'admin':
            return jsonify({'error': 'You can only approve your own loans'}), 403

        if loan.status != LoanStatus.pending:
            return jsonify({'error': 'No pending loans to approve'}), 400

        loan.status = LoanStatus.approved
        loan.approved_date = datetime.utcnow()

        # Create a simple weekly schedule (12 weeks) immediately on approval
        repayment_count = 12
        amount_per_week = round(loan.amount / repayment_count, 2)
        today = datetime.utcnow()

        for i in range(repayment_count):
            schedule = RepaymentSchedule(
                loan_id=loan.id,
                due_date=today + timedelta(weeks=i),
                amount_due=amount_per_week,
                status=RepaymentStatus.unpaid
            )
            db.session.add(schedule)

        db.session.commit()

        Notification.create_notification(
            user_id=loan.customer_id,
            message=f"Your loan application #{loan.id} has been approved."
        )

        customer = User.query.get(loan.customer_id)
        if customer and customer.phone:
            send_sms(customer.phone, f"SokoCredit: Your loan #{loan.id} has been approved!")

        return jsonify({
            'message': 'Loan approved and repayment schedule created',
            'loan': loan.to_dict(rules=(
                '-borrower', '-lender', '-repayments', '-loan_product',
                'repayment_schedules.id',
                'repayment_schedules.due_date',
                'repayment_schedules.amount_due',
                'repayment_schedules.status'
            ))
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to approve the loan', 'message': str(e)}), 500

# Reject loan (lender/admin)
@loan_bp.route('/<int:id>/reject', methods=['PATCH', 'OPTIONS'])
@cross_origin()
@jwt_required()
@role_required(['admin', 'lender'])
def reject_loan(id):
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Methods", "PATCH, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Authorization, Content-Type")
        return response

    from flask_jwt_extended import verify_jwt_in_request
    verify_jwt_in_request()

    try:
        loan = Loan.query.get_or_404(id)

        # Only lender who owns the loan or admin can reject
        current_user_id = int(get_jwt_identity().split(':')[0])
        user = User.query.get(current_user_id)
        if loan.lender_id != current_user_id and user.role != 'admin':
            return jsonify({'error': 'You can only reject your own loans'}), 403

        data = request.get_json() or {}
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

        customer = User.query.get(loan.customer_id)
        if customer and customer.phone:
            send_sms(customer.phone, f"SokoCredit: Your loan #{loan.id} was rejected. Reason: {rejected_reason}")

        return jsonify(loan.to_dict()), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to reject loan application', 'message': str(e)}), 500

# Disburse loan (lender/admin)
@loan_bp.route('/<int:id>/disburse', methods=['PATCH', 'OPTIONS'])
@cross_origin()
@jwt_required()
@role_required(['admin', 'lender'])
def disburse_loan(id):
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add("Access-Control-Allow-Methods", "PATCH, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Authorization, Content-Type")
        return response

    from flask_jwt_extended import verify_jwt_in_request
    try:
        verify_jwt_in_request()
        loan = Loan.query.get_or_404(id)

        # Only lender who owns the loan or admin can disburse
        current_user_id = int(get_jwt_identity().split(':')[0])
        user = User.query.get(current_user_id)
        if loan.lender_id != current_user_id and user.role != 'admin':
            return jsonify({'error': 'You can only disburse your own loans'}), 403

        if loan.status != LoanStatus.approved:
            return jsonify({'error': 'You can only disburse approved loan'}), 400

        loan.status = LoanStatus.disbursed
        loan.issued_date = datetime.utcnow()

        # If you prefer a smarter generator, keep this (comes from your utils)
        schedules = generate_repayment_schedule(loan)
        for schedule in schedules:
            db.session.add(schedule)

        db.session.commit()

        Notification.create_notification(
            user_id=loan.customer_id,
            message=f"Your loan #{loan.id} has been disbursed. Check your account for details."
        )

        customer = User.query.get(loan.customer_id)
        if customer and customer.phone:
            send_sms(customer.phone, f"SokoCredit: Your loan #{loan.id} has been disbursed. Start repaying on time.")

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
        db.session.rollback()
        return jsonify({'error': 'Failed to disburse the loan', 'message': str(e)}), 500

# Mark loan complete (admin/lender) — kept from your HEAD
@loan_bp.route('/<int:id>/complete', methods=['PATCH'])
@jwt_required()
@role_required(['admin', 'lender'])
def complete_loan(id):
    try:
        loan = Loan.query.get_or_404(id)

        # Only lender who owns the loan or admin can complete
        current_user_id = int(get_jwt_identity().split(':')[0])
        user = User.query.get(current_user_id)
        if loan.lender_id != current_user_id and user.role != 'admin':
            return jsonify({'error': 'You can only complete your own loans'}), 403

        loan.status = LoanStatus.completed
        db.session.commit()

        Notification.create_notification(
            user_id=loan.customer_id,
            message=f"Congratulations! Your loan #{loan.id} has been fully repaid and marked as complete."
        )

        customer = User.query.get(loan.customer_id)
        if customer and customer.phone:
            send_sms(customer.phone, f"SokoCredit: Loan #{loan.id} fully repaid. You're now debt free. 🎉")

        return jsonify({'message': 'Loan marked as complete'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to complete loan', 'message': str(e)}), 500

# Repayments listing (scoped by role)
@loan_bp.route('/repayments', methods=['GET'])
@jwt_required()
@role_required(['admin', 'lender', 'customer'])
def get_repayments():
    import traceback
    try:
        user_id = int(get_jwt_identity().split(':')[0])
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        if user.role in ['admin', 'lender']:
            repayments = RepaymentSchedule.query.all()
        elif user.role == 'customer':
            repayments = RepaymentSchedule.query.join(Loan).filter(Loan.customer_id == user_id).all()
        else:
            return jsonify({'error': 'Invalid role'}), 403

        repayments_dicts = []
        for repayment in repayments:
            try:
                repayments_dicts.append({
                    'id': repayment.id,
                    'loan_id': repayment.loan_id,
                    'due_date': repayment.due_date.isoformat() if repayment.due_date else None,
                    'amount_due': repayment.amount_due,
                    'status': repayment.status.value if repayment.status else None,
                    'loan': repayment.loan.to_dict() if getattr(repayment, 'loan', None) else None
                })
            except Exception as e:
                print(f"Error serializing repayment id {repayment.id}: {e}")

        return jsonify(repayments_dicts), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'error': 'Unable to fetch repayments',
            'message': str(e),
        }), 500

# ------------------- Loan Products -------------------

# List all products
@loan_product_bp.route('', methods=['GET'])
@cross_origin()
@jwt_required()
def get_loan_products():
    products = LoanProduct.query.all()
    return jsonify([product.to_dict() for product in products]), 200

# Get single product
@loan_product_bp.route('/<int:id>', methods=['GET'])
@cross_origin()
@jwt_required()
def get_loan_product(id):
    product = LoanProduct.query.get(id)
    if not product:
        return jsonify({'error': 'Loan product not found'}), 404
    return jsonify(product.to_dict()), 200

# Create product (admin/lender)
@loan_product_bp.route('', methods=['POST'])
@cross_origin()
@jwt_required()
@role_required(['admin', 'lender'])
def create_loan_product():
    try:
        identity = get_jwt_identity().split(':')
        user_id = int(identity[0])
        role = identity[1]

        data = request.get_json() or {}
        required_fields = ['name', 'max_amount', 'interest_rate', 'duration_months', 'frequency']
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({'error': f'Missing or empty fields: {", ".join(missing_fields)}'}), 400

        if role == 'admin':
            lender_id = data.get('lender_id')
            if not lender_id:
                return jsonify({'error': 'Admin must provide lender_id'}), 400
        else:
            lender_id = user_id

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

# Update product (admin/lender)
@loan_product_bp.route('/<int:id>', methods=['PATCH'])
@cross_origin()
@jwt_required()
@role_required(['admin', 'lender'])
def update_loan_product(id):
    loan_product = LoanProduct.query.get(id)
    if not loan_product:
        return jsonify({'error': 'Loan product not found'}), 404

    data = request.get_json() or {}
    try:
        loan_product.name = data.get('name', loan_product.name)
        loan_product.description = data.get('description', loan_product.description)
        if 'max_amount' in data:
            loan_product.max_amount = float(data['max_amount'])
        if 'interest_rate' in data:
            loan_product.interest_rate = float(data['interest_rate'])
        if 'duration_months' in data:
            loan_product.duration_months = int(data['duration_months'])

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

# Delete product (admin/lender)
@loan_product_bp.route('/<int:id>', methods=['DELETE'])
@cross_origin()
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
