from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import User, Loan, Repayment
from app.models.loan import LoanStatus
from datetime import datetime

callback_bp = Blueprint('callback_bp', __name__, url_prefix='/mpesa-callback')

@callback_bp.route('/stk', methods=['POST'])
def mpesa_stk_callback():
    data = request.get_json()
    print("Received callback:", data)
    
    try:
        # extract body safely
        body = data.get('Body', {}).get('stkCallback', {})
        result_code = body.get('ResultCode')
        
        # only proceed if a transaction is successful
        if result_code == 0:
            metadata = body.get('CallbackMetadata', {}).get('Item', [])
            
            def get_item(name):
                for item in metadata:
                    if item['Name'] == name:
                        return item.get('Value')
                    
            receipt = get_item('MpesaReceiptNumber')
            amount = get_item('Amount')
            phone = str(get_item('PhoneNumber'))
            transaction_date = str(get_item('TransactionDate'))
            paid_at = datetime.strptime(transaction_date, "%Y%m%d%H%M%S")
            
            # normalize phone number format
            if phone.startswith('0'):
                phone = '254' + phone[1:]
            elif phone.startswith('+'):
                phone = phone[1:]
            
            # check if the payment was already recorded
            if Repayment.query.filter_by(mpesa_code = receipt).first():
                return jsonify({'message': 'Payment already recorded'}), 200
                
            user = User.query.filter(User.phone == phone).first()
            if not user:
                return jsonify({"message": "User not found"}), 404

            # Try find the latest unpaid but approved loan for the user
            loan = Loan.query.filter(
                    Loan.user_id == user.id,
                    Loan.status == LoanStatus.approved
                ).order_by(Loan.created_at.desc()).first()
            if not loan:
                return jsonify({"message": "Loan not found"}), 404

            # Save the repayment
            repayment = Repayment(
                user_id=user.id,
                loan_id=loan.id,
                amount_paid=amount,
                paid_at=paid_at,
                mpesa_code=receipt
            )

            db.session.add(repayment)
            db.session.commit()

            return jsonify({"message": "Repayment recorded"}), 200
        else:
            print("STK push failed:", body.get('ResultDesc'))
            return jsonify({"message": "Transaction not successful"}), 400

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Server error", "message": str(e)}), 500
        
        