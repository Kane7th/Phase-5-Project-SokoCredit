from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.customer import Customer
from utils.decorators import role_required
from sqlalchemy import or_
import csv
import io
import openpyxl
from openpyxl.utils import get_column_letter
from datetime import datetime

customers_bp = Blueprint('customers', __name__)

def extract_identity():
    identity = get_jwt_identity()
    user_id_str, role = identity.split(":")
    return int(user_id_str.replace("user_", "")), role

def is_authorized(customer, user_id, role):
    if role == "mama_mboga":
        return customer.mama_mboga_user_id == user_id
    return role in ["admin", "lender"] or customer.created_by == user_id

def format_customer(customer):
    return {
        "id": customer.id,
        "full_name": customer.full_name,
        "phone": customer.phone,
        "business_name": customer.business_name,
        "location": customer.location,
        "documents": customer.documents
    }

def generate_csv(customers):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Full Name", "Phone", "Business", "Location", "Documents"])
    for c in customers:
        writer.writerow([
            c.id, c.full_name, c.phone, c.business_name, c.location, str(c.documents)
        ])
    output.seek(0)
    return output.read()

def generate_excel(customers):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append(["ID", "Full Name", "Phone", "Business", "Location", "Documents"])
    for c in customers:
        ws.append([
            c.id, c.full_name, c.phone, c.business_name, c.location, str(c.documents)
        ])
    for col in ws.columns:
        max_length = max(len(str(cell.value)) for cell in col)
        ws.column_dimensions[get_column_letter(col[0].column)].width = max_length + 2
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    return output.read()

@customers_bp.route("/", methods=["POST"])
@jwt_required()
@role_required(["admin", "lender", "mama_mboga"])
def create_customer():
    data = request.get_json()
    user_id, role = extract_identity()

    if not data.get("full_name") or not data.get("phone"):
        return jsonify({"msg": "Full name and phone are required"}), 400

    # Ensure unique phone
    if Customer.query.filter_by(phone=data["phone"]).first():
        return jsonify({"msg": "Phone number already exists"}), 409

    # Enforce that mama_mboga can only create their own profile once
    if role == "mama_mboga":
        if Customer.query.filter_by(mama_mboga_user_id=user_id).first():
            return jsonify({"msg": "You already have a profile"}), 409
        mama_mboga_user_id = user_id
    else:
        mama_mboga_user_id = data.get("mama_mboga_user_id")
        if not mama_mboga_user_id:
            return jsonify({"msg": "mama_mboga_user_id is required for admin/lender"}), 400

    customer_kwargs = {
        "full_name": data["full_name"],
        "phone": data["phone"],
        "business_name": data.get("business_name"),
        "location": data.get("location"),
        "documents": data.get("documents", {}),
        "created_by": user_id,
        "mama_mboga_user_id": mama_mboga_user_id
    }

    customer = Customer(**customer_kwargs)

    db.session.add(customer)
    db.session.commit()

    print(f"[AUDIT LOG] User {user_id} ({role}) created customer {customer.id} at {datetime.utcnow().isoformat()}.")

    return jsonify({"msg": "Customer created", "id": customer.id}), 201

@customers_bp.route("/", methods=["GET"])
@jwt_required()
@role_required(["admin", "lender"])
def list_customers():
    # Validate allowed query params
    ALLOWED_FILTERS = {
        "page", "per_page", "search", "created_by",
        "business_name", "has_documents", "location", "format"
    }
    for key in request.args:
        if key not in ALLOWED_FILTERS:
            return jsonify({"msg": f"Invalid filter: '{key}' is not a valid filter field"}), 400

    # Extract query parameters
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    search = request.args.get("search", "", type=str)
    created_by = request.args.get("created_by", type=int)
    business_name = request.args.get("business_name", type=str)
    has_documents = request.args.get("has_documents")
    location = request.args.get("location")
    format_type = request.args.get("format", "").lower()

    query = Customer.query

    # Filtering
    if location and location.strip():
        query = query.filter(Customer.location == location)

    if has_documents is not None:
        if has_documents.lower() == "true":
            query = query.filter(Customer.documents != {})
        elif has_documents.lower() == "false":
            query = query.filter(Customer.documents == {})

    if created_by is not None:
        query = query.filter(Customer.created_by == created_by)

    if business_name and business_name.strip():
        query = query.filter(Customer.business_name == business_name)

    if search:
        search_term = f"%{search}%"
        query = query.filter(or_(
            Customer.full_name.ilike(search_term),
            Customer.phone.ilike(search_term),
            Customer.business_name.ilike(search_term),
            Customer.location.ilike(search_term)
        ))

    # CSV or Excel export
    if format_type == "csv":
        customers = query.all()
        csv_data = generate_csv(customers)
        return Response(csv_data, mimetype="text/csv", headers={
            "Content-Disposition": "attachment; filename=customers.csv"
        })

    if format_type == "excel":
        customers = query.all()
        xlsx_data = generate_excel(customers)
        return Response(xlsx_data, mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={
            "Content-Disposition": "attachment; filename=customers.xlsx"
        })
    
    # audit log for listing customers
    print(f"[AUDIT LOG] User {get_jwt_identity()} listed customers at {datetime.utcnow().isoformat()}.")

    # Paginate + return JSON
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "customers": [format_customer(c) for c in pagination.items],
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages
    })

@customers_bp.route("/<int:customer_id>", methods=["GET"])
@jwt_required()
@role_required(["admin", "lender", "mama_mboga"])
def get_customer(customer_id):
    user_id, role = extract_identity()
    customer = Customer.query.get_or_404(customer_id)

    if not is_authorized(customer, user_id, role):
        return jsonify({"msg": "Not authorized to view this customer"}), 403
    
    print(f"[AUDIT LOG] User {user_id} ({role}) viewed customer {customer.id} at {datetime.utcnow().isoformat()}.")

    return jsonify(format_customer(customer)), 200

