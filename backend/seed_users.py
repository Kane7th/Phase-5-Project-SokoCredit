from app import create_app
from app.extensions import db
from app.models.user import User

app = create_app()

with app.app_context():
    users = [
        {"phone": "0700000001", "email": "admin@sokocredit.com", "role": "admin"},
        {"phone": "0700000002", "email": "lender1@sokocredit.com", "role": "lender"},
        {"phone": "0700000003", "email": "mama1@sokocredit.com", "role": "mama_mboga"},
    ]

    created = []
    skipped = []

    for u in users:
        existing = User.query.filter_by(phone=u["phone"]).first()
        if existing:
            skipped.append(u["phone"])
        else:
            user = User(phone=u["phone"], email=u["email"], role=u["role"])
            user.set_password("password")
            db.session.add(user)
            created.append(u["phone"])

    db.session.commit()

    if created:
        print(f"✅ Created users: {', '.join(created)}")
    if skipped:
        print(f"⚠️  Skipped (already exist): {', '.join(skipped)}")


# Using phone

#  "credential": "0700000001",
#  "password": "password"

# Or using email

#  "credential": "admin@sokocredit.com",
#  "password": "password"
