from app.extensions import socketio, db
from flask_socketio import emit
from app.models import Notification
from datetime import datetime


def send_notification_to_user(user_id, title, message, type_="general"):
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type_,
        created_at=datetime.utcnow(),
        read=False
    )
    db.session.add(notif)
    db.session.commit()

    socketio.emit(
        "notification",
        {
            "id": notif.id,
            "title": title,
            "message": message,
            "type": type_,
            "created_at": notif.created_at.isoformat(),
        },
        to=f"user_{user_id}",
        namespace="/notifications"
    )


def send_notification_to_role(role, title, message, type_="broadcast"):
    # For persistence, this example sends to ALL users with that role in DB
    from app.models import User  # or your user model
    users = User.query.filter_by(role=role).all()

    for user in users:
        send_notification_to_user(user.id, title, message, type_)

    # For real-time, still blast to role room
    socketio.emit(
        "notification",
        {
            "title": title,
            "message": message,
            "type": type_,
            "created_at": datetime.utcnow().isoformat()
        },
        to=f"role_{role}",
        namespace="/notifications"
    )
