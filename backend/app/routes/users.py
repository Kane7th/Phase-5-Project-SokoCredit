from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.extensions import db
from app.models.user import User
# from app.utils.auth_helpers import extract_identity

users_bp = Blueprint("users_bp", __name__, url_prefix="/api/users")

@users_bp.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    user_id, _ = extract_identity()
    user = User.query.get(user_id)

    data = request.get_json()
    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        return jsonify({"msg": "Current and new passwords are required"}), 400

    if not user or not user.check_password(current_password):
        return jsonify({"msg": "Current password is incorrect"}), 401

    user.set_password(new_password)
    db.session.commit()

    print(f"[AUDIT LOG] User {user.username} changed their password")
    return jsonify({"msg": "Password changed successfully"}), 200
