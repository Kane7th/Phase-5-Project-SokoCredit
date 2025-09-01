from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta

from flask_cors import cross_origin

from utils.decorators import role_required
from utils.loan_status import update_loan_status, update_loan_amount_paid
from utils.repayment_status import update_schedule_status, generate_repayment_schedule
from app.extensions import db
from app.models import RepaymentSchedule, Loan, Repayment, LoanProduct, Notification, User
from app.models.repaymentSchedule import RepaymentStatus
from app.models.repayment import PaymentMethod
from utils.sms_service import send_sms

repayment_bp = Blueprint('repayment_bp', __name__, url_prefix="/repayment")

# ------------------ Create a repayment ------------------
@repayment_bp.route('/', methods=['POST'])
@cross_origin()
@jwt_required()
@role_required('customer')
def make_repayment():
    try:
        data = request.get_json() or {}

        loan_id = data.get("loan_id")
        schedule_id = data.get("schedule_id")
        amount_paid = data.get("amount_paid")
        payment_methodtype = (data.get("payment_method") or "").strip().lower()
        reference_code = (data.get("reference_code") or "").strip()

        if not all([loan_id, schedule_id, amount_paid, payment_methodtype]):
            return jsonify({"error": "Missing required fields."}), 400

        try:
            amount_paid = float(amount_paid)
            if amount_paid <= 0:
                return jsonify({"error": "Amount must be greater than 0."}), 400
        except ValueError:
            return jsonify({"error": "Amount must be a valid number."}), 400

        try:
            payment_method = PaymentMethod(payment_methodtype)
        except ValueError:
            return jsonify({"error": "Invalid payment method"}), 400

        if reference_code:
            existing = Repayment.query.filter_by(reference_code=reference_code).first()
            if existing:
                return jsonify({"error": "Duplicate transaction. This reference code already exists."}), 409

        user_id = int(get_jwt_identity().split(':')[0])
        loan = Loan.query.get_or_404(loan_id)
        schedule = RepaymentSchedule.query.get_or_404(schedule_id)

        if loan.customer_id != user_id:
            return jsonify({"error": "You are not authorized to repay this loan."}), 403

        if schedule.loan_id != loan.id:
            return jsonify({"error": "Schedule does not belong to this loan."}), 400

        if schedule.status == RepaymentStatus.PAID:
            return jsonify({"error": "This repayment schedule is already fully paid."}), 400

        repayment = Repayment(
            loan_id=loan_id,
            schedule_id=schedule_id,
            customer_id=user_id,
            payment_method=payment_method,
            amount_paid=amount_paid,
            reference_code=reference_code,
            mpesa_code=reference_code if payment_method == PaymentMethod.mpesa else None,
            paypal_txn_id=reference_code if payment_method == PaymentMethod.paypal else None,
        )
        db.session.add(repayment)
        db.session.flush()

        # Update rollups & statuses
        update_schedule_status(schedule_id)
        update_loan_status(loan_id)
        update_loan_amount_paid(loan_id)

        # Notify borrower
        Notification.create_notification(
            user_id=user_id,
            message=f"Your repayment of KES {amount_paid:.2f} for Loan #{loan.id} was received."
        )
        customer = User.query.get(user_id)
        if customer and customer.phone:
            send_sms(customer.phone, f"SokoCredit: You paid KES {amount_paid:.2f} towards Loan #{loan.id}.")

        # Notify lender
        if loan.lender_id:
            Notification.create_notification(
                user_id=loan.lender_id,
                message=f"Customer #{user_id} made a repayment of KES {amount_paid:.2f} on Loan #{loan.id}."
            )
            lender = User.query.get(loan.lender_id)
            if lender and lender.phone:
                send_sms(lender.phone, f"SokoCredit: Customer #{user_id} repaid KES {amount_paid:.2f} on Loan #{loan.id}.")

        db.session.commit()

        return jsonify({
            "message": "Repayment recorded.",
            "status": schedule.status.value if schedule.status else None
        }), 201

    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Repayment failed: {e}")
        return jsonify({"error": "An unexpected error occurred while processing the repayment."}), 500


