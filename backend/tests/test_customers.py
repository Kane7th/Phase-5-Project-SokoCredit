from app.extensions import db
from app.models.customer import Customer
import json


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

def test_customer_by_id_access(client, headers_lender):
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

def test_my_customers_filtered(client, headers_mboga):
    res = client.get("/customers/my_customers?location=Nairobi&has_documents=true", headers=headers_mboga)
    assert res.status_code == 200
    assert "customers" in res.get_json()

def test_export_excel(client, headers_admin):
    res = client.get("/customers/?format=excel", headers=headers_admin)
    assert res.status_code == 200
    assert res.headers["Content-Type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

def test_export_csv(client, headers_admin):
    res = client.get("/customers/?format=csv", headers=headers_admin)
    assert res.status_code == 200
    assert res.headers["Content-Type"] == "text/csv"

def test_openapi_schema(client, headers_admin):
    res = client.get("/customers/openapi", headers=headers_admin)
    assert res.status_code == 200
    assert "paths" in res.get_json()
    assert "/customers/" in res.get_json()["paths"]

def test_update_customer(client, headers_lender):
    customer = Customer(
        full_name="Old Name", phone="0711111111", business_name="Old Biz",
        location="Nakuru", documents={}, created_by=2
    )
    db.session.add(customer)
    db.session.commit()

    update_data = {"full_name": "Updated Name"}
    res = client.put(f"/customers/{customer.id}", json=update_data, headers=headers_lender)
    assert res.status_code == 200
    assert res.get_json()["msg"] == "Customer updated"

def test_delete_customer(client, headers_lender):
    customer = Customer(
        full_name="Delete Me", phone="0700001111", business_name="Gone Biz",
        location="Thika", documents={}, created_by=2
    )
    db.session.add(customer)
    db.session.commit()

    res = client.delete(f"/customers/{customer.id}", headers=headers_lender)
    assert res.status_code == 200
    assert res.get_json()["msg"] == "Customer deleted"

def test_customer_documents_crud(client, headers_lender):
    customer = Customer(
        full_name="Doc Test", phone="0777777777", business_name="Doc Biz",
        location="Embu", documents={}, created_by=2
    )
    db.session.add(customer)
    db.session.commit()

    doc_update = {"documents": {"license": "abc123"}}
    put_res = client.put(f"/customers/{customer.id}/documents", json=doc_update, headers=headers_lender)
    assert put_res.status_code == 200
    assert put_res.get_json()["msg"] == "Customer documents updated"

    get_res = client.get(f"/customers/{customer.id}/documents", headers=headers_lender)
    assert get_res.status_code == 200
    assert get_res.get_json()["license"] == "abc123"

    del_res = client.delete(f"/customers/{customer.id}/documents", headers=headers_lender)
    assert del_res.status_code == 200
    assert del_res.get_json()["msg"] == "Customer documents deleted"

def test_invalid_field_filter(client, headers_admin):
    res = client.get("/customers/by_invalid_field/value", headers=headers_admin)
    assert res.status_code == 400
    assert res.get_json()["msg"] == "Invalid field"
