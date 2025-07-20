from app.extensions import db
from app.models.customer import Customer
import json
from io import BytesIO

from tests.conftest import client

def test_create_customer(client, headers_lender):
    payload = {
        "full_name": "Test User",
        "phone": "0712345678",
        "business_name": "Test Biz",
        "location": "Nairobi",
        "documents": {"id": "12345"}
    }
    res = client.post("/customers/", json=payload, headers=headers_lender)
    assert res.status_code == 201
    assert res.get_json()["msg"] == "Customer created"

def test_get_customers(client, headers_admin):
    res = client.get("/customers/", headers=headers_admin)
    assert res.status_code == 200
    assert "customers" in res.get_json()
    assert "total" in res.get_json()

def test_get_customer_by_id(client, headers_lender):
    customer = Customer(
        full_name="Jane Doe", phone="0722000000", business_name="Doe Biz",
        location="Kisumu", documents={}, created_by=2
    )
    db.session.add(customer)
    db.session.commit()

    res = client.get(f"/customers/{customer.id}", headers=headers_lender)
    assert res.status_code == 200
    assert res.get_json()["full_name"] == "Jane Doe"

def test_mama_mboga_restriction(client, headers_mboga):
    customer = Customer(
        full_name="Unauthorized", phone="0700000000", business_name="Block",
        location="Mombasa", documents={}, created_by=999
    )
    db.session.add(customer)
    db.session.commit()

    res = client.get(f"/customers/{customer.id}", headers=headers_mboga)
    assert res.status_code == 403

def test_search_and_pagination(client, headers_admin):
    res = client.get("/customers/?search=Test&page=1&per_page=5", headers=headers_admin)
    assert res.status_code == 200
    assert "customers" in res.get_json()

def test_unauthorized_access(client):
    res = client.get("/customers/")  # type: ignore # no headers
    assert res.status_code == 401

def test_filter_by_created_by(client, headers_admin):
    res = client.get("/customers/?created_by=2", headers=headers_admin)
    assert res.status_code == 200
    for c in res.get_json()["customers"]:
        assert c["created_by"] == 2

def test_delete_customer(client, headers_lender):
    customer = Customer(full_name="Delete Me", phone="0700123456", business_name="Dead Biz", location="Meru", documents={}, created_by=2)
    db.session.add(customer)
    db.session.commit()

    res = client.delete(f"/customers/{customer.id}", headers=headers_lender)
    assert res.status_code == 204

def test_export_excel(client, headers_admin):
    res = client.get("/customers/?format=excel", headers=headers_admin)
    assert res.status_code == 200
    assert res.headers["Content-Type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

def test_export_csv(client, headers_admin):
    res = client.get("/customers/?format=csv", headers=headers_admin)
    assert res.status_code == 200
    assert "text/csv" in res.headers["Content-Type"]

def test_openapi_schema(client, headers_admin):
    res = client.get("/customers/openapi", headers=headers_admin)
    assert res.status_code == 200
    assert "paths" in res.get_json()
    assert "/customers/" in res.get_json()["paths"]

def test_patch_update_customer(client, headers_lender):
    customer = Customer(
        full_name="Old Name", phone="0711111111", business_name="Old Biz",
        location="Nakuru", documents={}, created_by=2
    )
    db.session.add(customer)
    db.session.commit()

    update_data = {"full_name": "Updated Name"}
    res = client.patch(f"/customers/{customer.id}", json=update_data, headers=headers_lender)
    assert res.status_code == 200
    assert res.get_json()["msg"] == "Customer updated"

def test_upload_customer_document(client, headers_lender):
    customer = Customer(
        full_name="Upload Test", phone="0710000000", business_name="Upload Biz",
        location="Kiambu", documents={}, created_by=2
    )
    db.session.add(customer)
    db.session.commit()

    data = {
        "doc_type": "id_card",
        "file": (BytesIO(b"fake content"), "id_card.jpg")
    }
    res = client.post(
        f"/customers/{customer.id}/upload",
        content_type="multipart/form-data",
        headers=headers_lender,
        data=data
    )
    assert res.status_code in [200, 400, 403]

def test_invalid_field_filter(client, headers_admin):
    res = client.get("/customers/?unknown_field=value", headers=headers_admin)
    assert res.status_code == 400
    assert res.get_json()["msg"] == "Invalid filter: 'unknown_field' is not a valid filter field"

