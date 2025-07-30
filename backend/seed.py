from datetime import datetime, timedelta
import random
from app import create_app
from app.extensions import db
from app.models import User, LoanProduct, Loan, RepaymentSchedule, Repayment
from app.models.loan import LoanStatus
from app.models.repaymentSchedule import RepaymentStatus
from app.models.loan_products import RepaymentFrequencies
from utils.loan_status import update_loan_status

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()

    # USERS
    admin = User(first_name='System', last_name='Admin', phone='0700000000', username="admin", email="admin@example.com", role="admin")
    admin.set_password("adminpass")

    lender1 = User(first_name='Lenny', last_name='Lender', phone='0701111111', username="lender1", email="lender1@example.com", role="lender")
    lender1.set_password("lenderpass")

    customer1 = User(first_name='Mary', last_name='Njeri', phone='0702222222', username="mama_mary", email="mary@example.com", role="customer")
    customer1.set_password("marypass")

    customer2 = User(first_name='Jane', last_name='Wambui', phone='0703333333', username="mama_jane", email="jane@example.com", role="customer")
    customer2.set_password("janepass")

    db.session.add_all([admin, lender1, customer1, customer2])
    db.session.commit()

    # LOAN PRODUCTS
    product1 = LoanProduct(
        name="Biashara Boost", interest_rate=10,
        description="For growing small businesses",
        duration_months=6, max_amount=50000,
        frequency=RepaymentFrequencies.monthly
    )
    product2 = LoanProduct(
        name="MamaFund", interest_rate=5,
        description="Support for women entrepreneurs",
        duration_months=3, max_amount=20000,
        frequency=RepaymentFrequencies.weekly
    )

    db.session.add_all([product1, product2])
    db.session.commit()

    # LOANS
    loans = [
        Loan(
            amount=15000,
            interest_rate=5,
            duration_months=3,
            status=LoanStatus.disbursed,
            approved_date=datetime.now() - timedelta(days=110),
            disbursed_date=datetime.now() - timedelta(days=100),
            issued_date=datetime.now() - timedelta(days=100),
            customer_id=customer1.id,
            lender_id=lender1.id,
            loan_product_id=product2.id,
        ),
        Loan(
            amount=40000,
            interest_rate=10,
            duration_months=6,
            status=LoanStatus.disbursed,
            approved_date=datetime.now() - timedelta(days=110),
            disbursed_date=datetime.now() - timedelta(days=115),
            issued_date=datetime.now() - timedelta(days=115),
            customer_id=customer2.id,
            lender_id=lender1.id,
            loan_product_id=product1.id,
        ),
        Loan(
            amount=18000,
            interest_rate=5,
            duration_months=3,
            status=LoanStatus.pending,
            customer_id=customer2.id,
            lender_id=lender1.id,
            loan_product_id=product2.id,
        ),
    ]

    db.session.add_all(loans)
    db.session.commit()

    # REPAYMENT SCHEDULES & REPAYMENTS
    for loan in loans:
        if loan.status == LoanStatus.disbursed:
            total_due = loan.amount * (1 + loan.interest_rate / 100)
            monthly_due = total_due / loan.duration_months

            for i in range(int(loan.duration_months)):
                due_date = loan.disbursed_date + timedelta(days=(i + 1) * 30)

                # Make loan[0] partially paid (simulate overdue)
                if loan == loans[0]:
                    behavior = "partial" if i == 0 else "unpaid"
                else:
                    behavior = random.choice(["paid", "partial", "unpaid"])

                status = {
                    "paid": RepaymentStatus.PAID,
                    "partial": RepaymentStatus.PARTIAL,
                    "unpaid": RepaymentStatus.UNPAID
                }[behavior]

                schedule = RepaymentSchedule(
                    due_date=due_date,
                    amount_due=monthly_due,
                    loan_id=loan.id,
                    status=status
                )
                db.session.add(schedule)
                db.session.flush()

                if behavior != "unpaid":
                    amount_paid = monthly_due if behavior == "paid" else round(monthly_due * 0.5, 2)
                    repayment = Repayment(
                        amount_paid=amount_paid,
                        customer_id=loan.customer_id,
                        mpesa_code=f"MPESA{random.randint(10000, 99999)}",
                        paid_at=due_date,
                        loan_id=loan.id,
                        schedule_id=schedule.id
                    )
                    db.session.add(repayment)

            # Apply loan status based on payments made
            update_loan_status(loan)

    db.session.commit()
    print("Seed completed using clean loan logic.")
