from app import create_app
from app.extensions import db
from app.models.user import User
from app.models.notification import Notification
from datetime import datetime, timedelta, timezone
import random

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

    print("\n🧹 Clearing previously seeded users and notifications...\n")

    # Delete users & notifications if they exist
    emails_to_clear = [u["email"] for u in users]
    users_to_delete = User.query.filter(User.email.in_(emails_to_clear)).all()

    deleted_users = 0
    deleted_notifs = 0

    for user in users_to_delete:
        notif_count = Notification.query.filter_by(user_id=user.id).delete()
        db.session.delete(user)
        deleted_users += 1
        deleted_notifs += notif_count

    db.session.commit()

    print(f"✅ Deleted {deleted_users} users and {deleted_notifs} notifications.\n")

    created = []

    def generate_notifications(user_id, username):
        messages = [
            f"📢 Welcome {username} to SokoCredit!",
            "📨 You received a new loan request.",
            "✅ Your account has been verified.",
            "💡 Tip: Update your profile to get better rates.",
            "⚠️ Action Required: Pending loan application.",
            "🔔 You have unread notifications.",
            "📈 Your credit score improved this week!",
            "💰 Repayment received from a borrower.",
            "📉 A loan defaulted. Take action.",
        ]

        for i, message in enumerate(messages):
            days_ago = random.randint(1, 14)
            created_at = datetime.now(timezone.utc) - timedelta(days=days_ago, hours=random.randint(0, 23))
            read_status = random.choice([True, False])
            n = Notification(
                user_id=user_id,
                message=message,
                read=read_status,
                created_at=created_at
            )
            db.session.add(n)

    # Create fresh users and notifications
    for u in users:
        user = User(
            username=u["username"],
            phone=u["phone"],
            email=u["email"],
            role=u["role"]
        )
        user.set_password("password")
        db.session.add(user)
        db.session.flush()  # Get user.id before commit
        created.append((u, user.id))

    db.session.commit()

    print("\n--- 🧪 Re-seeded Test Users + Notifications ---\n")

    for u, user_id in created:
        print(f"👤 {u['role'].title()}: {u['email']} / password")
        generate_notifications(user_id, u["username"])

    db.session.commit()
    print("\n📬 Seeded 9 notifications per user (read/unread, mixed timestamps)")
    print("\n📝 Default password for all users: 'password'\n")
