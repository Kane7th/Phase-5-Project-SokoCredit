from app import create_app
from app.extensions import db
from app.models import User, Customer, Loan, Repayment, LoanProduct, RepaymentSchedule, Notification
from datetime import datetime, timedelta, timezone
import random

app = create_app()

with app.app_context():
    print("\n🧹 Clearing previous data...\n")

    Repayment.query.delete()
    RepaymentSchedule.query.delete()
    Loan.query.delete()
    LoanProduct.query.delete()
    Customer.query.delete()
    Notification.query.delete()
    User.query.delete()
    db.session.commit()

    print("✅ Cleared Repayments, Schedules, Loans, Customers, Notifications, and Users.\n")

    print("👤 Seeding users...")

    users = [
        User(username="Admin", phone="0700000001", email="admin@sokocredit.com", role="admin"),
        User(username="Lender One", phone="0700000002", email="lender1@sokocredit.com", role="lender"),
        User(username="Lender Two", phone="0700000004", email="lender2@sokocredit.com", role="lender"),
        User(username="Mama Mboga One", phone="0700000003", email="mama1@sokocredit.com", role="mama_mboga"),
        User(username="Mama Mboga Two", phone="0700000005", email="mama2@sokocredit.com", role="mama_mboga")
    ]
    for u in users:
        u.set_password("password")
        db.session.add(u)
    db.session.commit()

    print("✅ Users created. (Default password: 'password')\n")

    print("📬 Seeding notifications...")
    def generate_notifications(user):
        messages = [
            f"📢 Welcome {user.username} to SokoCredit!",
            "✅ Your account has been verified.",
            "📨 New loan request received.",
            "💡 Tip: Build your profile to get better loans.",
        ]
        for msg in messages:
            n = Notification(
                user_id=user.id,
                message=msg,
                read=random.choice([True, False]),
                created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(0, 10))
            )
            db.session.add(n)
    for user in users:
        generate_notifications(user)
    db.session.commit()

    print("✅ Notifications seeded.\n")

    print("👩🏾 Seeding customer profiles...")

    customers = [
        Customer(
            full_name='Fatuma Hassan',
            phone='0712345678',
            location='Gikomba, Nairobi',
            business_name='Fatuma Veggies',
            documents={"id_card": "id_doc1.jpg", "shop_photo": "shop1.jpg"},
            created_by=users[3].id
        ),
        Customer(
            full_name='Amina Yusuf',
            phone='0722345678',
            location='Kawangware, Nairobi',
            business_name='Amina Fruits',
            documents={"id_card": "id_doc2.jpg", "shop_photo": "shop2.jpg"},
            created_by=users[4].id
        )
    ]
    db.session.add_all(customers)
    db.session.commit()

    print("✅ Customers created.\n")

    print("💼 Seeding loan products...")

    loan_products = [
        LoanProduct(
            name='Starter Business Loan',
            description='Supports small-scale vendors with fast loans.',
            interest_rate=12.5,
            duration_months=6,
            max_amount=20000,
            frequency='monthly',
        ),
        LoanProduct(
            name='Growth Booster Loan',
            description='Ideal for expanding businesses.',
            interest_rate=10.0,
            duration_months=12,
            max_amount=50000,
            frequency='monthly',
        )
    ]
    db.session.add_all(loan_products)
    db.session.commit()

    print("✅ Loan products created.\n")

    print("💰 Seeding loans, repayment schedules and repayments...")

    def seed_loan(borrower_user, customer_obj, loan_product, lender_user):
        issued_date = datetime.now(timezone.utc) - timedelta(days=random.randint(0, 20))
        loan = Loan(
            borrower_id=borrower_user.id,
            lender_id=lender_user.id,
            amount=random.randint(10000, int(loan_product.max_amount)),
            interest_rate=loan_product.interest_rate,
            duration_months=loan_product.duration_months,
            status=random.choice(['disbursed', 'approved']),
            issued_date=issued_date,
            approved_date=issued_date - timedelta(days=1),
            disbursed_date=issued_date,
            loan_product_id=loan_product.id
        )
        db.session.add(loan)
        db.session.commit()

        # Generate 3 repayment schedules per loan
        schedules = []
        for i in range(3):
            due = issued_date + timedelta(days=30 * (i + 1))
            schedules.append(RepaymentSchedule(
                loan_id=loan.id,
                due_date=due,
                amount_due=round(loan.amount / 3, 2),
                status=random.choice(['unpaid', 'partial', 'paid'])
            ))
        db.session.add_all(schedules)
        db.session.commit()

        # Generate 1-2 repayments per loan
        for sched in schedules[:2]:
            repayment = Repayment(
                loan_id=loan.id,
                user_id=borrower_user.id,
                schedule_id=sched.id,
                mpesa_code=f"MPESA{random.randint(100000,999999)}",
                amount_paid=round(sched.amount_due * random.uniform(0.5, 1.0), 2),
                paid_at=sched.due_date - timedelta(days=random.randint(0, 10))
            )
            db.session.add(repayment)
        db.session.commit()

    seed_loan(users[3], customers[0], loan_products[0], users[1])  # Mama Mboga One + Lender One
    seed_loan(users[4], customers[1], loan_products[1], users[2])  # Mama Mboga Two + Lender Two

    print("✅ Loans, schedules, and repayments seeded.\n")

    print("🎉 All seed data added successfully.\n")
