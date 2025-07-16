from flask import request, jsonify
from flask_jwt_extended import create_access_token
from app.extensions import db
from app.models.user import User

from flask import Blueprint
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

    access_token = create_access_token(identity={
        "id": user.id,
        "username": user.username,
        "role": user.role
    })

    return jsonify(access_token=access_token), 200