# ------------------ View my upcoming schedules (customer) ------------------
@repayment_bp.route('/schedules', methods=['GET'])
@cross_origin()
@jwt_required()
@role_required('customer')
def view_my_schedules():
    try:
        user_id = int(get_jwt_identity().split(':')[0])
        schedules = (
            RepaymentSchedule.query.join(Loan)
            .filter(Loan.customer_id == user_id)
            .order_by(RepaymentSchedule.due_date.asc())
            .all()
        )

        result = []
        now = datetime.utcnow()
        for sched in schedules:
            due_soon = sched.due_date.date() == (now.date() + timedelta(days=1))
            overdue = (sched.due_date < now) and (sched.status != RepaymentStatus.PAID)

            # Gentle nudges
            if overdue:
                Notification.create_notification(
                    user_id=user_id,
                    message=f"Your repayment for Loan #{sched.loan_id} scheduled on {sched.due_date.date()} is overdue."
                )
                customer = User.query.get(user_id)
                if customer and customer.phone:
                    send_sms(customer.phone, f"SokoCredit: Loan #{sched.loan_id} repayment is overdue.")
            elif due_soon:
                Notification.create_notification(
                    user_id=user_id,
                    message=f"Reminder: Your repayment for Loan #{sched.loan_id} is due tomorrow."
                )
                customer = User.query.get(user_id)
                if customer and customer.phone:
                    send_sms(customer.phone, f"SokoCredit: Reminder — Loan #{sched.loan_id} repayment is due tomorrow.")

            result.append({
                "id": sched.id,
                "loan_id": sched.loan_id,
                "due_date": sched.due_date.isoformat() if sched.due_date else None,
                "amount_due": sched.amount_due,
                "status": sched.status.value if sched.status else None,
                "amount_paid": float(sum((r.amount_paid or 0) for r in getattr(sched, "repayments", [])))
            })

        return jsonify(result), 200
    except Exception as e:
        print("Error viewing schedules:", e)
        return jsonify({"error": "Something went wrong while fetching schedules."}), 500


# ------------------ View repayments (role scoped) ------------------
@repayment_bp.route('', methods=['GET'])
@cross_origin()
@jwt_required()
@role_required(['customer', 'lender', 'admin'])
def view_loan_repayments():
    try:
        identity = get_jwt_identity()
        user_id_str, role = identity.split(':')
        user_id = int(user_id_str)

        if role == 'customer':
            repayments = Repayment.query.filter_by(customer_id=user_id).order_by(Repayment.paid_at.desc()).all()
        elif role == 'lender':
            products = LoanProduct.query.filter_by(lender_id=user_id).all()
            product_ids = [p.id for p in products]
            loans = Loan.query.filter(Loan.loan_product_id.in_(product_ids)).all()
            loan_ids = [l.id for l in loans]
            repayments = Repayment.query.filter(Repayment.loan_id.in_(loan_ids)).order_by(Repayment.paid_at.desc()).all()
        elif role == 'admin':
            repayments = Repayment.query.order_by(Repayment.paid_at.desc()).all()
        else:
            return jsonify({'error': 'Invalid role'}), 403

        result = []
        for r in repayments:
            result.append({
                "id": r.id,
                "loan_id": r.loan_id,
                "schedule_id": r.schedule_id,
                "customer_id": r.customer_id,
                "amount_paid": r.amount_paid,
                "payment_method": r.payment_method.value if r.payment_method else None,
                "reference_code": r.reference_code,
                "paid_at": r.paid_at.isoformat() if r.paid_at else None
            })
        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': 'Failed to fetch repayments', 'message': str(e)}), 500


# ------------------ CORS preflight helpers ------------------
@repayment_bp.route('', methods=['OPTIONS'])
@cross_origin()
def repayments_options():
    return '', 204

@repayment_bp.route('/schedules', methods=['OPTIONS'])
@cross_origin()
def schedules_options():
    return '', 204
