from flask import request, jsonify, Blueprint
from flask_jwt_extended import (
    create_access_token, create_refresh_token, jwt_required,
    get_jwt_identity, get_jwt
)
from app.extensions import db
from app.models.user import User
from utils.decorators import role_required

auth_bp = Blueprint('auth', __name__)

phone_otps = {}  # Temporary in-memory store
email_otps = {} # Temporary in-memory store


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
@role_required(["admin", "lender", "mama_mboga"])
def register_user():
    data = request.get_json()
    username = data.get("username")
    phone = data.get("phone")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "mama_mboga")

    if not username or not phone or not email or not password:
        return jsonify({"msg": "Username, phone, email, and password are required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already exists"}), 409
    if User.query.filter_by(phone=phone).first():
        return jsonify({"msg": "Phone number already exists"}), 409
    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "Email already exists"}), 409

    # Create User
    user = User(username=username, phone=phone, email=email, role=role)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    print(f"[AUDIT LOG] Registered user {user.id} ({role})")

    # If mama_mboga, prompt to complete customer profile
    if role == "mama_mboga":
        return jsonify({
            "msg": "Mama Mboga registered. Please complete your customer profile.",
            "user_id": user.id,
            "next": "/customers/"
        }), 201

    return jsonify({
        "msg": "User registered successfully.",
        "user_id": user.id
    }), 201

@auth_bp.route("/logout", methods=["POST"])
@jwt_required()
def logout():
    jti = get_jwt()["jti"]
    return jsonify({"msg": "Successfully logged out"}), 200

@auth_bp.route("/logout-all", methods=["POST"])
@jwt_required()
@role_required(["admin"])
def logout_all():
    return jsonify({"msg": "All sessions logged out"}), 200

# Refresh token endpoint for JWT
@auth_bp.route("/refresh-token", methods=["POST"])
@jwt_required(refresh=True)
def refresh_token():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify(access_token=access_token), 200

# Password reset functionality
import secrets
from flask import current_app

reset_tokens = {}  # Temporary in-memory store, will use Redis or DB in production

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email_or_phone = data.get("email") or data.get("phone")

    if not email_or_phone:
        return jsonify({"msg": "Email or phone is required"}), 400

    user = User.query.filter(
        (User.email == email_or_phone) | (User.phone == email_or_phone)
    ).first()

    if not user:
        return jsonify({"msg": "No account found"}), 404

    # Generate token (simple random token for now)
    token = secrets.token_urlsafe(32)
    reset_tokens[token] = user.id

    print(f"[RESET TOKEN] {user.email or user.phone} = {token}")

    return jsonify({
        "msg": "Reset token generated. Please check your console (simulated send).",
        "token_preview": token[:5] + "..."
    }), 200

# Reset password endpoint 
@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    token = data.get("token")
    new_password = data.get("new_password")

    if not token or not new_password:
        return jsonify({"msg": "Token and new password are required"}), 400

    user_id = reset_tokens.get(token)
    if not user_id:
        return jsonify({"msg": "Invalid or expired token"}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404

    user.set_password(new_password)
    db.session.commit()

    # Remove token after use
    reset_tokens.pop(token, None)

    print(f"[AUDIT LOG] Password reset for user {user.username} ({user.email})")

    return jsonify({"msg": "Password has been reset successfully"}), 200

# Phone verification functionality
@auth_bp.route("/verify-phone", methods=["POST"])
@jwt_required()
def verify_phone():
    user_id, role = extract_identity()
    user = User.query.get(user_id)

    data = request.get_json()
    phone = data.get("phone")
    otp = data.get("otp")

    if not phone or not otp:
        return jsonify({"msg": "Phone number and OTP are required"}), 400

    expected_otp = phone_otps.get(phone)
    if not expected_otp or otp != expected_otp:
        return jsonify({"msg": "Invalid or expired OTP"}), 400

    if user.phone != phone:
        return jsonify({"msg": "Phone number does not match your account"}), 403

    user.is_phone_verified = True
    db.session.commit()

    phone_otps.pop(phone, None)

    print(f"[AUDIT LOG] User {user.username} verified phone {phone}")

    return jsonify({"msg": "Phone number verified successfully"}), 200

# Send OTP to phone number (simulated for now and will replace with actual SMS service)
@auth_bp.route("/send-phone-otp", methods=["POST"])
@jwt_required()
def send_phone_otp():
    data = request.get_json()
    phone = data.get("phone")

    if not phone:
        return jsonify({"msg": "Phone is required"}), 400

    otp = "123456"  # Replace with random generator later
    phone_otps[phone] = otp
    print(f"[OTP SENT] Phone: {phone}, OTP: {otp}")
    
    return jsonify({"msg": f"OTP sent to {phone}"}), 200

# Extract user ID and role from JWT identity
@auth_bp.route("/verify-email", methods=["POST"])
@jwt_required()
def verify_email():
    user_id, role = extract_identity()
    user = User.query.get(user_id)

    data = request.get_json()
    email = data.get("email")
    otp = data.get("otp")

    if not email or not otp:
        return jsonify({"msg": "Email and OTP are required"}), 400

    expected_otp = email_otps.get(email)
    if not expected_otp or otp != expected_otp:
        return jsonify({"msg": "Invalid or expired OTP"}), 400

    if user.email != email:
        return jsonify({"msg": "Email does not match your account"}), 403

    user.is_email_verified = True
    db.session.commit()

    email_otps.pop(email, None)

    print(f"[AUDIT LOG] User {user.username} verified email {email}")

    return jsonify({"msg": "Email verified successfully"}), 200

# Email verification functionality
@auth_bp.route("/send-email-otp", methods=["POST"])
@jwt_required()
def send_email_otp():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"msg": "Email is required"}), 400

    otp = "654321"  # Replace with random generator later
    email_otps[email] = otp
    print(f"[OTP SENT] Email: {email}, OTP: {otp}")

    return jsonify({"msg": f"OTP sent to {email}"}), 200
