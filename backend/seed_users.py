from app import create_app
from app.extensions import db
from app.models.user import User

app = create_app()

with app.app_context():
    users = [
        {"username": "admin", "role": "admin"},
        {"username": "lender1", "role": "lender"},
        {"username": "mama1", "role": "mama_mboga"},
    ]

    created = []
    skipped = []

    for u in users:
        existing = User.query.filter_by(username=u["username"]).first()
        if existing:
            skipped.append(u["username"])
        else:
            user = User(username=u["username"], role=u["role"])
            user.set_password("password")
            db.session.add(user)
            created.append(u["username"])

    db.session.commit()

    if created:
        print(f"✅ Created users: {', '.join(created)}")
    if skipped:
        print(f"⚠️  Skipped (already exist): {', '.join(skipped)}")
