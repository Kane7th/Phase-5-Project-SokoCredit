from flask import request, jsonify, Blueprint
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/ping", methods=["GET"])
def ping():
    return {"message": "pong!"}

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        return jsonify({"msg": "Invalid credentials"}), 401

    identity = f"user_{user.id}:{user.role}"
    access_token = create_access_token(identity=identity)

    return jsonify(access_token=access_token), 200

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_profile():
    identity = get_jwt_identity()
    user_id_str, role = identity.split(":")
    user_id = int(user_id_str.replace("user_", ""))

    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "username": user.username,
        "role": user.role
    }), 200