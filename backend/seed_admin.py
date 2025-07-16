from app import create_app
from app.extensions import db
from app.models.user import User

app = create_app()

with app.app_context():
    existing = User.query.filter_by(username="admin").first()
    if existing:
        print("Admin user already exists.")
    else:
        admin = User(username="admin", role="admin")
        admin.set_password("password")
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin user created: admin / password")
