from flask import Blueprint, request, jsonify, abort
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Loan, User, RepaymentSchedule
from utils.decorators import role_required
from datetime import datetime, timedelta
from sqlalchemy.exc import SQLAlchemyError

loan_bp = Blueprint('loan_bp', __name__, url_prefix='/loans')

#USER can apply for loan
@loan_bp.route('', methods=['POST'])
@jwt_required()
@role_required('mama_mboga')
def apply_loan():
    try:
        data = request.get_json()
        amount = data.get('amount')
        interest = data.get('interest_rate')
        duration = data.get('duration_months')
        
        if not all([amount, interest, duration]):
            return jsonify({'error': 'Missing required fields: amount, interest_rate, duration_months'}), 400
        
        if not isinstance(amount, (int, float)) or amount <=0:
            return jsonify({'error': 'Loan amount must be a positive number.'}), 400
        
        if not isinstance(duration, int) or duration <=0:
            return jsonify({'error': 'Duration must be a positive number.'}), 400
        
        borrower_id = get_jwt_identity()
        
        lender = User.query.filter_by(role='lender').first()
        if not lender:
            return jsonify({'error': 'No available lender'})
        
        new_loan = Loan(
            amount=amount,
            interest_rate=interest,
            duration_months=duration,
            borrower_id=borrower_id,
            status='pending'
        )
        db.session.add(new_loan)
        db.session.commit()
        
        return jsonify(new_loan.to_dict()), 201
    
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': 'Database error', 'details': str(e)}), 500    
    except Exception as e:
        return jsonify({'error': 'Unexpected error', 'details': str(e)}), 500 