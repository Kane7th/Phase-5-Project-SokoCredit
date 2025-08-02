from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from utils.paypal import get_paypal_access_token
from utils.decorators import role_required
from app.models import Loan, Repayment
from app.extensions import db
from app.models.repaymentSchedule import RepaymentSchedule, RepaymentStatus
from app.models.repayment import PaymentMethod
from datetime import datetime
import requests

from flask_cors import cross_origin
paypal_bp = Blueprint('paypal_bp', __name__, url_prefix='/api/paypal')
PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com"

@paypal_bp.route('/create-order', methods=['POST'])
@cross_origin()
@jwt_required()
@role_required('customer')
def create_paypal_order():
    try:
        data = request.get_json()
        
        loan_id = data.get("loan_id")  
        schedule_id = data.get("schedule_id")
        amount = data.get("amount")

        # Basic validation
        if not all([loan_id, schedule_id, amount]):
            return jsonify({"error": "loan_id, schedule_id, and amount are required"}), 400

        # Check if the loan and schedule exist
        loan = Loan.query.get(loan_id)
        schedule = RepaymentSchedule.query.get(schedule_id)

        if not loan or not schedule:
            return jsonify({"error": "Invalid loan_id or schedule_id"}), 404

        # Optionally enforce that the schedule belongs to the loan
        if schedule.loan_id != loan.id:
            return jsonify({"error": "Schedule does not belong to the specified loan"}), 400

        # Get PayPal token
        access_token = get_paypal_access_token()
        ngrok_url = "https://02e75f2ceb5c.ngrok-free.app"    

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }
        # Define payment payload
        payload = {
            "intent": "CAPTURE",
            "purchase_units": [{
                "reference_id": f"loan{loan_id}_schedule{schedule_id}",
                "amount": {
                    "currency_code": "USD",
                    "value": f"{amount:.2f}"
                }
            }],
            "application_context": {
                "return_url": f"{ngrok_url}/paypal/return",
                "cancel_url": f"{ngrok_url}/paypal/cancel"
            }
        }

        # Send request to PayPal
        url = f"{PAYPAL_API_BASE}/v2/checkout/orders"
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()

        # Return PayPal order data
        return jsonify(response.json()), 200
    except Exception as e:
        return jsonify({"error": "Could not create PayPal order", "message": str(e)}), 500


@paypal_bp.route('/capture-order', methods=['POST'])
@cross_origin()
@jwt_required()
@role_required('customer')
def capture_paypal_order():
    try:
        data = request.get_json()
        order_id = data.get("orderID")
        loan_id = data.get("loan_id")
        schedule_id = data.get("schedule_id")

        if not all([order_id, loan_id, schedule_id]):
            return jsonify({"error": "Missing orderID, loan_id, or schedule_id"}), 400

        # Get current user and validate loan and scedule
        current_user_id = int(get_jwt_identity().split(":")[0])
        loan = Loan.query.get_or_404(loan_id)
        schedule = RepaymentSchedule.query.get_or_404(schedule_id)

        if loan.customer_id != current_user_id:
            return jsonify({"error": "You are not authorized to repay this loan"}), 403
        if schedule.loan_id != loan.id:
            return jsonify({"error": "Schedule does not belong to this loan"}), 400
        if schedule.status == RepaymentStatus.PAID:
            return jsonify({"error": "This repayment schedule is already fully paid."}), 400

        #first: Capture the PayPal order
        access_token = get_paypal_access_token()
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }

        url = f"{PAYPAL_API_BASE}/v2/checkout/orders/{order_id}/capture"
        response = requests.post(url, headers=headers)
        result = response.json()

        if response.status_code != 201:
            return jsonify({"error": "Failed to capture PayPal order", "details": result}), 400

        capture_info = result["purchase_units"][0]["payments"]["captures"][0]
        transaction_id = capture_info["id"]
        usd_amount = float(capture_info["amount"]["value"])
        status = capture_info["status"]

        if status != "COMPLETED":
            return jsonify({"error": "Payment not completed"}), 400

        #2: Check for duplicate transaction
        existing = Repayment.query.filter_by(paypal_txn_id=transaction_id).first()
        if existing:
            return jsonify({"error": "This PayPal transaction was already recorded"}), 409

        # Convert USD to KES
        exchange_rate = 145.0 
        kes_amount = usd_amount * exchange_rate

        #  3: Record repayment
        new_repayment = Repayment(
            loan_id=loan_id,
            schedule_id=schedule_id,
            customer_id=current_user_id,
            amount_paid=kes_amount,
            payment_method=PaymentMethod.PAYPAL,
            paypal_txn_id=transaction_id,
            paid_at=datetime.utcnow()
        )
        db.session.add(new_repayment)

        # 4: Update repayment schedule + loan status
        from utils.repayment_status import update_schedule_status
        from utils.loan_status import update_loan_status, update_loan_amount_paid

        update_schedule_status(schedule_id)
        update_loan_amount_paid(loan_id)
        update_loan_status(loan_id)

        db.session.commit()

        return jsonify({
            "message": "Payment captured and recorded successfully",
            "paypal_txn_id": transaction_id,
            "amount_paid_kes": round(kes_amount, 2),
            "amount_paid_usd": usd_amount,
            "payment_method": "paypal"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An error occurred", "message": str(e)}), 500

@paypal_bp.route('/return', methods=['GET'])
@cross_origin()
def paypal_return():
    return "<h3>Payment approved. You may now return to the app and confirm the payment.</h3>", 200

@paypal_bp.route('/cancel', methods=['GET'])
@cross_origin()
def paypal_cancel():
    return "<h3>Payment was cancelled. No charges were made.</h3>", 200

# OPTIONS Preflight Handlers
@paypal_bp.route('/create-order', methods=['OPTIONS'])
@cross_origin()
def paypal_create_options():
    return '', 204

@paypal_bp.route('/capture-order', methods=['OPTIONS'])
@cross_origin()
def paypal_capture_options():
    return '', 204