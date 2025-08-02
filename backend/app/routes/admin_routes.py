from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from utils.decorators import role_required
from app.models import User, LoanProduct
from app.extensions import db

admin_bp = Blueprint('admin_bp', __name__, url_prefix='/api/admin')

@admin_bp.route('/dashboard-stats', methods=['GET'])
@jwt_required()
@role_required(['admin'])
def dashboard_stats():
    total_customers = User.query.filter_by(role='customer').count()
    total_lenders = User.query.filter_by(role='lender').count()
    active_lenders = User.query.filter_by(role='lender', status='approved').count()
    pending_lenders = User.query.filter_by(role='lender', status='pending').count()
    total_loans = 50  # Placeholder, replace with real count
    total_repayments = 200  # Placeholder, replace with real count

    # Placeholder system health calculation (e.g., percentage of successful repayments)
    system_health = 95  # Example static value, replace with real calculation if available

    stats = {
        'totalCustomers': total_customers,
        'totalLenders': total_lenders,
        'activeLenders': active_lenders,
        'pendingLenders': pending_lenders,
        'totalLoans': total_loans,
        'totalRepayments': total_repayments,
        'pendingLoans': 5,
        'approvedLoans': 40,
        'rejectedLoans': 5,
        'systemHealth': system_health
    }
    return jsonify(stats), 200

@admin_bp.route('/pending-lenders', methods=['GET'])
@jwt_required()
@role_required(['admin'])
def pending_lenders():
    import traceback
    try:
        # Query lenders with status 'pending'
        pending_lenders = User.query.filter_by(role='lender', status='pending').all()
        lenders_list = []
        for lender in pending_lenders:
            lenders_list.append({
                'id': lender.id,
                'name': f"{lender.first_name} {lender.last_name}",
                'status': lender.status,
                'email': lender.email,
                'phone': lender.phone,
                # 'documents_complete': lender.documents_complete
            })
        return jsonify(lenders_list), 200
    except Exception as e:
        tb = traceback.format_exc()
        print(f"Error in pending_lenders route: {e}\n{tb}")
        return jsonify({'error': 'Failed to fetch pending lenders', 'message': str(e)}), 500

@admin_bp.route('/lenders', methods=['POST'])
@jwt_required()
@role_required(['admin'])
def add_lender():
    import traceback
    data = request.get_json()
    full_name = data.get('full_name')
    business_name = data.get('business_name')
    email = data.get('email')
    phone = data.get('phone')
    location = data.get('location')
    organisation = data.get('organisation')
    loan_product_name = data.get('loan_product')
    one_time_password = data.get('one_time_password')
    documents_complete = data.get('documents_complete', False)

    if not full_name or not email or not one_time_password:
        return jsonify({'error': 'Full name, email, and one-time password are required'}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'User with this email already exists'}), 400

    # Split full_name into first_name and last_name
    name_parts = full_name.strip().split(' ', 1)
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ''

    # Find loan product by name
    loan_product = None
    if loan_product_name:
        loan_product = LoanProduct.query.filter_by(name=loan_product_name).first()
        if not loan_product:
            return jsonify({'error': f'Loan product "{loan_product_name}" not found'}), 400

    new_lender = User(
        first_name=first_name,
        last_name=last_name,
        username=email,  # Use email as username or generate differently
        email=email,
        phone=phone,
        organisation=organisation,
        loan_product=loan_product,
        role='lender',
        status='approved'  # Automatically approve new lenders added by admin
    )
    new_lender.set_password(one_time_password)

    try:
        db.session.add(new_lender)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        return jsonify({'error': 'Failed to add lender', 'details': str(e)}), 500

    return jsonify({'message': 'Lender added successfully', 'lender_id': new_lender.id}), 201

@admin_bp.route('/lenders/<int:lender_id>/approve', methods=['POST'])
@jwt_required()
@role_required(['admin'])
def approve_lender(lender_id):
    lender = User.query.filter_by(id=lender_id, role='lender').first()
    if not lender:
        return jsonify({'error': 'Lender not found'}), 404
    if lender.status == 'approved':
        return jsonify({'message': 'Lender already approved'}), 200

    lender.status = 'approved'
    db.session.commit()
    return jsonify({'message': 'Lender approved successfully'}), 200

@admin_bp.route('/lenders/<int:lender_id>/reject', methods=['POST'])
@jwt_required()
@role_required(['admin'])
def reject_lender(lender_id):
    lender = User.query.filter_by(id=lender_id, role='lender').first()
    if not lender:
        return jsonify({'error': 'Lender not found'}), 404
    if lender.status == 'rejected':
        return jsonify({'message': 'Lender already rejected'}), 200

    lender.status = 'rejected'
    db.session.commit()
    return jsonify({'message': 'Lender rejected successfully'}), 200

@admin_bp.route('/lenders', methods=['GET'])
@jwt_required()
@role_required(['admin'])
def list_lenders():
    lenders = User.query.filter_by(role='lender').all()
    lenders_list = []
    for lender in lenders:
        lenders_list.append({
            'id': lender.id,
            'name': f"{lender.first_name} {lender.last_name}",
            'email': lender.email,
            'phone': lender.phone,
            'organisation': lender.organisation,
            'loan_product': lender.loan_product.name if lender.loan_product else None,
            'status': lender.status
        })
    return jsonify(lenders_list), 200