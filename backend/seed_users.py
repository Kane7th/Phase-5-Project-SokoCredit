from app import create_app
from app.extensions import db
from app.models.user import User

app = create_app()

with app.app_context():
    users = [
        {
            "username": "Admin",
            "phone": "0700000001",
            "email": "admin@sokocredit.com",
            "role": "admin"
        },
        {
            "username": "Lender One",
            "phone": "0700000002",
            "email": "lender1@sokocredit.com",
            "role": "lender"
        },
        {
            "username": "Mama Mboga One",
            "phone": "0700000003",
            "email": "mama1@sokocredit.com",
            "role": "mama_mboga"
        },
    ]

    created = []
    skipped = []

    for u in users:
        existing = User.query.filter(
            (User.phone == u["phone"]) | (User.email == u["email"])
        ).first()

        if existing:
            skipped.append(u)
        else:
            user = User(
                username=u["username"],
                phone=u["phone"],
                email=u["email"],
                role=u["role"]
            )
            user.set_password("password")
            db.session.add(user)
            created.append(u)

    db.session.commit()

    print("\n--- 🧪 SokoCredit Test Users ---\n")

    if created:
        print("✅ Created Users:")
        for u in created:
            print(f"  👤 {u['role'].title()}: {u['email']} / password")
    else:
        print("✅ No new users created.")

    if skipped:
        print("\n⚠️ Skipped (already exist):")
        for u in skipped:
            print(f"  🔁 {u['role'].title()}: {u['email']}")

    print("\n📝 Default password for all users: 'password'\n")
