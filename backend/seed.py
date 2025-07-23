from app.extensions import db
from app import create_app
from app.models import User, Customer, Loan, Repayment, LoanProduct, RepaymentSchedule
from datetime import datetime, timedelta

app = create_app()

with app.app_context():
    print("Seeding data...")

    # Clear existing data
    Repayment.query.delete()
    RepaymentSchedule.query.delete()
    Loan.query.delete()
    LoanProduct.query.delete()
    Customer.query.delete()
    User.query.delete()

    # Create Users
    admin = User(username='admin', role='admin', email='admin@example.com')
    admin.set_password('admin123')

    lender = User(username='lender1', role='lender', email='lender1@example.com')
    lender.set_password('lender123')

    mamamboga_user = User(username='mama_fatuma', role='mama_mboga', phone='0712345678')
    mamamboga_user.set_password('fatuma123')

    db.session.add_all([admin, lender, mamamboga_user])
    db.session.commit()

    # Create Customer profile for mamamboga
    customer = Customer(
        full_name='Fatuma Hassan',
        phone='0712345678',
        location='Gikomba, Nairobi',
        business_name='Fatuma Veggies',
        documents={
            "id_card": "id_doc.jpg",
            "shop_photo": "shop_photo.jpg"
        },
        created_by=mamamboga_user.id,
    )
    db.session.add(customer)
    db.session.commit()

    # Create a LoanProduct (mandatory now)
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

    # Create a Loan for mamamboga
    issued_date = datetime.utcnow()
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

    # Create RepaymentSchedule (2 monthly dues)
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

    # Create Repayments for the loan
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

    print("Seed data added successfully.")
