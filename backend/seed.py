from app.extensions import db
from app import create_app
from app.models import User, Customer, Loan, Repayment
from datetime import datetime, timedelta

app = create_app()

with app.app_context():
    print("Seeding data...")

    # Clear existing data
    Repayment.query.delete()
    Loan.query.delete()
    Customer.query.delete()
    User.query.delete()

    # Create Users
    admin = User(username='admin', role='admin')
    admin.set_password('admin123')

    lender = User(username='lender1', role='lender')
    lender.set_password('lender123')

    mamamboga_user = User(username='mama_fatuma', role='mamamboga')
    mamamboga_user.set_password('fatuma123')

    db.session.add_all([admin, lender, mamamboga_user])
    db.session.commit()

    # Create Customer profile for mamamboga
    customer = Customer(
        full_name='Fatuma Hassan',
        created_by=mamamboga_user.id,
        phone='0712345678',
        location='Gikomba, Nairobi',
        business_name='Fatuma Veggies',
        documents={
            "id_card": "id_doc.jpg",
            "shop_photo": "shop_photo.jpg"
        },
    )
    db.session.add(customer)
    db.session.commit()

    # Create a Loan for mamamboga
    loan = Loan(
        borrower_id=mamamboga_user.id,
        lender_id=lender.id,
        amount=15000,
        interest_rate=12.5,
        duration_months=6,
        status='active',
        issued_date=datetime.utcnow(),
    )
    db.session.add(loan)
    db.session.commit()

    # Create Repayments for the loan
    repayment1 = Repayment(
        loan_id=loan.id,
        amount_paid=3000,
        payment_date=datetime.utcnow(),
    )
    repayment2 = Repayment(
        loan_id=loan.id,
        amount_paid=3000,
        payment_date=datetime.utcnow() + timedelta(days=30),
    )
    db.session.add_all([repayment1, repayment2])
    db.session.commit()

    print("Seed data added successfully.")
