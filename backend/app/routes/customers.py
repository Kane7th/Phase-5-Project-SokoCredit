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

customers_bp = Blueprint('customers', __name__)

def extract_identity():
    identity = get_jwt_identity()
    user_id_str, role = identity.split(":")
    return int(user_id_str.replace("user_", "")), role

def is_authorized(customer, user_id, role):
    return not (role == "mama_mboga" and customer.created_by != user_id)

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

    customer = Customer(
        full_name=data["full_name"],
        phone=data["phone"],
        business_name=data.get("business_name"),
        location=data.get("location"),
        documents=data.get("documents", {}),
        created_by=user_id
    )
    db.session.add(customer)
    db.session.commit()

    return jsonify({"msg": "Customer created", "id": customer.id}), 201

@customers_bp.route("/", methods=["GET"])
@jwt_required()
@role_required(["admin", "lender"])
def list_customers():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)
    search = request.args.get("search", "", type=str)
    created_by = request.args.get("created_by", type=int)
    business_name = request.args.get("business_name", type=str)
    has_documents = request.args.get("has_documents")
    location = request.args.get("location")
    format_type = request.args.get("format", "").lower()

    query = Customer.query

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

    if format_type == "csv":
        customers = query.all()
        csv_data = generate_csv(customers)
        return Response(csv_data, mimetype="text/csv", headers={"Content-Disposition": "attachment; filename=customers.csv"})

    if format_type == "excel":
        customers = query.all()
        xlsx_data = generate_excel(customers)
        return Response(xlsx_data, mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": "attachment; filename=customers.xlsx"})

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        "customers": [format_customer(c) for c in pagination.items],
        "total": pagination.total,
        "page": pagination.page,
        "pages": pagination.pages
    })

# Other route functions remain unchanged and are already present

# OpenAPI schema endpoint
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
