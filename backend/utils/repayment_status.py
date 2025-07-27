from app.models import RepaymentSchedule
from app.models.repaymentSchedule import RepaymentStatus

def update_schedule_status(schedule: RepaymentSchedule):
    total_paid = sum(r.amount_paid for r in schedule.repayments)

    if total_paid == 0:
        schedule.status = RepaymentStatus.unpaid
    elif total_paid < schedule.amount_due:
        schedule.status = RepaymentStatus.partial
    else:
        schedule.status = RepaymentStatus.paid