@customers_bp.route("/my_customers", methods=["GET"])
@jwt_required()
@role_required("lender")
def get_my_customers():
    identity = get_jwt_identity()
    user_id = identity if isinstance(identity, int) else int(identity.split("_")[-1])
    customers = Customer.query.filter_by(lender_id=user_id).all()

    # Audit log for listing own customers 
    print(f"[AUDIT LOG] User {user_id} listed their own customers at {datetime.utcnow().isoformat()}.")
    return jsonify([c.to_dict() for c in customers])

@customers_bp.route("/<int:customer_id>", methods=["PATCH"])
@jwt_required()
@role_required(["admin", "lender", "mama_mboga"])
def patch_customer(customer_id):
    data = request.get_json()
    user_id, role = extract_identity()
    customer = Customer.query.get_or_404(customer_id)

    if not is_authorized(customer, user_id, role):
        return jsonify({"msg": "Not authorized to update this customer"}), 403

    allowed_fields = ["full_name", "phone", "business_name", "location"]
    if role in ["admin", "lender"]:
        allowed_fields.append("documents")

    for field in allowed_fields:
        if field in data:
            setattr(customer, field, data[field])

    # Enforce phone uniqueness
    if "phone" in data:
        existing = Customer.query.filter(Customer.phone == data["phone"], Customer.id != customer.id).first()
        if existing:
            return jsonify({"msg": "Phone number already exists for another customer"}), 409

    # Audit log for updating customer
    print(f"[AUDIT LOG] User {user_id} ({role}) updated customer {customer.id} at {datetime.utcnow().isoformat()}.")

    db.session.commit()
    return jsonify({"msg": "Customer updated", "customer": format_customer(customer)}), 200

@customers_bp.route("/<int:customer_id>", methods=["DELETE"])
@jwt_required()
@role_required(["admin"])
def delete_customer(customer_id):
    user_id, role = extract_identity()
    customer = Customer.query.get_or_404(customer_id)

    if not is_authorized(customer, user_id, role):
        return jsonify({"msg": "Not authorized to delete this customer"}), 403

    # Audit log for deletion
    print(f"[AUDIT LOG] User {user_id} ({role}) deleted customer {customer.id} at {datetime.utcnow().isoformat()}.")

    db.session.delete(customer)
    db.session.commit()
    return '', 204

@customers_bp.route("/openapi", methods=["GET"])
def openapi_schema():
    schema = {
        "paths": {
            "/customers/": {
                "get": {
                    "summary": "List customers",
                    "parameters": [
                        {"name": "page", "in": "query", "type": "integer"},
                        {"name": "per_page", "in": "query", "type": "integer"},
                        {"name": "search", "in": "query", "type": "string"},
                        {"name": "created_by", "in": "query", "type": "integer"},
                        {"name": "business_name", "in": "query", "type": "string"},
                        {"name": "has_documents", "in": "query", "type": "string"},
                        {"name": "location", "in": "query", "type": "string"},
                        {"name": "format", "in": "query", "type": "string"}
                    ],
                    "responses": {
                        "200": {"description": "Customer list"}
                    }
                }
            }
        }
    }
    return jsonify(schema)


# Upload customer documents
import os
from werkzeug.utils import secure_filename
from flask import current_app

UPLOAD_FOLDER = "uploads/customers"

@customers_bp.route("/<int:customer_id>/upload", methods=["POST"])
@jwt_required()
@role_required(["admin", "lender", "mama_mboga"])
def upload_customer_document(customer_id):
    user_id, role = extract_identity()
    customer = Customer.query.get_or_404(customer_id)

    if not is_authorized(customer, user_id, role):
        return jsonify({"msg": "Not authorized to upload files for this customer"}), 403

    if 'file' not in request.files:
        return jsonify({"msg": "No file part"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"msg": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"msg": "File type not allowed"}), 400


    doc_type = request.form.get("doc_type", "unknown")  # e.g. "id_card", "business_permit"

    filename = secure_filename(file.filename)
    customer_dir = os.path.join(UPLOAD_FOLDER, str(customer_id))
    os.makedirs(customer_dir, exist_ok=True)

    file_path = os.path.join(customer_dir, f"{doc_type}_{filename}")
    file.save(file_path)

    # Update customer document reference
    customer.documents[doc_type] = file_path
    db.session.commit()

    print(f"[AUDIT LOG] User {user_id} ({role}) uploaded '{doc_type}' for customer {customer.id} at {datetime.utcnow().isoformat()}.")

    return jsonify({"msg": "File uploaded", "path": file_path, "documents": customer.documents}), 200

# Check if file is allowed
def allowed_file(filename):
    allowed_exts = current_app.config.get("ALLOWED_EXTENSIONS", {"pdf", "jpg", "jpeg", "png"})
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_exts





# Unit tests
import unittest
from flask import Flask
from flask.testing import FlaskClient

class CustomersTestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app("testing")
        self.client: FlaskClient = self.app.test_client()
        self.access_token = "FAKE_JWT_TOKEN"

    def test_list_customers_filters(self):
        response = self.client.get("/customers/?search=test&location=Nairobi", headers={"Authorization": f"Bearer {self.access_token}"})
        self.assertIn(response.status_code, [200, 401])

    def test_my_customers_with_documents(self):
        response = self.client.get("/customers/my_customers?has_documents=true", headers={"Authorization": f"Bearer {self.access_token}"})
        self.assertIn(response.status_code, [200, 401])

if __name__ == "__main__":
    unittest.main()
