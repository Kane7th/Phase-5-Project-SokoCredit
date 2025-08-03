from app.models.loan import LoanStatus
from app.models import Loan
from app.extensions import db
from app.models.repaymentSchedule import RepaymentStatus
from datetime import datetime

def update_loan_status(loan_id):
    loan = Loan.query.get(loan_id)

    if not loan:
        raise ValueError(f"Loan with id {loan_id} not found.")

    schedules = loan.repayment_schedules
    all_paid = all(s.status == RepaymentStatus.PAID for s in schedules)
    any_paid = any(s.status != RepaymentStatus.UNPAID for s in schedules)
    overdue = any(s.due_date < datetime.utcnow() and s.status != RepaymentStatus.PAID for s in schedules)

    if all_paid:
        loan.status = LoanStatus.completed
    elif overdue:
        loan.status = LoanStatus.overdue
    elif any_paid:
        loan.status = LoanStatus.disbursed  
    else:
        loan.status = LoanStatus.disbursed  # Loan has been disbursed but no payment yet
    db.session.add(loan)
    db.session.commit()
    return loan.status

def update_loan_amount_paid(loan_id):
    loan = Loan.query.get(loan_id)

    if not loan:
        raise ValueError(f"Loan with id {loan_id} not found.")
    
    total_paid = 0
    for schedule in loan.repayment_schedules:
        for r in schedule.repayments:
            total_paid += r.amount_paid
    loan.amount_paid = total_paid
    db.session.add(loan)
    db.session.commit()
    return total_paid
