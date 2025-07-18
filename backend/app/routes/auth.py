from flask import request, jsonify, Blueprint
from flask_jwt_extended import (
    create_access_token, create_refresh_token, jwt_required,
    get_jwt_identity, get_jwt
)
from app.extensions import db
from app.models.user import User
from utils.decorators import role_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    credential = data.get("credential")  # can be email or phone
    password = data.get("password")

    if not credential or not password:
        return jsonify({"msg": "Phone/email and password are required"}), 400

    # Check if it's a phone number or email
    if "@" in credential:
        user = User.query.filter_by(email=credential).first()
    else:
        user = User.query.filter_by(phone=credential).first()

    if not user or not user.check_password(password):
        return jsonify({"msg": "Invalid credentials"}), 401

    identity = f"user_{user.id}:{user.role}"
    access_token = create_access_token(identity=identity)
    refresh_token = create_refresh_token(identity=identity)

    return jsonify(access_token=access_token, refresh_token=refresh_token), 200


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

@auth_bp.route("/register", methods=["POST"])
@jwt_required()
@role_required(["admin", "lender"])
def register_user():
    data = request.get_json()
    username = data.get("username")
    phone = data.get("phone")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "mama_mboga")

    # Validate required fields
    if not username or not phone or not email or not password:
        return jsonify({"msg": "Username, phone, email, and password are required"}), 400

    # Check for uniqueness
    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already exists"}), 409
    if User.query.filter_by(phone=phone).first():
        return jsonify({"msg": "Phone number already exists"}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email already exists"}), 409

    # Create and save user
    user = User(username=username, phone=phone, email=email, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"msg": "User registered", "id": user.id}), 201

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    # Here you would typically add the JTI to a blacklist which is not implemented in this example
    return jsonify({"msg": "Successfully logged out"}), 200

@auth_bp.route("/logout-all", methods=["POST"])
@jwt_required()
@role_required(["admin"])
def logout_all():
    # This would typically clear the blacklist or invalidate all tokens for the user
    # For simplicity, we are not implementing a blacklist in this example
    return jsonify({"msg": "All sessions logged out"}), 200

# Refresh token endpoint for JWT
@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify(access_token=access_token), 200

