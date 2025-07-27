from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import re

from .stk_push import send_stk_push
from utils.decorators import role_required
from app.models import User, Loan
from app.extensions import db

mpesa_bp = Blueprint('mpesa', __name__, url_prefix='/mpesa')

@mpesa_bp.route('/stk-push', methods=['POST'])
@jwt_required()
@role_required('mama_mboga')
def stk_push():
    
    # get authenticated user
    user_id = int(get_jwt_identity().split(':')[0])
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'No customer profile found.'}), 404

    # parse and validate data -> constraint phone no.'s format
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON received"}), 400

    phone_number = data.get('phone')
    amount = data.get('amount') 
    if not phone_number or not amount:
        return jsonify({'error': 'phone number and amount are required'}), 400
    
    phone = re.sub(r'\D', '', phone_number)
    if phone.startswith('0'):
        phone = '254' + phone[1:]
    elif phone.startswith('+'):
        phone = phone[1:]
    
    if not phone.startswith('254') or len(phone) != 12:
        return jsonify({'error': 'Invalid phone number format. Use 2547xxxxxxxx'}), 400
        
    try:
        result = send_stk_push(phone_number, int(amount))
        return jsonify({
            "message": 'Payment initiated. Check your phone to approve the payment.',
            "mpesa_response": result    
            }), 200
    except Exception as e: 
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
