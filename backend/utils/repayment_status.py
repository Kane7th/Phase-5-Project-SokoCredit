from app.models import RepaymentSchedule
from app.models import RepaymentSchedule
from app.extensions import db
from app.models.repaymentSchedule import RepaymentStatus
from app.models.loan_products import RepaymentFrequencies
from app.models.loan import LoanStatus
from datetime import timedelta
from datetime import datetime

def update_schedule_status(schedule_id):
    
    schedule = RepaymentSchedule.query.get(schedule_id)
    if not schedule:
        raise ValueError(f"RepaymentSchedule with id {schedule_id} not found.")

    total_paid = sum(r.amount_paid for r in schedule.repayments)

    due = schedule.amount_due

    if total_paid <= 0:
        schedule.status = RepaymentStatus.UNPAID
    elif 0 < total_paid < due:
        schedule.status = RepaymentStatus.PARTIAL
    else:
        schedule.status = RepaymentStatus.PAID
    
    db.session.add(schedule)
    # db.session.commit()
    return schedule.status

def generate_repayment_schedule(loan):
    
    if loan.status != LoanStatus.disbursed:
        raise ValueError("Repayment schedule can only be generated for disbursed loans.")

    disbursed_date = loan.disbursed_date or datetime.utcnow()

    # Step 1: Compute total amount + interest
    principal = loan.amount
    interest_rate = loan.interest_rate / 100
    total_repayable = principal + (principal * interest_rate)

    frequency = loan.loan_product.frequency
    duration_months = loan.duration_months

    # Step 2: Determine number of installments + interval
    if frequency == RepaymentFrequencies.daily:
        num_payments = int(duration_months * 30)
        interval = timedelta(days=1)
    elif frequency == RepaymentFrequencies.weekly:
        num_payments = int(duration_months * 4)
        interval = timedelta(weeks=1)
    elif frequency == RepaymentFrequencies.monthly:
        num_payments = int(duration_months)
        interval = timedelta(days=30)
    else:
        raise ValueError("Unsupported repayment frequency.")

    if num_payments == 0:
        raise ValueError("Cannot create schedule for 0 installments.")

    # Step 3: Round off and divide
    installment_amount = round(total_repayable / num_payments, 2)
    schedules = []

    for i in range(num_payments):
        due_date = disbursed_date + (interval * (i + 1))
        schedule = RepaymentSchedule(
            loan_id=loan.id,
            due_date=due_date,
            amount_due=installment_amount,
            status=RepaymentStatus.UNPAID
        )
        db.session.add(schedule)
        schedules.append(schedule)

    return schedules  # commit later