import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.extensions import db
from app.models.customer import Customer
from app.models.user import User
from app import create_app

def create_customer_profiles():
    app = create_app()
    with app.app_context():
        users = User.query.filter(User.role == 'customer').all()
        for user in users:
            existing_customer = Customer.query.filter_by(customer_user_id=user.id).first()
            if not existing_customer:
                # Check if any customer has empty phone to avoid UNIQUE constraint error
                phone_exists = Customer.query.filter(Customer.phone == '').first()
                if phone_exists:
                    print(f"Skipping user {user.id} ({user.username}) due to existing empty phone")
                    continue
                customer = Customer(
                    full_name=user.username,
                    phone='',
                    business_name='',
                    location='',
                    documents={},
                    created_by=user.id,
                    customer_user_id=user.id
                )
                db.session.add(customer)
                print(f"Created customer profile for user {user.id} ({user.username})")
        db.session.commit()
        print("Customer profile creation complete.")

if __name__ == "__main__":
    create_customer_profiles()
