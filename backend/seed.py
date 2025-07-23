from app import create_app
from app.extensions import db
from app.models import User, Customer, Loan, Repayment, LoanProduct, RepaymentSchedule, Notification
from datetime import datetime, timedelta, timezone
import random

app = create_app()

with app.app_context():
    print("\n🧹 Clearing previous data...\n")

    # Delete data in dependency-safe order
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

    # Create users
    admin = User(username="Admin", phone="0700000001", email="admin@sokocredit.com", role="admin")
    lender = User(username="Lender One", phone="0700000002", email="lender1@sokocredit.com", role="lender")
    mamamboga_user = User(username="Mama Mboga One", phone="0700000003", email="mama1@sokocredit.com", role="mama_mboga")

    for u in [admin, lender, mamamboga_user]:
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
    for user in [admin, lender, mamamboga_user]:
        generate_notifications(user)
    db.session.commit()

    print("✅ Notifications seeded.\n")

    print("👩🏾 Seeding customer profile for Mama Mboga...")

    customer = Customer(
        full_name='Fatuma Hassan',
        phone='0712345678',
        location='Gikomba, Nairobi',
        business_name='Fatuma Veggies',
        documents={
            "id_card": "id_doc.jpg",
            "shop_photo": "shop_photo.jpg"
        },
        created_by=mamamboga_user.id
    )
    db.session.add(customer)
    db.session.commit()

    print("✅ Customer created.\n")

    print("💼 Seeding loan product...")
    loan_product = LoanProduct(
        name='Starter Business Loan',
        description='Supports small-scale vendors with fast loans.',
        interest_rate=12.5,
        duration_months=6,
        max_amount=20000,
        frequency='monthly',
    )
    db.session.add(loan_product)
    db.session.commit()

    print("✅ Loan product created.\n")

    print("💰 Seeding loan + repayment schedule + repayments...")

    issued_date = datetime.now(timezone.utc)
    loan = Loan(
        borrower_id=mamamboga_user.id,
        lender_id=lender.id,
        amount=15000,
        interest_rate=12.5,
        duration_months=6,
        status='disbursed',
        issued_date=issued_date,
        approved_date=issued_date - timedelta(days=1),
        disbursed_date=issued_date,
        loan_product_id=loan_product.id
    )
    db.session.add(loan)
    db.session.commit()

    # Create repayment schedules
    schedule1 = RepaymentSchedule(
        loan_id=loan.id,
        due_date=issued_date + timedelta(days=30),
        amount_due=3000,
        status='partial'
    )
    schedule2 = RepaymentSchedule(
        loan_id=loan.id,
        due_date=issued_date + timedelta(days=60),
        amount_due=3000,
        status='unpaid'
    )
    db.session.add_all([schedule1, schedule2])
    db.session.commit()

    # Create repayments
    repayment1 = Repayment(
        loan_id=loan.id,
        user_id=mamamboga_user.id,
        schedule_id=schedule1.id,
        mpesa_code="MPESA123ABC",
        amount_paid=3000,
        paid_at=issued_date + timedelta(days=5)
    )
    repayment2 = Repayment(
        loan_id=loan.id,
        user_id=mamamboga_user.id,
        schedule_id=schedule2.id,
        mpesa_code="MPESA456DEF",
        amount_paid=1500,
        paid_at=issued_date + timedelta(days=35)
    )
    db.session.add_all([repayment1, repayment2])
    db.session.commit()

    print("✅ Loan, schedules, and repayments seeded.\n")

    print("🎉 All seed data added successfully.\n")
