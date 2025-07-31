from app.models.loan import LoanStatus
from app.models.repaymentSchedule import RepaymentStatus
from datetime import datetime

def update_loan_status(loan):
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


