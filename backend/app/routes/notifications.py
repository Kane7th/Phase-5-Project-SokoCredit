from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.notification import Notification
from app.models.user import User
from app.extensions import db
from app import socketio
from flask_socketio import emit
from datetime import datetime

notifications_bp = Blueprint("notifications", __name__, url_prefix="/api/users/notifications")

# Helper to extract user_id from identity
def extract_user_id(identity):
    """
    Handles formats like:
    - "9:customer"
    - "9:admin"
    - 9 (int)
    """
    if isinstance(identity, int):
        return identity
    if isinstance(identity, str) and ":" in identity:
        try:
            return int(identity.split(":")[0])
        except (IndexError, ValueError):
            return None
    return None

# GET /unread-count
@notifications_bp.route("/unread-count", methods=["GET"])
@jwt_required()
def unread_count():
    user_id = extract_user_id(get_jwt_identity())
    count = Notification.get_unread_count_for_user(user_id)
    return jsonify({"unread_count": count}), 200


# PUT /mark-all-read
@notifications_bp.route("/mark-all-read", methods=["PUT"])
@jwt_required()
def mark_all_read():
    user_id = extract_user_id(get_jwt_identity())
    Notification.mark_all_as_read_for_user(user_id)
    return jsonify({"message": "All notifications marked as read"}), 200


# POST /<notification_id>/restore
@notifications_bp.route("/<int:notification_id>/restore", methods=["POST"])
@jwt_required()
def restore_notification(notification_id):
    user_id = extract_user_id(get_jwt_identity())
    notif = Notification.query.filter_by(id=notification_id, user_id=user_id).first()
    if not notif:
        return jsonify({"error": "Notification not found"}), 404
    notif.restore()
    return jsonify({"message": "Notification restored"}), 200


# GET /search (advanced filtering)
@notifications_bp.route("/search", methods=["GET"])
@jwt_required()
def search_notifications():
    user_id = extract_user_id(get_jwt_identity())

    read_param = request.args.get("read")
    keyword = request.args.get("keyword")
    date = request.args.get("date")
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))

    results = []

    if date:
        try:
            date_obj = datetime.strptime(date, "%Y-%m-%d").date()
            results = Notification.get_notifications_by_date(user_id, date_obj, page, per_page)
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    elif start_date and end_date:
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d").date()
            end = datetime.strptime(end_date, "%Y-%m-%d").date()
            results = Notification.get_notifications_by_date_range(user_id, start, end, page, per_page)
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    elif keyword:
        results = Notification.get_notifications_by_keyword(user_id, keyword, page, per_page)

    elif read_param is not None:
        if read_param.lower() == "true":
            results = Notification.get_notifications_by_read_status(user_id, True, page, per_page)
        elif read_param.lower() == "false":
            results = Notification.get_notifications_by_read_status(user_id, False, page, per_page)
        else:
            return jsonify({"error": "Invalid read value. Use true or false"}), 400
    else:
        # Fallback to basic fetch with pagination
        results = Notification.get_notifications_for_user(user_id, page, per_page)

    return jsonify([r.to_dict() for r in results]), 200

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
    raw_identity = get_jwt_identity()
    user_id = extract_user_id(raw_identity)

    if not user_id:
        return jsonify({"error": "Invalid user identity"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": f"User {user_id} does not exist"}), 404

    data = request.get_json()
    message = data.get("message", "🔔 Test notification")

    notif = Notification.create_notification(user_id=user_id, message=message)

    # Emit real-time notification
    socketio.emit(
        f"notification:{user_id}",
        notif.to_dict(),
        namespace="/notifications"
    )

    return jsonify(notif.to_dict()), 201
