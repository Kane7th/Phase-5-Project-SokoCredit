from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.decorators import role_required
from app.extensions import db
from app.models import  User, Repayment

repayment_bp = Blueprint('repayment_bp', __name__, url_prefix='/repayments')

# customer GET repayment history
@repayment_bp.route('/history', methods=['GET'])
@jwt_required()
@role_required(['mama_mboga'])
def repayment_history():
    try:
        user_id = get_jwt_identity().split(':')[0]
        repayments = Repayment.query.filter_by(user_id=user_id).order_by(Repayment.paid_at.desc()).all()

        return jsonify([
            {
                "loan_id": r.loan_id,
                "amount_paid": r.amount_paid,
                "paid_at": r.paid_at.strftime("%Y-%m-%d %H:%M:%S"),
                "mpesa_code": r.mpesa_code
            }
            for r in repayments
        ]), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Server error: {str(e)}'}, 500)
    
# lender and admin see all linked repayments
@repayment_bp.route('/admin/repayments', methods=['GET'])
@jwt_required()
@role_required(['lender', 'admin'])
def all_repayments_made():
    """
    admins can see all repayments but lenders see their assigned users' repayments only
    """
    try:
        identity = get_jwt_identity()
        user_id, role = identity.split(':')
        
        if role == 'admin':
            repayments = Repayment.query.join(User).order_by(Repayment.paid_at.desc()).all()
        else:
            repayments = (
                Repayment.query.join(User)
                .filter(User.lender_id == user_id)
                .order_by(Repayment.paid_at.desc()).all()
            )
            
        return jsonify([
            {
                "user": r.user.name,
                "phone": r.user.phone,
                "loan_id": r.loan_id,
                "amount_paid": r.amount_paid,
                "paid_at": r.paid_at.strftime("%Y-%m-%d %H:%M:%S"),
                "mpesa_code": r.mpesa_code
            }
            for r in repayments
        ]), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to fetch repayments', 'message': str(e)}), 500
    


