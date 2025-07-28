from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.notification import Notification
from app.models.user import User
from app.extensions import db
from app import socketio
from flask_socketio import emit

notifications_bp = Blueprint("notifications", __name__, url_prefix="/api/users/notifications")

# Helper to extract user_id from identity
def extract_user_id(identity):
    """
    Handles formats like:
    - "user_9"
    - "user_9:admin"
    - 9 (int)
    """
    if isinstance(identity, int):
        return identity
    if isinstance(identity, str) and identity.startswith("user_"):
        try:
            return int(identity.split("_")[1].split(":")[0])
        except (IndexError, ValueError):
            return None
    return None

# GET all notifications for current user
@notifications_bp.route("/", methods=["GET"])
@jwt_required()
def get_notifications():
    raw_identity = get_jwt_identity()
    user_id = extract_user_id(raw_identity)
    if not user_id:
        return jsonify({"error": "Invalid identity format"}), 400

    notifications = Notification.get_notifications_for_user(user_id)
    return jsonify([n.to_dict() for n in notifications]), 200

# PUT mark a notification as read
@notifications_bp.route("/<int:notification_id>/read", methods=["PUT"])
@jwt_required()
def mark_read(notification_id):
    raw_identity = get_jwt_identity()
    user_id = extract_user_id(raw_identity)
    if not user_id:
        return jsonify({"error": "Invalid identity format"}), 400

    notif = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
    if not notif:
        return jsonify({"error": "Notification not found"}), 404

    notif.mark_as_read()
    return jsonify({"message": "Marked as read"}), 200

# DELETE a notification
@notifications_bp.route("/<int:notification_id>", methods=["DELETE"])
@jwt_required()
def delete_notification(notification_id):
    raw_identity = get_jwt_identity()
    user_id = extract_user_id(raw_identity)
    if not user_id:
        return jsonify({"error": "Invalid identity format"}), 400

    notif = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
    if not notif:
        return jsonify({"error": "Notification not found"}), 404

    db.session.delete(notif)
    db.session.commit()
    return jsonify({"message": "Notification deleted"}), 200

# POST create a test notification (for development purposes)
@notifications_bp.route("/create-test", methods=["POST"])
@jwt_required()
def create_test_notification():
    identity = get_jwt_identity()

    # Extract user_id
    if isinstance(identity, str) and identity.startswith("user_"):
        user_id = int(identity.split("_")[1].split(":")[0])
    elif isinstance(identity, int):
        user_id = identity
    else:
        return jsonify({"error": "Invalid user identity"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": f"User {user_id} does not exist"}), 404

    data = request.get_json()
    message = data.get("message", "🔔 Test notification")

    notif = Notification.create_notification(user_id=user_id, message=message)

    # 🔥 Emit the event to the user room
    socketio.emit(
        f"notification:{user_id}", 
        notif.to_dict(),
        namespace="/notifications"
    )

    return jsonify(notif.to_dict()), 201