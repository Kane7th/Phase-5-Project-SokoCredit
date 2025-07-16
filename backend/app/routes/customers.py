from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.customer import Customer
from utils.decorators import role_required

customers_bp = Blueprint('customers', __name__)

# Route to list all customers
@customers_bp.route("/", methods=["GET"])
@jwt_required()
@role_required(["admin", "lender"])
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

# Route to create a new customer
@customers_bp.route("/", methods=["POST"])
@customers_bp.route("", methods=["POST"])
@jwt_required()
@role_required(["admin", "lender", "mama_mboga"])
def create_customer():
    identity = get_jwt_identity() 
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

# Route to update an existing customer
@customers_bp.route("/<int:customer_id>", methods=["PUT"])
@jwt_required()
@role_required(["admin", "lender"])
def update_customer(customer_id):
    identity = get_jwt_identity()
    user_id_str, role = identity.split(":")
    user_id = int(user_id_str.replace("user_", ""))

    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"msg": "Customer not found"}), 404

    data = request.get_json()

    # restrict lenders to only update customers they created
    if role == "lender" and customer.created_by != user_id:
        return jsonify({"msg": "Unauthorized"}), 403

    # Update fields
    customer.full_name = data.get("full_name", customer.full_name)
    customer.phone = data.get("phone", customer.phone)
    customer.business_name = data.get("business_name", customer.business_name)
    customer.location = data.get("location", customer.location)
    customer.documents = data.get("documents", customer.documents)

    db.session.commit()

    return jsonify({"msg": "Customer updated", "id": customer.id}), 200

# Route to delete a customer
@customers_bp.route("/<int:customer_id>", methods=["DELETE"])
@jwt_required()
@role_required(["admin", "lender"])
def delete_customer(customer_id):
    customer = Customer.query.get(customer_id)
    if not customer:
        return jsonify({"msg": "Customer not found"}), 404

    db.session.delete(customer)
    db.session.commit()

    return jsonify({"msg": "Customer deleted"}), 200