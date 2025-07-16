from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.customer import Customer

customers_bp = Blueprint('customers', __name__)

@customers_bp.route("/", methods=["GET"])
@jwt_required()
def list_customers():
    all_customers = Customer.query.all()
    result = [
        {
            "id": c.id,
            "full_name": c.full_name,
            "phone": c.phone,
            "business_name": c.business_name,
            "location": c.location
        } for c in all_customers
    ]
    return jsonify(result)

@customers_bp.route("/", methods=["POST"])
@customers_bp.route("", methods=["POST"])
@jwt_required()
def create_customer():
    identity = get_jwt_identity()  # returns: "user_1:admin"
    user_id, role = identity.split(":")
    user_id = int(user_id.replace("user_", ""))

    data = request.get_json()
    customer = Customer(
        full_name=data.get("full_name"),
        phone=data.get("phone"),
        business_name=data.get("business_name"),
        location=data.get("location"),
        documents=data.get("documents", {}),
        created_by=user_id
    )
    db.session.add(customer)
    db.session.commit()
    return jsonify({"msg": "Customer created", "id": customer.id}), 201

