from app.extensions import db
from app import create_app
from app.models.notification import Notification
from app.models.user import User

app = create_app()

with app.app_context():

    # Clear existing data
    print("Seeding data...")
    

    user = User.query.filter_by(username="Admin").first()

    n1 = Notification(user_id=user.id, message="You have a new loan application")
    n2 = Notification(user_id=user.id, message="Loan repayment due tomorrow")

    db.session.add_all([n1, n2])
    db.session.commit()

    print("✅ Seeded test notifications.")