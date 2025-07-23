from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.notification import Notification
from app.models.user import User
from app.extensions import db

notifications_bp = Blueprint("notifications", __name__, url_prefix="/api/users/notifications")

# GET all notifications for current user
@notifications_bp.route("/", methods=["GET"])
@jwt_required()
def get_notifications():
    current_user_id = get_jwt_identity()
    notifications = Notification.get_notifications_for_user(current_user_id)
    return jsonify([n.to_dict() for n in notifications]), 200

# PUT mark a notification as read
@notifications_bp.route("/<int:notification_id>/read", methods=["PUT"])
@jwt_required()
def mark_read(notification_id):
    current_user_id = get_jwt_identity()
    notif = Notification.query.filter_by(id=notification_id, user_id=current_user_id).first()
    if not notif:
        return jsonify({"error": "Notification not found"}), 404
    notif.mark_as_read()
    return jsonify({"message": "Marked as read"}), 200

# DELETE a notification
@notifications_bp.route("/<int:notification_id>", methods=["DELETE"])
@jwt_required()
def delete_notification(notification_id):
    current_user_id = get_jwt_identity()
    notif = Notification.query.filter_by(id=notification_id, user_id=current_user_id).first()
    if not notif:
        return jsonify({"error": "Notification not found"}), 404
    db.session.delete(notif)
    db.session.commit()
    return jsonify({"message": "Notification deleted"}), 200